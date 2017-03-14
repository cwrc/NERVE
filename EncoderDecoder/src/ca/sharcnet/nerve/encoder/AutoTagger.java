package ca.sharcnet.nerve.encoder;

import ca.sharcnet.nerve.encoder.*;
import ca.fa.utility.SQLHelper;
import ca.sharcnet.nerve.context.*;
import ca.sharcnet.nerve.docnav.*;
import ca.sharcnet.nerve.docnav.dom.*;
import ca.sharcnet.nerve.docnav.dom.Node.NodeType;
import static ca.sharcnet.nerve.encoder.AutoTagger.TRACES.*;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.sql.SQLException;
import java.util.Arrays;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONArray;
import org.json.JSONObject;

public class AutoTagger {
    public enum TRACES {
        METHOD, EXCEPTION, DEBUG, SQL, PRINT_FINAL, BRANCH, PNER
    };
    public static final TRACES[] activeTraces = {PNER};

    public static final void trace(TRACES type, String text) {
        if (Arrays.asList(activeTraces).contains(type)) {
            StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
            String filename = stackTrace[2].getFileName();
            int line = stackTrace[2].getLineNumber();
            System.out.println(Thread.currentThread().getName() + " " + filename + " " + line + " : " + text);
        }
    }

    /* --- end of trace --- */

    private final InputStream inputStream;
    private final Context context;
    private final SQLHelper sql;
    private final Classifier classifier;
    private OutputStream outStream;
    private Schema schema = null;
    private Document document;

    public AutoTagger(InputStream stream, OutputStream outStream, Context context, SQLHelper sql, Classifier classifier) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {
        trace(METHOD, "Encoder()");

        if (stream == null) throw new NullPointerException();
        if (context == null) throw new NullPointerException();
        if (sql == null) throw new NullPointerException();
        if (classifier == null) throw new NullPointerException();

        this.sql = sql;
        this.context = context;
        this.inputStream = stream;
        this.outStream = outStream;
        this.classifier = classifier;
    }

    public void run() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        trace(METHOD, "encode()");

        document = DocumentNavigator.documentFromStream(inputStream);

        lookupTag();
        processNER(document);
        commentMeta();
        this.outStream.write(document.toString().getBytes());
    }

    public void setSchema(Schema schema) {
        trace(METHOD, "setSchema()");
        this.schema = schema;
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

    private void commentMeta() {
        trace(METHOD, "commentMeta()");
        NodeList<Node> nodesByType = document.getNodesByType(NodeType.METADATA);
        for (Node node : nodesByType) {
            node.replaceWith(new CommentNode(node.innerText()));
        }
    }

    private void processNER(ElementNode node) throws ParserConfigurationException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException {
//        trace(PNER, "processNER(" + node.getName() + ")");
        if (context == null) throw new NullPointerException("Context is null.");
        if (node == null) throw new NullPointerException("ElementNode 'node' is null.");

        /* if the node is specifically excluded or it's already considered tagged exit */
        if (context.isTagName(node.getName())) {
//            trace(PNER, " - context.isRecognizedTagName(node.getName())");
            return;
        }

        /* for all child element nodes recurse
         * for all child text nodes, perform NER
         */
        NodeList<Node> children = node.childNodes();
        for (Node current : children) {
            if (current.getType() == NodeType.ELEMENT) {
//                trace(PNER, " - current.getType() == NodeType.ELEMENT) ");
                processNER((ElementNode) current);
            } else if (current.getType() == NodeType.TEXT) {
//                trace(PNER, " - current.getType() == NodeType.TEXT) ");

                /* get a nodelist, zero or more of which will be element nodes, which in turn represent found entities */
                NodeList<Node> nerList = applyNamedEntityRecognizer(current.innerText());

                /* for each element node in the list ensure the path is valid, otherwise convert it to a text node */
                for (int i = 0; i < nerList.size(); i++) {
                    Node nerNode = nerList.get(i);
                    trace(PNER, nerNode.getName() + ":" + nerNode.getType() + ":" + nerNode.innerText());
                    if (nerNode.getType() != NodeType.ELEMENT) trace(PNER, " - nerNode.getType() != NodeType.ELEMENT");
                    if (nerNode.getType() != NodeType.ELEMENT) continue;
                    ElementNode nerEleNode = (ElementNode) nerNode;
                    NodePath path = current.getNodePath();
                    path.add(nerEleNode);

                    if (schema != null && !schema.isValidPath(path)) {
                        trace(PNER, " - schema != null && !schema.isValidPath(path)");
                        TextNode textNode = new TextNode(nerEleNode.innerText());
                        nerList.set(i, textNode);
                    } else {
                        trace(PNER, " - schema == null || schema.isValidPath(path)");
                    }
                }

                /* Go through the nodes in the node list and change the names
                 * from dicionary to context taginfo name.
                 */
                for (Node nerNode : nerList) {
                    trace(PNER, nerNode.getName() + ":" + nerNode.getType() + ":" + nerNode.innerText());
                    if (nerNode.getType() == NodeType.ELEMENT) {
                        trace(PNER, " - nerNode.getType() == NodeType.ELEMENT");

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
            if (context.isNERMapTagName(node.getName())) {
                trace(BRANCH, " - context.isRecognizedTagName(node.getName()))");

                TagInfo tagInfo = context.getTagInfo(node.getName());
                node.setName(tagInfo.getName());
            } else {
                /* should unwrap node here ?*/
            }
        }

        NodeList<Node> childNodes = localDoc.getChild(0).<ElementNode>asType().childNodes();
        return childNodes;
    }
}
