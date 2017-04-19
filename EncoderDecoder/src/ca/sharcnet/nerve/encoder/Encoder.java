package ca.sharcnet.nerve.encoder;
import ca.sharcnet.nerve.Constants;
import ca.fa.utility.sql.SQL;
import ca.sharcnet.nerve.context.*;
import ca.sharcnet.nerve.docnav.*;
import ca.sharcnet.nerve.docnav.dom.*;
import static ca.sharcnet.nerve.docnav.dom.NodeType.*;
import ca.sharcnet.nerve.docnav.selector.Select;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONArray;
import org.json.JSONObject;
import ca.sharcnet.nerve.HasStreams;
import static ca.sharcnet.nerve.context.Context.NameSource.DICTIONARY;
import static ca.sharcnet.nerve.context.Context.NameSource.NERMAP;
import static ca.sharcnet.nerve.context.Context.NameSource.TAGINFO;
import ca.sharcnet.nerve.docnav.schema.Schema;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchemaLoader;
import java.io.BufferedInputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.Properties;
import java.util.zip.GZIPInputStream;

public class Encoder {
    private final Context context;
    private final SQL sql;
    private final Classifier classifier;
    private Schema schema = null;
    private Document document = null;

    public static Document encode(Document document, HasStreams hasStreams) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ClassifierException, ParserConfigurationException{
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

        /* check document for schema to set the context */
        InstructionNode iNode = document.getInstructionNode("xml-model");
        if (iNode == null) throw new RuntimeException("Instruction node 'xml-model' not found");

        Context context = null;
        if (iNode.getType() == NodeType.INSTRUCTION) {
            AttributeNode aNode = iNode;
            if (aNode.hasAttribute("href")) {
                Attribute attr = aNode.getAttribute("href");
                String value = attr.getValue();

                if (value.contains("orlando_biography_v2.rng")) {
                    context = ContextLoader.load(hasStreams.getResourceStream("contexts/orlando.context.json"));
                } else if (value.contains("cwrc_entry.rng")) {
                    context = ContextLoader.load(hasStreams.getResourceStream("contexts/cwrc.context.json"));
                } else if (value.contains("cwrc_tei_lite.rng")) {
                    context = ContextLoader.load(hasStreams.getResourceStream("contexts/tei.context.json"));
                } else{
                    throw new RuntimeException("Unknown context '" + value + "'");
                }
            } else {
                throw new RuntimeException("xml-model node missing href attribute");
            }
        }

        Encoder encoder = new Encoder(document, context, sql, classifier);

        /** add the schema **/
        String schemaURL = context.schemaName;
        if (schemaURL != null && !schemaURL.isEmpty()) {
            InputStream schemaStream = new URL(schemaURL).openStream();
            Schema schema = RelaxNGSchemaLoader.schemaFromStream(schemaStream);
            encoder.setSchema(schema);
        }

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
        wrapTag(document);

        Select selected = document.select().attribute(Constants.ORIGINAL_TAGNAME_ATTR, "xml-model");
        selected.get(0).addAttribute(Constants.CONTEXT_ATTRIBUTE, context.name);

        return document;
    }

    public void setSchema(Schema schema) {
        this.schema = schema;
    }

    private void lookupTag() throws SQLException {
        List<String> dictionaries = context.readFromDictionary();

        StringBuilder builder = new StringBuilder();
        if (dictionaries.size() > 0){
            builder.append("collection = \"").append(dictionaries.get(0)).append("\" ");
            for (int i = 1 ; i < dictionaries.size(); i++){
                builder.append(" OR collection = \"").append(dictionaries.get(i)).append("\" ");
            }
        }

        String query = "select * from dictionary";
        if (builder.length() > 0) query = String.format("select * from dictionary where %s", builder.toString());

        StringMatch knownEntities = new StringMatch();
        JSONArray sqlResult = sql.query(query);

        for (int i = 0; i < sqlResult.length(); i++) {
            JSONObject row = sqlResult.getJSONObject(i);
            knownEntities.addCandidate(row.getString("entity"), row);
        }
        lookupTag(document, knownEntities);
    }

    private void lookupTag(ElementNode node, StringMatch knownEntities) {
        if (node == null) throw new NullPointerException("ElementNode 'node' is null.");

        /* return if the element node is already tagged */
        if (context.tags().containsKey(node.getName())) return;

        /* for all child nodes, process TEXT nodes, recurse ELEMENT nodes */
        for (Node child : node.childNodes()) {
            if (child.getType() == NodeType.TEXT) {
                lookupTag((TextNode) child, knownEntities);
            } else if (child.getType() == NodeType.ELEMENT) {
                lookupTag((ElementNode) child, knownEntities);
            }
        }
    }

    private void lookupTag(TextNode child, StringMatch knownEntities) {
        String innerText = child.getText();
        final NodeList<Node> newNodes = new NodeList<>();

        /* choose the largest matching known entity */
        OnAccept onAccept = (string, row) -> {
            System.out.println(row.getString("tag"));
            TagInfo tagInfo = context.getTagInfo(row.getString("tag"), DICTIONARY);

            /* verify the schema */
            if (schema != null && !schema.isValid(child.getParent(), tagInfo.name)) {
                newNodes.add(new TextNode(string));
            } else {
                ElementNode elementNode = new ElementNode(tagInfo.name, string);
                String lemmaAttribute = context.getTagInfo(row.getString("tag"), DICTIONARY).lemmaAttribute;
                if (!lemmaAttribute.isEmpty()) elementNode.addAttribute(lemmaAttribute, row.getString("lemma"));

                String linkAttribute = context.getTagInfo(row.getString("tag"), DICTIONARY).linkAttribute;
                if (!linkAttribute.isEmpty()) elementNode.addAttribute(linkAttribute, row.getString("link"));
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
    private void wrapTag(Node node) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {
        if (!node.isType(DOCUMENT, ELEMENT, INSTRUCTION, DOCTYPE)) return;

        if (node.isType(NodeType.DOCTYPE)) {
            ElementNode eNode = new ElementNode(Constants.HTML_TAGNAME);
            eNode.addAttribute("class", Constants.HTML_DOCTYPE_CLASSNAME);
            DoctypeNode dNode = (DoctypeNode) node;
            eNode.addAttribute(new Attribute(Constants.DOCTYPE_INNERTEXT, dNode.toString()));
            node.replaceWith(eNode);
            return;
        }

        AttributeNode attrNode = (AttributeNode) node;
        JSONObject jsonObj = new JSONObject();
        for (Attribute attr : attrNode.getAttributes()){
            jsonObj.put(attr.getKey(), attr.getValue());
        }
        attrNode.clearAttributes();

        if (node.isType(NodeType.INSTRUCTION)) {
            ElementNode eNode = new ElementNode(Constants.HTML_TAGNAME);
            attrNode = (AttributeNode) attrNode.replaceWith(eNode);
            eNode.addAttribute("class", Constants.HTML_PROLOG_CLASSNAME);
        } else if (context.hasTagInfo(node.getName(), TAGINFO)) {
            attrNode.addAttribute("class", Constants.HTML_ENTITY_CLASSNAME);
        } else {
            attrNode.addAttribute("class", Constants.HTML_NONENTITY_CLASSNAME);
            ElementNode eNode = (ElementNode) attrNode;
            for (Node child : eNode.childNodes()) {
                wrapTag(child);
            }
        }

        attrNode.addAttribute(Constants.XML_ATTR_LIST, jsonObj.toString());
        attrNode.addAttribute(Constants.ORIGINAL_TAGNAME_ATTR, node.getName());
        attrNode.setName(Constants.HTML_TAGNAME);
    }

    private void processNER(ElementNode node) throws ParserConfigurationException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException {
        if (context == null) throw new NullPointerException("Context is null.");
        if (node == null) throw new NullPointerException("ElementNode 'node' is null.");

        /* if the node is specifically excluded or it's already considered tagged exit */
        if (context.isTagName(node.getName())) return;

        /* for all child element nodes recurse   */
        /* for all child text nodes, perform NER */
        NodeList<Node> children = node.childNodes();
        for (Node current : children) {
            if (current.getType() == NodeType.ELEMENT) {
                processNER((ElementNode) current);
            } else if (current.getType() == NodeType.TEXT) {
                /* get a nodelist, zero or more of which will be element nodes, which in turn represent found entities */
                TextNode tNode = (TextNode) current;
                NodeList<Node> nerList = applyNamedEntityRecognizer(tNode.getText());

                /* for each element node in the list ensure the path is valid, otherwise convert it to a text node */
                for (int i = 0; i < nerList.size(); i++) {
                    Node nerNode = nerList.get(i);
                    if (!nerNode.isType(NodeType.ELEMENT)) continue;
                    ElementNode eNode = (ElementNode) nerNode;
                    if (schema != null && !schema.isValid(node, eNode.getName())) {
                        TextNode textNode = new TextNode(eNode.innerText());
                        nerList.set(i, textNode);
                    }
                }

                /* Go through the nodes in the node list and change the names */
                /* from dictionary to context taginfo name.                   */
                for (Node nerNode : nerList) {
                    if (nerNode.getType() == NodeType.ELEMENT) {
                        ElementNode nerElementNode = (ElementNode) nerNode;
                        TagInfo tagInfo = context.getTagInfo(nerElementNode.getName(), NERMAP);
                        nerElementNode.setName(tagInfo.name);
                    }
                }

                /* replace the current node with the node list */
                if (nerList.size() > 0) current.replaceWith(nerList);
            }
        }
    }

    private NodeList<Node> applyNamedEntityRecognizer(String text) throws ParserConfigurationException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException {
        /* at least one alphabet character upper or lower case */
        String matchRegex = "([^a-zA-z]*[a-zA-z]+[^a-zA-z]*)+";

        /* if there is not at least one alphabet character, retuern an empty list */
        if (text == null || text.isEmpty() || !text.matches(matchRegex)) return new NodeList<>();

        /* classify the text and put it in a fragment tag */
        text = classifier.classify("<fragment>" + text + "</fragment>");
        if (text.isEmpty()) return new NodeList<>();

        /* create a document out of the text */
        Document localDoc = DocumentLoader.documentFromString(text);
        NodeList<ElementNode> nodes = localDoc.select().all();

        /* for each node in the document (from above) if it's an NER node     */
        /* change it's tagname to a valid tag name occording to the context   */
        /* and set it's lemma if it doens't already have one.                 */
        /* ensure that the node has the default attributes                    */
        for (Node node : nodes) {
            /* if node name is an NER tag name */
            if (context.isNERMap(node.getName())){
                TagInfo tagInfo = context.getTagInfo(node.getName(), NERMAP);
                node.setName(tagInfo.name);
                if (!tagInfo.lemmaAttribute.isEmpty()){
                    ElementNode eNode = (ElementNode) node;
                    eNode.addAttribute(new Attribute(tagInfo.lemmaAttribute, eNode.innerText()));
                }
            }
        }

        ElementNode eNode = (ElementNode) localDoc.childNodes().get(0);
        NodeList<Node> childNodes = eNode.childNodes();
        return childNodes;
    }
}