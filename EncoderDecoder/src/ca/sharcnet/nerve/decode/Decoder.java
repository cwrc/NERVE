package ca.sharcnet.nerve.decode;
import ca.fa.utility.SQLHelper;
import ca.fa.utility.collections.SimpleCollection;
import ca.sharcnet.nerve.docnav.DocumentNavigator;
import ca.sharcnet.nerve.docnav.dom.Attribute;
import ca.sharcnet.nerve.docnav.dom.CommentNode;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.MetaDataNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.context.*;
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
import static ca.sharcnet.nerve.decode.Decoder.TRACES.*;

public class Decoder {
    public enum TRACES {METHOD, EXCEPTION, DEBUG, SQL};
    public final TRACES[] activeTraces = {};

    public final void trace(TRACES type, String text) {
        Logger logger = getLogger(Decoder.class.getName());
        if (Arrays.asList(activeTraces).contains(type)) {
            StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
            String filename = stackTrace[2].getFileName();
            int line = stackTrace[2].getLineNumber();
            logger.info(Thread.currentThread().getName() + " " + filename + " " + line + " : " + text);
        }
    }

    /* --- end of trace --- */

    public enum Parameter {
        EXTRACT_LEMMAS, DECODE_PROCESS, UNCOMMENT_META, RETAIN_ALIAS,
        ADD_ID, NER, ENCODE_PROCESS, COMMENT_META, LOOKUP_TAG, LOOKUP_LEMMA, LOOKUP_LINK, OVERWRITE_LEMMA, OVERWRITE_LINK
        /* included from encoder to prevent exception */
    };

    private final SimpleCollection<Parameter> parameters = new SimpleCollection<>();
    private final SQLHelper sql;
    private final Context context;
    private final InputStream inputStream;
    private Document document;

    public Decoder(InputStream stream, Context context, SQLHelper sql) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {
        if ((this.inputStream = stream) == null) throw new NullPointerException("parameter 'stream' is null");
        if ((this.context = context) == null) throw new NullPointerException("parameter 'context' is null");
        if ((this.sql = sql) == null) throw new NullPointerException("parameter 'sql' is null");
    }

    /**
    Include one or more parameters that alter the behaviour of the decoder.<br>
    @param parameters
     */
    public void setParameters(Decoder.Parameter... parameters) {
        if (parameters == null || parameters.length == 0) return;
        this.parameters.addAll(Arrays.asList(parameters));
    }

    /**
    Set parameters by enumerated strings, meant to be used in conjunction with
    httprequest.
    @param parameterNames
     */
    public void setParameters(Enumeration<String> parameterNames) {
        while (parameterNames.hasMoreElements()) {
            String nextElement = parameterNames.nextElement();

            /* ensure the parameter exists */
            for (Decoder.Parameter p : Decoder.Parameter.values()){
                if (p.name().equals(nextElement)){
                    this.parameters.add(Decoder.Parameter.valueOf(nextElement));
                    break;
                }
            }
        }
    }

    public void decode(OutputStream outStream) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        if (outStream == null) throw new NullPointerException("parameter 'outStream' is null");
        document = DocumentNavigator.documentFromStream(inputStream);
        process();
        uncommentMeta();
        outStream.write(document.toString().getBytes());
    }


    public void olddecode(OutputStream outStream) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        if (outStream == null) throw new NullPointerException("parameter 'outStream' is null");
        document = DocumentNavigator.documentFromStream(inputStream);
        if (parameters.contains(Parameter.DECODE_PROCESS)) process();
//        if (parameters.contains(Parameter.EXTRACT_LEMMAS)) extractTagInformation();
        if (parameters.contains(Parameter.UNCOMMENT_META)) uncommentMeta();
        outStream.write(document.toString().getBytes());
    }

    @Deprecated
    private void extractTagInformation() throws SQLException {
        trace(METHOD, "extractTagInformation()");
        SimpleCollection<TagInfo> tags = this.context.getTags();
        for (TagInfo tagInfo : tags) {
            NodeList<Node> nodesByName = document.getNodesByName(tagInfo.getName(), tagInfo.isCaseSensative());

            for (ElementNode eleNode : nodesByName.<ElementNode>asListType()) {
                String entity = eleNode.innerText(false);
                String tag = eleNode.getName();

                String lemmaAttr = context.getTagInfo(tag).getLemmaAttribute();
                String linkAttr = context.getTagInfo(tag).getLinkAttribute();

                if (lemmaAttr.isEmpty() || !eleNode.hasAttribute(lemmaAttr)) continue;
                if (linkAttr.isEmpty() || !eleNode.hasAttribute(linkAttr)) continue;

                String lemma = eleNode.getAttribute(lemmaAttr).getValue();
                String link = eleNode.getAttribute(linkAttr).getValue();

                if (tag.isEmpty()) continue;
                if (lemma.isEmpty()) continue;
                if (link.isEmpty()) continue;

                entity = SQLHelper.sanitize(entity);
                lemma = SQLHelper.sanitize(lemma);
                tag = SQLHelper.sanitize(tag);
                link = SQLHelper.sanitize(link);

                /* if the entity already exists, do not modify it */
                String q2 = String.format("select * from dictionary where entity = \"%s\"", entity);
                JSONArray q2Result = sql.queryToJSONArray(q2);
                trace(SQL, q2);
                if (q2Result.length() > 0) continue;

                String collection = context.getWriteToDictionary();
                if (collection.isEmpty()) collection = "default";

                String q3 = String.format("insert into dictionary (entity, lemma, link, tag, collection) values (\"%s\",\"%s\",\"%s\",\"%s\",\"%s\")", entity, lemma, link, tag, collection);
                trace(SQL, q3);
                sql.update(q3);
            }
        }
    }

    private void process() {
        NodeList<ElementNode> taggedNodes = document.getNodesByName(context.htmlLables().tagged()).<ElementNode>asListType();

        for (ElementNode eleNode : taggedNodes) {
            unwrap(eleNode);
        }

        unprefixTags(document);
    }

    private void unprefixTags(ElementNode node) {
        trace(METHOD, "unprefixTags " + node.startTag());
        String nodeName = node.getName().toLowerCase();
        String lcPrefix = context.getTagPrefix().toLowerCase();
        String tagged = context.htmlLables().tagged().toLowerCase();
        String attrPrefix = context.getAttrPrefix().toLowerCase();

        if (!nodeName.equals("@document") && !nodeName.equals(tagged)) {
            if (node.hasAttribute(lcPrefix)) {
                node.setName(node.getAttribute(lcPrefix).getValue());
                node.removeAttribute(lcPrefix);
            }

            /* replace all attribute names that start with attribute prefix (see context) */
            /* with the value contained in attribute prefix + name                        */
            for (Attribute attribute : node.getAttributes()) {
                if (attribute.getKey().startsWith(attrPrefix)) {
                    String attrName = attribute.getKey().substring(attrPrefix.length());
                    node.getAttribute(attrName).setKey(attribute.getValue());
                    node.removeAttribute(attribute.getKey());
                }
                if (attribute.getKey().equals("class") && attribute.getValue().equals(context.getTagPrefix())){
                    node.removeAttribute("class");
                }
            }
        }

        if (!nodeName.equals(tagged)) {
            NodeList<Node> childNodes = node.childNodes();
            for (Node child : childNodes) {
                if (child.getType() == Node.NodeType.ELEMENT) unprefixTags((ElementNode) child);
            }
        }
    }

    private void unwrap(ElementNode node) {
        if (node == null) throw new NullPointerException("parameter 'node' is null");

        String tagName = "";
        String tagAlias = "";
        String link = "";
        String lemma = "";

        NodeList<Node> entityNodes = node.getNodesByName(context.htmlLables().entity());
        NodeList<Node> tagNameNodes = node.getNodesByName(context.htmlLables().tagName());
        NodeList<Node> lemmaNodes = node.getNodesByName(context.htmlLables().lemma());
        NodeList<Node> linkNodes = node.getNodesByName(context.htmlLables().link());

        if (entityNodes.size() != 1) throw new DecoderException(node.toString() + "\nimproper entity nodes list size : " + entityNodes.size());
        if (tagNameNodes.size() > 1) throw new DecoderException(node.toString() + "\nimproper tagNames nodes list size : " + tagNameNodes.size());
        if (lemmaNodes.size() > 1) throw new DecoderException(node.toString() + "\nimproper lemma nodes list size : " + lemmaNodes.size());
        if (linkNodes.size() > 1) throw new DecoderException(node.toString() + "\nimproper link nodes list size : " + linkNodes.size());

        ElementNode entityNode = (ElementNode) entityNodes.get(0);

        if (tagNameNodes.size() > 0) {
            ElementNode tagNameNode = (ElementNode) tagNameNodes.get(0);
            tagName = tagNameNode.innerText();

            tagAlias = tagName;
            if (tagNameNode.hasAttribute("alias")) {
                tagAlias = tagNameNode.getAttribute("alias").getValue();
            }
        }

        if (lemmaNodes.size() > 0) {
            ElementNode lemmaNode = (ElementNode) lemmaNodes.get(0);
            lemma = lemmaNode.innerText();
        }

        if (linkNodes.size() > 0) {
            ElementNode linkNode = (ElementNode) linkNodes.get(0);
            link = linkNode.innerText();
        }

        TagInfo tagInfo = context.getTagInfo(tagName);
        if (!tagInfo.getLemmaAttribute().isEmpty() && !lemma.isEmpty()) {
            entityNode.addAttribute(new Attribute(tagInfo.getLemmaAttribute(), lemma));
        }

        if (!tagInfo.getLinkAttribute().isEmpty() && !link.isEmpty()) {
            entityNode.addAttribute(new Attribute(tagInfo.getLinkAttribute(), link));
        }

        if (parameters.contains(Parameter.RETAIN_ALIAS)) tagName = tagAlias;
        ElementNode copy = entityNode.renameCopy(tagName);
        node.replaceWith(copy);
    }

    private void uncommentMeta() {
        NodeList<CommentNode> nodesByType = document.getNodesByType(Node.NodeType.COMMENT).<CommentNode>asListType();

        for (CommentNode node : nodesByType) {
            if (node.innerText().startsWith("<?") || node.innerText().startsWith("<!")) {
                String text = node.innerText();
                MetaDataNode metaDataNode = new MetaDataNode(text);
                node.replaceWith(metaDataNode);
            }
        }
    }
}
