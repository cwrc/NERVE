package ca.sharcnet.nerve.decode;
import static ca.sharcnet.nerve.Constants.*;
import ca.sharcnet.nerve.docnav.dom.Attribute;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.InstructionNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import java.io.IOException;
import java.io.OutputStream;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;
import ca.sharcnet.nerve.docnav.dom.DoctypeNode;
import ca.sharcnet.nerve.docnav.dom.Node.NodeType;
import org.json.JSONObject;

public class Decoder {

    public void decode(Document srcDoc, OutputStream outStream) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        Document destDoc = new Document();
        ElementNode first = (ElementNode) srcDoc.getChild(0);
        for (ElementNode child : first.childElements()) destDoc.addChild(unwrap(child));
        outStream.write(destDoc.toString().getBytes());
    }

    private Node unwrap(Node node) {
        if (!node.isType(NodeType.ELEMENT)) return node.copy();
        ElementNode srcNode = (ElementNode) node;

        switch (srcNode.getAttributeValue("class")){
            case HTML_NONENTITY_CLASSNAME:
            case HTML_ENTITY_CLASSNAME:{
                ElementNode eNode = new ElementNode(srcNode.getAttributeValue(ORIGINAL_TAGNAME_ATTR));
                JSONObject json = new JSONObject(srcNode.getAttribute(XML_ATTR_LIST).getValue());
                for (String key : json.keySet()) eNode.addAttribute(key, json.getString(key));
                for (Node child : srcNode.childNodes()) eNode.addChild(unwrap(child));
                return eNode;
            }
            case HTML_PROLOG_CLASSNAME:{
                InstructionNode iNode = new InstructionNode();
                iNode.setName(srcNode.getAttributeValue(ORIGINAL_TAGNAME_ATTR));
                JSONObject json = new JSONObject(srcNode.getAttribute(XML_ATTR_LIST).getValue());
                for (String key : json.keySet()) iNode.addAttribute(key, json.getString(key));
                return iNode;
            }
            case HTML_DOCTYPE_CLASSNAME:{
                DoctypeNode dNode = new DoctypeNode(srcNode.getAttributeValue(DOCTYPE_INNERTEXT));
                return dNode;
            }
        };

        /* all possibilities should be accounted for in the switch statement */
        throw new RuntimeException("Sanity Check Failed");
    }
}
