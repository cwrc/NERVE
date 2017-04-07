package ca.sharcnet.nerve.docnav.selector;
import ca.sharcnet.nerve.docnav.dom.AttributeNode;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import static ca.sharcnet.nerve.docnav.dom.NodeType.*;

public class Select extends NodeList<Node> {
    private final NodeList<Node> nodes;

    public Select(ElementNode doc) {
        this.nodes = doc.getNodesByName("*");
    }

    public Select name(String name) {
        for (Node node : nodes) {
            if (node.getName().equals(name) && !this.contains(node)) {
                this.add(node);
            }
        }
        return this;
    }

    public Select attribute(String key) {
        for (Node node : nodes) {
            if (node.isType(ELEMENT, INSTRUCTION)){
                AttributeNode aNode = (AttributeNode) node;
                if (aNode.hasAttribute(key) && !this.contains(node)) {
                    this.add(node);
                }
            }
        }
        return this;
    }

    public Select attribute(String key, String value) {
        for (Node node : nodes) {
            if (node.isType(ELEMENT, INSTRUCTION)){
                AttributeNode aNode = (AttributeNode) node;
                if (aNode.hasAttribute(key) && aNode.getAttributeValue(key).equals(value) && !this.contains(node)) {
                    this.add(node);
                }
            }
        }
        return this;
    }
}
