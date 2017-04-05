package ca.sharcnet.nerve.encoder;
import ca.sharcnet.nerve.Constants;
import ca.fa.utility.sql.SQL;
import ca.sharcnet.nerve.context.*;
import ca.sharcnet.nerve.docnav.*;
import ca.sharcnet.nerve.docnav.dom.*;
import ca.sharcnet.nerve.docnav.dom.Node.NodeType;
import static ca.sharcnet.nerve.docnav.dom.Node.NodeType.*;
import java.io.IOException;
import java.io.OutputStream;
import java.sql.SQLException;
import java.util.List;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONArray;
import org.json.JSONObject;

public class Encoder {
    private final Context context;
    private final SQL sql;
    private final Classifier classifier;
    private Schema schema = null;
    private Document document = null;

    public Encoder(Document document, Context context, SQL sql, Classifier classifier) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {
        if (document == null) throw new NullPointerException();
        if (context == null) throw new NullPointerException();

        this.sql = sql;
        this.context = context;
        this.document = document;
        this.classifier = classifier;
    }

    public void encode(OutputStream outStream) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        if (outStream == null) throw new NullPointerException();

        if (this.sql != null) lookupTag();
        processNER(document);
        wrapTag(document);
        outStream.write(document.toString().getBytes());
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
        if (builder.length() > 0){
            query = String.format("select * from dictionary where %s", builder.toString());
        }
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
            if (child.getType() == Node.NodeType.TEXT) {
                lookupTag((TextNode) child, knownEntities);
            } else if (child.getType() == Node.NodeType.ELEMENT) {
                lookupTag((ElementNode) child, knownEntities);
            }
        }
    }

    private void addDefaultAttributes(ElementNode eNode){
        TagInfo tagInfo = context.getTagInfo(eNode.getName());
        for (String key : tagInfo.defaults().keySet()){
            if (eNode.hasAttribute(key)) continue;
            eNode.addAttribute(key, tagInfo.getDefault(key));
        }
    }

    private void lookupTag(TextNode child, StringMatch knownEntities) {
        String innerText = child.innerText();
        final NodeList<Node> newNodes = new NodeList<>();

        /* choose the largest matching known entity */
        OnAccept onAccept = (string, row) -> {
            TagInfo tagInfo = context.getTagInfo(row.getString("tag"));
            ElementNode elementNode = new ElementNode(tagInfo.name, string);
            addDefaultAttributes(elementNode);

            NodePath path = child.getNodePath();
            path.add(elementNode);

            if (schema != null && !schema.isValidPath(path)) {/* verify the schema */
                newNodes.add(new TextNode(string));
            } else {
                String lemmaAttribute = context.getTagInfo(row.getString("tag")).lemmaAttribute;
                if (!lemmaAttribute.isEmpty()) elementNode.addAttribute(lemmaAttribute, row.getString("lemma"));

                String linkAttribute = context.getTagInfo(row.getString("tag")).linkAttribute;
                if (!linkAttribute.isEmpty()) elementNode.addAttribute(linkAttribute, row.getString("link"));
                newNodes.add(elementNode);
            }
        };

        OnReject onReject = (string) -> {
            newNodes.add(new TextNode(string));
        };

        knownEntities.seekLine(innerText, onAccept, onReject);
        child.replaceWithCopy(newNodes);
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
        if (!node.isType(ELEMENT, INSTRUCTION, DOCTYPE)) return;

        if (node.isType(NodeType.DOCTYPE)) {
            ElementNode eNode = new ElementNode(Constants.HTML_TAGNAME);
            eNode.addAttribute("class", Constants.HTML_DOCTYPE_CLASSNAME);
            eNode.addAttribute(new Attribute(Constants.DOCTYPE_INNERTEXT, node.innerText()));
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
            attrNode.replaceWith(eNode);
            eNode.addAttribute("class", Constants.HTML_PROLOG_CLASSNAME);
        } else if (context.isTagName(node.getName())) {
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
        if (context.isTagName(node.getName())) {
            return;
        }

        /* for all child element nodes recurse   */
        /* for all child text nodes, perform NER */
        NodeList<Node> children = node.childNodes();
        for (Node current : children) {
            if (current.getType() == NodeType.ELEMENT) {
                processNER((ElementNode) current);
            } else if (current.getType() == NodeType.TEXT) {
                /* get a nodelist, zero or more of which will be element nodes, which in turn represent found entities */
                NodeList<Node> nerList = applyNamedEntityRecognizer(current.innerText());

                /* for each element node in the list ensure the path is valid, otherwise convert it to a text node */
                for (int i = 0; i < nerList.size(); i++) {
                    Node nerNode = nerList.get(i);
                    if (nerNode.getType() != NodeType.ELEMENT) continue;
                    ElementNode nerEleNode = (ElementNode) nerNode;
                    NodePath path = current.getNodePath();
                    path.add(nerEleNode);
                    if (schema != null && !schema.isValidPath(path)) {
                        TextNode textNode = new TextNode(nerEleNode.innerText());
                        nerList.set(i, textNode);
                    }
                }

                /* Go through the nodes in the node list and change the names */
                /* from dicionary to context taginfo name.                    */
                for (Node nerNode : nerList) {
                    if (nerNode.getType() == NodeType.ELEMENT) {
                        ElementNode nerElementNode = (ElementNode) nerNode;
                        TagInfo tagInfo = context.getTagInfo(nerElementNode.getName());
                        nerElementNode.setName(tagInfo.name);
                    }
                }

                /* replace the current node with the node list */
                if (nerList.size() > 0) current.replaceWithCopy(nerList);
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
        Document localDoc = DocumentNavigator.documentFromString(text);
        NodeList<ElementNode> nodes = localDoc.getElementsByName("*");

        /* for each node in the document (from above) if it's an NER node     */
        /* change it's tagname to a valid tag name occording to the context   */
        /* and set it's lemma if it doens't already have one.                 */
        /* ensure that the node has the default attributes                    */
        for (ElementNode node : nodes) {
            if (context.isNERMap(node.getName())){ /* if node name is an NER tag name */
                TagInfo tagInfo = context.getTagInfo(node.getName());
                node.setName(tagInfo.name);
                addDefaultAttributes(node);
                if (!tagInfo.lemmaAttribute.isEmpty()){
                    node.addAttribute(new Attribute(tagInfo.lemmaAttribute, node.innerText()));
                }
            }
        }

        NodeList<Node> childNodes = localDoc.getChild(0).<ElementNode>asType().childNodes();
        return childNodes;
    }
}