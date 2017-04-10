package ca.sharcnet.nerve.docnav.selector;

import ca.sharcnet.nerve.docnav.dom.AttributeNode;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import static ca.sharcnet.nerve.docnav.dom.NodeType.*;

public class Select extends NodeList<ElementNode> {

    private final NodeList<ElementNode> allNodes;

    public Select(ElementNode ele) {
        allNodes = new NodeList<>();
        if (ele.isType(NodeType.DOCUMENT)) {
            for (Node child : ele.childNodes()) {
                this.addElement(child);
            }
        } else {
            addElement(ele);
        }
    }

    public Select(NodeList<? extends Node> list) {
        allNodes = new NodeList<>();
        for (Node node : list) {
            if (node.isType(NodeType.ELEMENT)) {
                allNodes.add((ElementNode) node);
            }
        }
    }

    public Refine refine() {
        return new Refine(this);
    }

    private void addElement(Node node) {
        if (!node.isType(NodeType.ELEMENT)) return;
        ElementNode ele = (ElementNode) node;
        allNodes.add(ele);
        for (Node child : ele.childNodes()) {
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
