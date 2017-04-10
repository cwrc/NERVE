package ca.sharcnet.nerve.docnav.selector;
import ca.sharcnet.nerve.docnav.dom.AttributeNode;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import static ca.sharcnet.nerve.docnav.dom.NodeType.*;
import java.util.Collection;

public class Select extends NodeList<ElementNode> {
    private final NodeList<ElementNode> allNodes;

    public Select(ElementNode ele) {
        allNodes = new NodeList<>();
        addElement(ele);
    }

    public Select(Collection<? extends ElementNode> list) {
        allNodes = new NodeList<>();
        for (ElementNode node : list) {
            if (node.isType(NodeType.ELEMENT)){
                allNodes.add(node);
            }
        }
    }

    public Refine refine() {
        return new Refine(this);
    }

    private void addElement(Node node) {
        if (node.isType(ELEMENT)) allNodes.add((ElementNode)node);
        if (!node.isType(ELEMENT, DOCUMENT)) return;
        for (Node child : ((ElementNode)node).childNodes()) {
            this.addElement(child);
        }
    }

    public Select all() {
        this.clear();
        this.add(allNodes);
        return this;
    }

    /**
    Add the elements in 'eNodes' to this selection if they are child nodes
    of the source element.
    @param eNodes
    @return
     */
    public Select elements(ElementNode... eNodes) {
        for (ElementNode eNode : eNodes) {
            if (allNodes.contains(eNode) && !this.contains(eNode)) {
                this.add(eNode);
            }
        }
        return this;
    }

    /**
    Add the elements that match the names in 'names' to the selection.
    @param eNodes
    @return
     */
    public Select name(String... names) {
        for (ElementNode node : allNodes) {
            for (String name : names) {
                if (node.getName().equals(name) && !this.contains(node)) {
                    this.add(node);
                }
            }
        }
        return this;
    }

    /**
    Add the elements that contain the attribute 'key' to the selection.
    @param eNodes
    @return
     */
    public Select attribute(String key) {
        for (ElementNode node : allNodes) {
            if (node.isType(ELEMENT, INSTRUCTION)) {
                AttributeNode aNode = (AttributeNode) node;
                if (aNode.hasAttribute(key) && !this.contains(node)) {
                    this.add(node);
                }
            }
        }
        return this;
    }

    /**
    Add the elements that contain the attribute 'key' with value equal to
    'value' to the selection.
    @param eNodes
    @return
     */
    public Select attribute(String key, Object value) {
        for (ElementNode node : allNodes) {
            if (node.isType(ELEMENT, INSTRUCTION)) {
                AttributeNode aNode = (AttributeNode) node;
                if (aNode.hasAttribute(key) && aNode.hasAttribute(key, value) && !this.contains(node)) {
                    this.add(node);
                }
            }
        }
        return this;
    }
}
