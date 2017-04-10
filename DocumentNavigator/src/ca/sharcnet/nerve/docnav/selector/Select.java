package ca.sharcnet.nerve.docnav.selector;
import ca.sharcnet.nerve.docnav.dom.AttributeNode;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import static ca.sharcnet.nerve.docnav.dom.NodeType.*;

public class Select extends NodeList<Node> {
    private final NodeList<Node> allNodes;
    private NodeType[] types;

    public Select(ElementNode ele) {this(ele, ELEMENT);}
    public Select(NodeList<? extends Node> list) {this(list, ELEMENT);}

    public Select(ElementNode ele, NodeType ... types) {
        this.types = types;
        allNodes = new NodeList<>();
        addElement(ele);
    }

    public Select(NodeList<? extends Node> list, NodeType ... types) {
        this.types = types;
        allNodes = new NodeList<>();
        for (Node node : list) {
            if (node.isType(this.types)){
                allNodes.add(node);
            }
        }
    }

    public Refine refine() {
        return new Refine(this);
    }

    private void addElement(Node node) {
        if (node.isType(this.types)) allNodes.add(node);
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
        for (Node node : allNodes) {
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
        for (Node node : allNodes) {
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
        for (Node node : allNodes) {
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
