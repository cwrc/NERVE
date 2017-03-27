package ca.sharcnet.nerve.encoder;

import ca.fa.utility.SQLHelper;
import ca.fa.utility.collections.SimpleCollection;
import ca.sharcnet.nerve.context.*;
import ca.sharcnet.nerve.decode.Decoder;
import static ca.sharcnet.nerve.encoder.Encoder.TRACES.*;
import ca.sharcnet.nerve.docnav.*;
import ca.sharcnet.nerve.docnav.dom.*;
import ca.sharcnet.nerve.docnav.dom.Node.NodeType;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.logging.Logger;
import static java.util.logging.Logger.getLogger;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONArray;
import org.json.JSONObject;

public class Encoder {

    public enum TRACES {
        METHOD, EXCEPTION, DEBUG, SQL, PRINT_FINAL, BRANCH
    };
    public static final TRACES[] activeTraces = {};

    public static final void trace(TRACES type, String text) {
        Logger logger = getLogger(Decoder.class.getName());
        if (Arrays.asList(activeTraces).contains(type)) {
            StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
            String filename = stackTrace[2].getFileName();
            int line = stackTrace[2].getLineNumber();
//            logger.info(Thread.currentThread().getName() + " " + filename + " " + line + " : " + text);
            System.out.println(Thread.currentThread().getName() + " " + filename + " " + line + " : " + text);
        }
    }

    /* --- end of trace --- */
    public enum Parameter {
        ADD_ID, NER, ENCODE_PROCESS, COMMENT_META, LOOKUP_TAG, LOOKUP_LEMMA, LOOKUP_LINK, OVERWRITE_LEMMA, OVERWRITE_LINK,
        EXTRACT_LEMMAS, DECODE_PROCESS, UNCOMMENT_META, RETAIN_ALIAS, ADD_DEBUG_ATTR
        /* included from decoder to prevent exception */
    };

    private final SimpleCollection<Parameter> parameters = new SimpleCollection<>();
    private final InputStream inputStream;
    private final Context context;
    private final HtmlLabels htmlLabels;
    private final SQLHelper sql;
    private final Classifier classifier;
    private Schema schema = null;
    private Document document;

    public Encoder(InputStream stream, Context context, SQLHelper sql, Classifier classifier) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {
        trace(METHOD, "Encoder()");

        if (stream == null) throw new NullPointerException();
        if (context == null) throw new NullPointerException();
        if (sql == null) throw new NullPointerException();
        if (classifier == null) throw new NullPointerException();

        this.sql = sql;
        this.context = context;
        this.htmlLabels = context.htmlLables();
        this.inputStream = stream;
        this.classifier = classifier;
    }

    public Encoder(InputStream stream, Context context, SQLHelper sql) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {
        trace(METHOD, "Encoder()");

        if (stream == null) throw new NullPointerException();
        if (context == null) throw new NullPointerException();
        if (sql == null) throw new NullPointerException();

        this.sql = sql;
        this.context = context;
        this.htmlLabels = context.htmlLables();
        this.inputStream = stream;
        this.classifier = null;

        trace(METHOD, " : Encoder()");
    }

    public void checkContext() {
        trace(METHOD, "checkContext()");

        if (context.getTagPrefix() == null) {
            trace(BRANCH, " - context.getTagPrefix() == null");
            throw new RuntimeException("tagNameRules.prefix in context file is missing");
        }

        if (context.getTagPrefix().isEmpty()) {
            trace(BRANCH, " - context.getTagPrefix().isEmpty()");

            throw new RuntimeException("tagNameRules.prefix in context file is empty");
        }

        if (context.getAttrPrefix() == null) {
            trace(BRANCH, " - context.getAttrPrefix() == null");
            throw new RuntimeException("tagNameRules.attribute in context file is missing");
        }

        if (context.getAttrPrefix().isEmpty()) {
            trace(BRANCH, " - context.getAttrPrefix().isEmpty()");
            throw new RuntimeException("tagNameRules.attribute in context file is empty");
        }

        if (context.getTagPrefix().toLowerCase().equals(context.getAttrPrefix().toLowerCase())) {
            trace(BRANCH, " - context.getTagPrefix().toLowerCase().equals(context.getAttrPrefix().toLowerCase())");
            throw new RuntimeException("tagNameRules.attribute == tagNameRules.prefix in context (case insensative)");
        }

        trace(METHOD, " : checkContext()");
    }

    public void encode(OutputStream outStream) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        trace(METHOD, "encode()");
        checkContext();

        if (outStream == null) throw new NullPointerException();
        document = DocumentNavigator.documentFromStream(inputStream);

        lookupTag();
        processNER(document);
        commentMeta();
        process();

        outStream.write(document.toString().getBytes());
    }

    public void oldencode(OutputStream outStream) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        trace(METHOD, "encode()");
        checkContext();

        if (outStream == null) {
            trace(BRANCH, " - outStream == null) ");
            throw new NullPointerException();
        }

        document = DocumentNavigator.documentFromStream(inputStream);

        if (parameters.contains(Parameter.LOOKUP_TAG)) {
            trace(BRANCH, " - parameters.contains(Parameter.LOOKUP_TAG)");
            lookupTag();
        }
        if (parameters.contains(Parameter.LOOKUP_LEMMA)) {
            trace(BRANCH, " - parameters.contains(Parameter.LOOKUP_LEMMA)");
            lookupLemma(document);
        }
        if (context != null && parameters.contains(Parameter.NER)) {
            trace(BRANCH, " - context != null && parameters.contains(Parameter.NER)");
            processNER(document);
        }
        if (parameters.contains(Parameter.LOOKUP_LINK)) {
            trace(BRANCH, " - parameters.contains(Parameter.LOOKUP_LINK)");
            lookupLink(document);
        }
        if (parameters.contains(Parameter.ADD_ID)) {
            trace(BRANCH, " - parameters.contains(Parameter.ADD_ID)");
            addUID(document);
        }
        if (parameters.contains(Parameter.COMMENT_META)) {
            trace(BRANCH, " - parameters.contains(Parameter.COMMENT_META)");
            commentMeta();
        }
        if (parameters.contains(Parameter.ENCODE_PROCESS)) {
            trace(BRANCH, " - parameters.contains(Parameter.ENCODE_PROCESS)");
            process();
        }
        trace(BRANCH, " - else");
        outStream.write(document.toString().getBytes());

        trace(PRINT_FINAL, document.toString());
        trace(METHOD, " : encode()");
    }

    public void setSchema(Schema schema) {
        trace(METHOD, "setSchema()");
        this.schema = schema;
    }

    /**
    Include one or more parameters that alter the behaviour of the encoder.<br>
    <ul>
    <li> NER : automatically add NER markup to the text before processing.
    <li> NO_PROCESSING : do not wrap tags with proprietory html markup.
    <li> COMMENT_META : wrap all meta-data tags with comment tags.
    <li> NO_ID : during processing, do not assign a unique identifier.
    </ul>
    @param parameters
     */
    public void setParameters(Encoder.Parameter... parameters) {
        if (parameters == null || parameters.length == 0) return;
        this.parameters.addAll(Arrays.asList(parameters));
    }

    public void setParameters(Enumeration<String> parameterNames) {
        trace(METHOD, "setParameters()");
        while (parameterNames.hasMoreElements()) {
            String nextElement = parameterNames.nextElement();

            /* ensure the parameter exists */
            for (Encoder.Parameter p : Encoder.Parameter.values()) {
                if (p.name().equals(nextElement)) {
                    trace(BRANCH, " - p.name().equals(nextElement)");

                    this.parameters.add(Encoder.Parameter.valueOf(nextElement));
                    break;
                }
            }
        }
    }

    private void lookupTag() throws SQLException {
        trace(METHOD, "lookupTag()");
        String dictionaries = context.readFromDictionarySQLString();
        if (!dictionaries.isEmpty()) dictionaries = "where " + dictionaries;
        String query = String.format("select * from dictionary %s", dictionaries);
        trace(SQL, query);
        StringMatch knownEntities = new StringMatch();

        JSONArray sqlResult = sql.queryToJSONArray(query);

        for (int i = 0; i < sqlResult.length(); i++) {
            JSONObject row = sqlResult.getJSONObject(i);
            knownEntities.addCandidate(row.getString("entity"), row);
        }
        lookupTag(document, knownEntities);
    }

    private void lookupTag(ElementNode node, StringMatch knownEntities) {
        trace(METHOD, "lookupTag(ElementNode, StringMatch)");
        if (node == null) throw new NullPointerException("ElementNode 'node' is null.");

        /* return if the element node is already tagged */
        if (context.isTagName(node.getName())) return;

        /* for all child nodes, process TEXT nodes, recurse ELEMENT nodes */
        for (Node child : node.childNodes()) {
            if (child.getType() == Node.NodeType.TEXT) {
                trace(BRANCH, " - child.getType() == Node.NodeType.TEXT");
                lookupTag((TextNode) child, knownEntities);
            } else if (child.getType() == Node.NodeType.ELEMENT) {
                trace(BRANCH, " - child.getType() == Node.NodeType.ELEMENT");
                lookupTag((ElementNode) child, knownEntities);
            }
        }
    }

    private void lookupTag(TextNode child, StringMatch knownEntities) {
        trace(METHOD, "lookupTag('" + child.innerText().replace("\n", "\\n") + "':TextNode, StringMatch)");
        String innerText = child.innerText();

        final NodeList<Node> newNodes = new NodeList<>();

        /* choose the largest matching known entity */
        knownEntities.seekLine(
            innerText,
            (string, row) -> {
                TagInfo tagInfo = context.getTagInfo(row.getString("tag"));
                ElementNode elementNode = new ElementNode(tagInfo.getName(), string);

                NodePath path = child.getNodePath();
                path.add(elementNode);

                if (schema != null && !schema.isValidPath(path)) {/* verify the schema */
                    trace(BRANCH, " - schema != null && !schema.isValidPath(path)");

                    newNodes.add(new TextNode(string));
                } else {
                    String lemmaAttribute = context.getTagInfo(row.getString("tag")).getLemmaAttribute();
                    if (!lemmaAttribute.isEmpty()) elementNode.addAttribute(lemmaAttribute, row.getString("lemma"));

                    String linkAttribute = context.getTagInfo(row.getString("tag")).getLinkAttribute();
                    if (!linkAttribute.isEmpty()) elementNode.addAttribute(linkAttribute, row.getString("link"));
                    newNodes.add(elementNode);

                    elementNode.addAttribute(context.getDictionaryAttribute(), row.getString("collection"));
                }
            },
            (string) -> {
                newNodes.add(new TextNode(string));
            }
        );

        child.replaceWith(newNodes);
    }

    private void lookupLemma(ElementNode node) throws SQLException {
        trace(METHOD, "lookupLemma(ElementNode)");
        if (node == null) throw new NullPointerException("ElementNode 'node' is null.");

        if (context.getExcludedTags().contains(node.getName())) {
            trace(BRANCH, " - context.getExcludedTags().contains(node.getName())");

            return;
        } else if (context.isRecognizedTagName(node.getName())) {
            trace(BRANCH, " - context.isRecognizedTagName(node.getName())");

            /* if node has lemma attribute and overwrite lemma not selected, then exit */
            String lemmaAttribute = context.getTagInfo(node.getName()).getLemmaAttribute();
            if (lemmaAttribute.isEmpty()) {
                trace(BRANCH, " - lemmaAttribute.isEmpty()");

                return;
            }
            if (!parameters.contains(Parameter.OVERWRITE_LEMMA) && node.hasAttribute(lemmaAttribute)) {
                trace(BRANCH, " - !parameters.contains(Parameter.OVERWRITE_LEMMA) && node.hasAttribute(lemmaAttribute)");

                return;
            }

            String innerText = SQLHelper.sanitize(node.innerText());
            String nodeName = SQLHelper.sanitize(node.getName());

            String dictionaries = context.readFromDictionarySQLString();
            if (!dictionaries.isEmpty()) dictionaries = " and (" + dictionaries + ")";

            String query = "select * from dictionary";
            query += " where entity = \"" + innerText + "\"";
            query += " and tag = \"" + nodeName + "\"";
            query += dictionaries;

            trace(SQL, query);

            JSONArray matchedEntities = sql.queryToJSONArray(query);
            if (matchedEntities.length() == 0) return;
            JSONObject jsonObject = matchedEntities.getJSONObject(0);
            String attrValue = jsonObject.getString("lemma");
            String attrName = context.getTagInfo(node.getName()).getLemmaAttribute();
            node.addAttribute(new Attribute(attrName, attrValue));
        } else {
            NodeList<Node> childNodes = node.childNodes();
            childNodes.removeIf(n -> n.getType() != NodeType.ELEMENT);
            for (Node child : childNodes) {
                lookupLemma((ElementNode) child);
            }
        }
    }

    private void addUID(ElementNode node) throws SQLException {
        trace(METHOD, "addUID(ElementNode)");
        if (node == null) throw new NullPointerException("ElementNode 'node' is null.");

        if (context.isTagName(node.getName())) {
            trace(BRANCH, " - context.isRecognizedTagName(node.getName())");

            String idAttrName = context.getTagInfo(node.getName()).getIDAttribute();
            if (idAttrName.isEmpty()) return;
            if (node.hasAttribute(idAttrName)) return;
            String attrValue = this.getUniqueID(idAttrName);
            node.addAttribute(new Attribute(idAttrName, attrValue));
        } else {
            NodeList<Node> childNodes = node.childNodes();
            childNodes.removeIf(n -> n.getType() != NodeType.ELEMENT);
            for (Node child : childNodes) {
                addUID((ElementNode) child);
            }
        }
    }

    /* TODO double check the logic on this */
    private void lookupLink(ElementNode node) throws SQLException {
        trace(METHOD, "lookupLink(ElementNode)");
        if (node == null) throw new NullPointerException("ElementNode 'node' is null.");

        if (context.getExcludedTags().contains(node.getName())) {
            trace(BRANCH, " - context.getExcludedTags().contains(node.getName())");

            return;
        } else if (context.isRecognizedTagName(node.getName())) {
            trace(BRANCH, " - context.isRecognizedTagName(node.getName())");

            /* if node has lemma attribute and overwrite lemma not selected, then exit */
            String linkAttr = context.getTagInfo(node.getName()).getLinkAttribute();
            if (linkAttr.isEmpty()) {
                trace(BRANCH, " - linkAttr.isEmpty()");

                return;
            }
            if (!parameters.contains(Parameter.OVERWRITE_LINK) && node.hasAttribute(linkAttr)) {
                trace(BRANCH, " - !parameters.contains(Parameter.OVERWRITE_LINK) && node.hasAttribute(linkAttr)");

                return;
            }

            String innerText = SQLHelper.sanitize(node.innerText());
            String nodeName = SQLHelper.sanitize(node.getName());

            String dictionaries = context.readFromDictionarySQLString();
            if (!dictionaries.isEmpty()) dictionaries = " and (" + dictionaries + ")";

            String query = "select * from dictionary";
            query += " where entity = \"" + innerText + "\"";
            query += " and tag = \"" + nodeName + "\"";
            query += dictionaries;

            trace(SQL, query);

            JSONArray matchedEntities = sql.queryToJSONArray(query);

            if (matchedEntities.length() == 0) return;

            JSONObject jsonObject = matchedEntities.getJSONObject(0);
            String attrValue = jsonObject.getString("link");
            String attrName = context.getTagInfo(node.getName()).getLinkAttribute();
            node.addAttribute(new Attribute(attrName, attrValue));
        } else {
            NodeList<Node> childNodes = node.childNodes();
            childNodes.removeIf(n -> n.getType() != NodeType.ELEMENT);
            for (Node child : childNodes) {
                lookupLink((ElementNode) child);
            }
        }
    }

    private void commentMeta() {
        trace(METHOD, "commentMeta()");
        NodeList<Node> nodesByType = document.getNodesByType(NodeType.METADATA);
        for (Node node : nodesByType) {
            node.replaceWith(new CommentNode(node.innerText()));
        }
    }

    private void process() throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {
        trace(METHOD, "process()");
        wrapTags(document);
    }

    private void wrapTags(ElementNode node) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {
        trace(METHOD, "wrapTags(ElementNode " + node.getName() + ")");

        if (context.isTagName(node.getName())) {
            TagInfo tagInfo = context.getTagInfo(node.getName());
            wrapEntityTag(tagInfo, node);
        } else {
            wrapNonEntityTag(node);
        }
    }

    /**
    @param node the node to wrap
    @param allowEntities if false wrap all child tags as if they are non-entity tags
    @throws ClassNotFoundException
    @throws InstantiationException
    @throws IllegalAccessException
    @throws IOException
    @throws SQLException
     */
    private void wrapNonEntityTag(ElementNode node) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {

        StringBuilder builder = new StringBuilder();
        for (Attribute attr : node.getAttributes()) {
            node.addAttribute(new Attribute(context.getAttrPrefix() + attr.getKey(), attr.getKey()));
            builder.append(attr.getKey()).append(":'").append(attr.getValue()).append("';");
        }
        node.clearAttributes();

        if (builder.length() > 0) node.addAttribute(Constants.XML_ATTR_LIST, builder.toString());
        node.addAttribute(Constants.ORIGINAL_TAGNAME_ATTR, node.getName());
        node.addAttribute("class", Constants.HTML_NONENTITY_CLASSNAME);
        node.setName(Constants.HTML_NONENTITY_TAGNAME);

        for (Node child : node.childNodes()) {
            if (child.getType() == Node.NodeType.ELEMENT) {
                wrapTags((ElementNode) child);
            }
        }
    }

    private void wrapEntityTag(TagInfo tagInfo, ElementNode node) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {
        trace(METHOD, "wrapTags(TagInfo, ElementNode)");

        trace(DEBUG, "\n --- wrapEntityTag");
        trace(DEBUG, node.toString());

        if (tagInfo == null) throw new NullPointerException();
        if (node == null) throw new NullPointerException();

        ElementNode taggedNode = new ElementNode(htmlLabels.tagged(), null, null);

        ElementNode entityNode = new ElementNode(htmlLabels.entity(), node.getAttributes(), node.childNodes());
        for (Node child : entityNode.childNodes()) {
            if (child.getType() == Node.NodeType.ELEMENT) {
                wrapNonEntityTag((ElementNode) child);
            }
        }

        ElementNode tagNameNode = new ElementNode(htmlLabels.tagName(), null, null);
        ElementNode linkNode = null;

        String lemma = node.innerText();

        for (Attribute attr : node.getAttributes()) {
            if (attr.getKey().equals(context.getDictionaryAttribute())) {
                trace(BRANCH, " - attr.getKey().equals(context.getDictionaryAttribute())");

                taggedNode.addAttribute(attr);
                entityNode.removeAttribute(attr.getKey());
            } else if (attr.getKey().equals(tagInfo.getLinkAttribute())) {
                trace(BRANCH, " - attr.getKey().equals(tagInfo.getLinkAttribute())");

                linkNode = new ElementNode(htmlLabels.link(), attr.getValue());
                entityNode.removeAttribute(attr.getKey());
            } else if (attr.getKey().equals(tagInfo.getLemmaAttribute())) {
                trace(BRANCH, " - attr.getKey().equals(tagInfo.getLemmaAttribute())");

                lemma = node.getAttribute(tagInfo.getLemmaAttribute()).getValue();
                entityNode.removeAttribute(attr.getKey());
            } else {
                entityNode.addAttribute(new Attribute(context.getAttrPrefix() + attr.getKey(), attr.getKey()));
            }
        }

        ElementNode lemmaNode = new ElementNode(htmlLabels.lemma(), lemma);

        tagNameNode.addChild(new TextNode(tagInfo.getName()));

        taggedNode.addChild(entityNode);
        taggedNode.addChild(tagNameNode);
        taggedNode.addChild(lemmaNode);
        if (linkNode != null) taggedNode.addChild(linkNode);
        node.replaceWith(taggedNode);
    }

    private String getUniqueID(String idAttrName) {
        trace(METHOD, "getUniqueID(TString)");
        int value = (int) (Math.random() * 100000);

        while (!document.getNodesByAttribute(idAttrName, "NV" + value).isEmpty()) {
            value = (int) (Math.random() % 100000);
        }
        return "NV" + value;
    }

    private void processNER(ElementNode node) throws ParserConfigurationException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException {
        trace(METHOD, "preProcessNER(" + node.getName() + ")");
        if (context == null) throw new NullPointerException("Context is null.");
        if (node == null) throw new NullPointerException("ElementNode 'node' is null.");

        /* if the node is specifically excluded or it's already considered tagged exit */
        if (context.isRecognizedTagName(node.getName())) {
            trace(BRANCH, " - context.isRecognizedTagName(node.getName())");
            return;
        }

        /* for all child element nodes recurse   */
        /* for all child text nodes, perform NER */
        NodeList<Node> children = node.childNodes();
        for (Node current : children) {
            if (current.getType() == NodeType.ELEMENT) {
                trace(BRANCH, " - current.getType() == NodeType.ELEMENT) ");
                processNER((ElementNode) current);
            } else if (current.getType() == NodeType.TEXT) {
                trace(BRANCH, " - current.getType() == NodeType.TEXT) ");

                /* get a nodelist, zero or more of which will be element nodes, which in turn represent found entities */
                NodeList<Node> nerList = applyNamedEntityRecognizer(current.innerText());

                /* for each element node in the list ensure the path is valid, otherwise convert it to a text node */
                for (int i = 0; i < nerList.size(); i++) {
                    Node nerNode = nerList.get(i);
                    if (nerNode.getType() != NodeType.ELEMENT) continue;
                    ElementNode nerEleNode = (ElementNode) nerNode;
                    if (parameters.contains(Parameter.ADD_DEBUG_ATTR)) {
                        trace(BRANCH, " - parameters.contains(Parameter.ADD_DEBUG_ATTR)");
                    }
                    NodePath path = current.getNodePath();
                    path.add(nerEleNode);
                    if (schema != null && !schema.isValidPath(path)) {
                        trace(BRANCH, " - schema != null && !schema.isValidPath(path)");
                        TextNode textNode = new TextNode(nerEleNode.innerText());
                        nerList.set(i, textNode);
                    }
                }

                /* Go through the nodes in the node list and change the names */
                /* from dicionary to context taginfo name.                    */
                for (Node nerNode : nerList) {
                    if (nerNode.getType() == NodeType.ELEMENT) {
                        trace(BRANCH, " - nerNode.getType() == NodeType.ELEMENT)");

                        ElementNode nerElementNode = (ElementNode) nerNode;
                        TagInfo tagInfo = context.getTagInfo(nerElementNode.getName());
                        nerElementNode.setName(tagInfo.getName());
                    }
                }

                /* replace the current node with the node list */
                if (nerList.size() > 0) current.replaceWith(nerList);
            }
        }
    }

    private NodeList<Node> applyNamedEntityRecognizer(String text) throws ParserConfigurationException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException {
        trace(METHOD, "applyNamedEntityRecognizer(" + text + ")");
        String matchRegex = "([^a-zA-z]*[a-zA-z]+[^a-zA-z]*)+";
        /* at least one alphabet character upper or lower case */

        if (text == null || text.isEmpty() || !text.matches(matchRegex)) return new NodeList<>();
        text = classifier.classify("<fragment>" + text + "</fragment>");

        if (text.isEmpty()) return new NodeList<>();
        Document localDoc = DocumentNavigator.documentFromString(text);

        NodeList<ElementNode> nodes = localDoc.getNodesByType(NodeType.ELEMENT).<ElementNode>asListType();
        for (ElementNode node : nodes) {
            if (context.isRecognizedTagName(node.getName())) {
                trace(BRANCH, " - context.isRecognizedTagName(node.getName()))");

                TagInfo tagInfo = context.getTagInfo(node.getName());
                node.setName(tagInfo.getName());
            } else {
                /* should unwrap node here */
            }
        }

        NodeList<Node> childNodes = localDoc.getChild(0).<ElementNode>asType().childNodes();
        return childNodes;
    }
}
