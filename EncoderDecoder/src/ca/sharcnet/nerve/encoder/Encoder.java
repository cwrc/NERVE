package ca.sharcnet.nerve.encoder;

import ca.fa.utility.*;
import static ca.sharcnet.nerve.Constants.*;
import ca.sharcnet.nerve.context.*;
import ca.sharcnet.nerve.docnav.*;
import ca.sharcnet.nerve.docnav.dom.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import javax.xml.parsers.ParserConfigurationException;
import ca.sharcnet.nerve.HasStreams;
import static ca.sharcnet.nerve.context.Context.NameSource.*;
import ca.sharcnet.nerve.docnav.query.Query;
import ca.sharcnet.nerve.docnav.schema.Schema;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchemaLoader;
import java.io.BufferedInputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.Properties;
import java.util.zip.GZIPInputStream;
import org.json.JSONObject;

public class Encoder {

    private final Context context;
    private final SQL sql;
    private final Classifier classifier;
    private Schema schema = null;
    private Document document = null;

    public static Document encode(Document document, HasStreams hasStreams) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ClassifierException, ParserConfigurationException {
        /* connect to SQL */
        Properties config = new Properties();
        InputStream cfgStream = hasStreams.getResourceStream("config.txt");
        config.load(cfgStream);
        SQL sql = new SQL(config);

        /* build classifier */
        InputStream cStream = hasStreams.getResourceStream("english.all.3class.distsim.crf.ser.gz");
        BufferedInputStream bis = new BufferedInputStream(new GZIPInputStream(cStream));
        Classifier classifier = new Classifier(bis);
        cStream.close();

        /* retrieve the schema url to set the context (or use context instruction node) */
        Context context = null;
        Query model = document.query(NodeType.INSTRUCTION).filter(SCHEMA_NODE_NAME);
        String schemaURL = model.attr(SCHEMA_NODE_ATTR);

        switch (model.attr(SCHEMA_NODE_ATTR)) {
            case "orlando_biography_v2.rng":
                context = ContextLoader.load(hasStreams.getResourceStream("contexts/orlando.context.json"));
                break;
            case "contexts/cwrc.context.json":
                context = ContextLoader.load(hasStreams.getResourceStream("contexts/cwrc.context.json"));
                break;
            case "contexts/tei.context.json":
                context = ContextLoader.load(hasStreams.getResourceStream("contexts/tei.context.json"));
                break;
            default:
                /* if there is no schema node, look for a context node (mostly for debugging/testing) */
                Query qContext = document.query(NodeType.INSTRUCTION).filterf("%s[%s]", CONTEXT_NODE_NAME, CONTEXT_NODE_ATTR);
                if (qContext.isEmpty()) throw new RuntimeException("Context node not found.");
                String path = "contexts/" + qContext.attr("name");
                context = ContextLoader.load(hasStreams.getResourceStream(path));
                break;
        }

        Encoder encoder = new Encoder(document, context, sql, classifier);

        /** add the schema, the schema url in the context takes precedence **/
        if (!context.getSchemaName().isEmpty()) schemaURL = context.getSchemaName();
        InputStream schemaStream = new URL(schemaURL).openStream();
        Schema schema = RelaxNGSchemaLoader.schemaFromStream(schemaStream);
        encoder.setSchema(schema);

        return encoder.encode();
    }

    public Encoder(Document document, Context context, SQL sql, Classifier classifier) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {
        if (document == null) throw new NullPointerException();
        if (context == null) throw new NullPointerException();

        this.sql = sql;
        this.context = context;
        this.document = document;
        this.classifier = classifier;
    }

    public Document encode() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        if (this.sql != null) lookupTag();
        if (this.classifier != null) processNER(document);

        wrapTags(document);

        /* put the context name into the schema(xml-model) node, or the context node */
        Query query = document.queryf("[%1$s='%2$s'], [%1$s='%3$s']", ORG_TAGNAME, SCHEMA_NODE_NAME, CONTEXT_NODE_NAME);
        query.first().attr(CONTEXT_ATTRIBUTE, context.getName());
        return document;
    }

    public void setSchema(Schema schema) {
        this.schema = schema;
    }

    private void lookupTag() throws SQLException {
        List<String> dictionaries = context.readFromDictionary();

        StringBuilder builder = new StringBuilder();
        if (dictionaries.size() > 0) {
            builder.append("collection = \"").append(dictionaries.get(0)).append("\" ");
            for (int i = 1; i < dictionaries.size(); i++) {
                builder.append(" OR collection = \"").append(dictionaries.get(i)).append("\" ");
            }
        }

        String query = "select * from dictionary";
        if (builder.length() > 0) query = String.format("select * from dictionary where %s", builder.toString());

        StringMatch knownEntities = new StringMatch();
        SQLResult sqlResult = sql.query(query);

        for (int i = 0; i < sqlResult.size(); i++) {
            SQLRecord row = sqlResult.get(i);
            knownEntities.addCandidate(row.get("entity"), row);
        }
        lookupTag(document, knownEntities);
    }

    private void lookupTag(Node node, StringMatch knownEntities) {
        if (node == null) throw new NullPointerException("ElementNode 'node' is null.");

        /* return if the element node is already tagged */
        if (context.tags().containsKey(node.name())) return;

        /* for all child nodes, process TEXT nodes, recurse ELEMENT nodes */
        for (Node child : node.childNodes()) {
            if (child.getType() == NodeType.TEXT) {
                lookupTag((TextNode) child, knownEntities);
            } else if (child.getType() == NodeType.ELEMENT) {
                lookupTag(child, knownEntities);
            }
        }
    }

    private void lookupTag(TextNode child, StringMatch knownEntities) {
        String innerText = child.getText();
        final NodeList newNodes = new NodeList();

        /* choose the largest matching known entity */
        OnAccept onAccept = (string, row) -> {
            TagInfo tagInfo = context.getTagInfo(row.get("tag"), DICTIONARY);

            /* verify the schema */
            if (schema != null && !schema.isValid(child.getParent(), tagInfo.name)) {
                newNodes.add(new TextNode(string));
            } else {
                Node elementNode = new ElementNode(tagInfo.name, string);
                String lemmaAttribute = context.getTagInfo(row.get("tag"), DICTIONARY).lemmaAttribute;
                if (!lemmaAttribute.isEmpty()) elementNode.attr(lemmaAttribute, row.get("lemma"));

                String linkAttribute = context.getTagInfo(row.get("tag"), DICTIONARY).linkAttribute;
                if (!linkAttribute.isEmpty()) elementNode.attr(linkAttribute, row.get("link"));
                newNodes.add(elementNode);
            }
        };

        OnReject onReject = (string) -> {
            newNodes.add(new TextNode(string));
        };

        knownEntities.seekLine(innerText, onAccept, onReject);
        child.replaceWith(newNodes);
    }

    /**
     * @param node the node to wrap
     * @param allowEntities if false wrap all child tags as if they are
     * non-entity tags
     * @throws ClassNotFoundException
     * @throws InstantiationException
     * @throws IllegalAccessException
     * @throws IOException
     * @throws SQLException
     */
    private void wrapTags(Node node) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {

        if (node.isType(NodeType.DOCTYPE)) {
            Node eNode = new ElementNode(HTML_TAGNAME);
            eNode.attr("class", HTML_DOCTYPE);
            DoctypeNode dNode = (DoctypeNode) node;
            eNode.attr(new Attribute(DOCTYPE_INNERTEXT, dNode.toString()));
            node.replaceWith(eNode);
            return;
        }

        JSONObject jsonObj = new JSONObject();
        for (Attribute attr : node.getAttributes()) {
            jsonObj.put(attr.getKey(), attr.getValue());
        }
        node.clearAttributes();

        Node eNode = node;
        if (node.isType(NodeType.INSTRUCTION)) {
            eNode = new ElementNode(HTML_TAGNAME);
            node.replaceWith(eNode);
            eNode.attr("class", HTML_PROLOG);
        } else if (context.hasTagInfo(node.name(), NAME)) {
            node.attr("class", HTML_ENTITY);
        } else {
            node.attr("class", HTML_NONENTITY);
            for (Node child : eNode.childNodes()) {
                wrapTags(child);
            }
        }

        eNode.attr(XML_ATTR_LIST, jsonObj.toString());
        eNode.attr(ORG_TAGNAME, node.name());
        eNode.name(HTML_TAGNAME);
    }

    private void processNER(Node node) throws ParserConfigurationException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException {
        /* if the node is specifically excluded or it's already considered tagged exit */
        if (context.isTagName(node.name())) return;

        /* for all child element nodes recurse   */
        /* for all child text nodes, perform NER */
        NodeList children = node.childNodes();
        for (Node current : children) {
            if (current.getType() == NodeType.ELEMENT) {
                processNER(current);
            } else if (current.isType(NodeType.TEXT)) {
                /* get a nodelist, zero or more of which will be element nodes, which in turn represent found entities */
                TextNode tNode = (TextNode) current;
                NodeList nerList = applyNamedEntityRecognizer(tNode.getText());

                /* for each element node in the list ensure the path is valid, otherwise convert it to a text node */
                for (int i = 0; i < nerList.size(); i++) {
                    Node nerNode = nerList.get(i);
                    if (!nerNode.isType(NodeType.ELEMENT)) continue;
                    Node eNode = (Node) nerNode;
                    if (schema != null && !schema.isValid(node, eNode.name())) {
                        TextNode textNode = new TextNode(eNode.innerText());
                        nerList.set(i, textNode);
                    }
                }

                /* Go through the nodes in the node list and change the names */
                /* from dictionary to context taginfo name.                   */
                for (Node nerNode : nerList) {
                    String nodeName = nerNode.name();
                    if (nerNode.getType() == NodeType.ELEMENT && context.hasTagInfo(nodeName, NERMAP)) {
                        Node nerElementNode = (Node) nerNode;
                        TagInfo tagInfo = context.getTagInfo(nodeName, NERMAP);
                        nerElementNode.name(tagInfo.name);
                    }
                }

                /* replace the current node with the node list */
                if (nerList.size() > 0) current.replaceWith(nerList);
            }
        }
    }

    private NodeList applyNamedEntityRecognizer(String text) throws ParserConfigurationException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException {
        /* at least one alphabet character upper or lower case */
        String matchRegex = "([^a-zA-z]*[a-zA-z]+[^a-zA-z]*)+";

        /* if there is not at least one alphabet character, retuern an empty list */
        if (text == null || text.isEmpty() || !text.matches(matchRegex)) return new NodeList();

        /* classify the text and put it in a fragment tag */
        text = classifier.classify("<fragment>" + text + "</fragment>");
        if (text.isEmpty()) return new NodeList();

        /* create a document out of the text */
        Document localDoc = DocumentLoader.documentFromString(text);
        NodeList nodes = localDoc.query("*");

        /* for each node in the document (from above) if it's an NER node     */
 /* change it's tagname to a valid tag name occording to the context   */
 /* and set it's lemma if it doens't already have one.                 */
 /* ensure that the node has the default attributes                    */
        for (Node node : nodes) {
            /* if node name is an NER tag name */
            if (context.isNERMap(node.name())) {
                TagInfo tagInfo = context.getTagInfo(node.name(), NERMAP);
                node.name(tagInfo.name);
                if (!tagInfo.lemmaAttribute.isEmpty()) {
                    Node eNode = (Node) node;
                    eNode.attr(new Attribute(tagInfo.lemmaAttribute, eNode.innerText()));
                }
            }
        }

        Node eNode = localDoc.childNodes().get(0);
        NodeList childNodes = eNode.childNodes();
        return childNodes;
    }
}
