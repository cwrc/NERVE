package ca.sharcnet.nerve.decode;

import ca.sharcnet.nerve.Constants;
import static ca.sharcnet.nerve.Constants.*;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.context.TagInfo;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.InstructionNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import java.io.IOException;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;
import ca.sharcnet.nerve.docnav.dom.DoctypeNode;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import static ca.sharcnet.nerve.docnav.dom.NodeType.ELEMENT;
import ca.sharcnet.nerve.docnav.dom.extended.HTMLElement;
import ca.sharcnet.nerve.docnav.selector.Select;
import org.json.JSONObject;

public class Decoder {

    private Context context = null;

    public static Document decode(Document document, HasStreams hasStreams) throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        Select selected = document.select().attribute(Constants.CONTEXT_ATTRIBUTE);
        if (selected.isEmpty()) throw new RuntimeException("Context element not found.");
        ElementNode contextNode = selected.get(0);

        String contextPath = String.format("%s.context.json", contextNode.getAttributeValue(Constants.CONTEXT_ATTRIBUTE));
        Context context = ContextLoader.load(hasStreams.getResourceStream(contextPath));
        Document decoded = new Decoder().decode(document, context);
        return decoded;
    }

    public Document decode(Document srcDoc, Context context) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        this.context = context;
        Document destDoc = new Document();
        ElementNode first = (ElementNode) srcDoc.childNodes().get(0);
        for (Node child : first.select().all()) destDoc.addChild(unwrap(child));
        addDefaultAttributes(destDoc);
        return destDoc;
    }

    private void addDefaultAttributes(ElementNode eNode) {
        if (context.isTagName(eNode.getName())) {
            TagInfo tagInfo = context.getTagInfo(eNode.getName());
            for (String key : tagInfo.defaults().keySet()) {
                if (eNode.hasAttribute(key)) continue;
                eNode.addAttribute(key, tagInfo.getDefault(key));
            }
        }
        for (Node child : eNode.childNodes()){
            if (child.isType(ELEMENT)) addDefaultAttributes((ElementNode) child);
        }
    }

    private Node unwrap(Node node) {
        System.out.println("unwrap " + node.getName());
        if (!node.isType(NodeType.ELEMENT, NodeType.DOCUMENT)) return node.copy();
        HTMLElement hNode = new HTMLElement((ElementNode) node);

        if (hNode.hasClassName(HTML_NONENTITY_CLASSNAME, HTML_ENTITY_CLASSNAME)) {
            ElementNode eNode = new ElementNode(hNode.getAttributeValue(ORIGINAL_TAGNAME_ATTR));
            JSONObject json = new JSONObject(hNode.getAttribute(XML_ATTR_LIST).getValue());
            for (String key : json.keySet()) eNode.addAttribute(key, json.getString(key));
            for (Node child : hNode.childNodes()) eNode.addChild(unwrap(child));
            return eNode;
        } else if (hNode.hasClassName(HTML_PROLOG_CLASSNAME)) {
            InstructionNode iNode = new InstructionNode();
            iNode.setName(hNode.getAttributeValue(ORIGINAL_TAGNAME_ATTR));
            JSONObject json = new JSONObject(hNode.getAttribute(XML_ATTR_LIST).getValue());
            for (String key : json.keySet()) iNode.addAttribute(key, json.getString(key));
            return iNode;
        } else if (hNode.hasClassName(HTML_DOCTYPE_CLASSNAME)) {
            DoctypeNode dNode = new DoctypeNode(hNode.getAttributeValue(DOCTYPE_INNERTEXT));
            return dNode;
        }
        return node.copy();
    }
}
