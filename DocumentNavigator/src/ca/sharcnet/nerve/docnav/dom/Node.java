package ca.sharcnet.nerve.docnav.dom;

/**
 * immutable base class from which all other nodes are derived
 */
public abstract class Node {
    public enum NodeType {
        DOCUMENT, TEXT, ELEMENT, COMMENT, INSTRUCTION, DOCTYPE
    };

    private final NodeType type;
    private ElementNode parent;
    protected String name;

    public Node(NodeType type, String name) {
        this.type = type;
        this.name = name;
        this.parent = null;
    }

    public Node setName(String name) {
        this.name = name;
        return this;
    }

    Node(NodeType type, String name, ElementNode parent) {
        if (name == null) throw new NullPointerException();
        this.type = type;
        this.name = name;
        this.parent = parent;
    }

    void setParent(ElementNode parent){
        this.parent = parent;
    }

    /**
    Return an unchecked cast of this to class 'E'.
    @param <E> the class to cast to
    @return this node, not copied
     */
    @SuppressWarnings("unchecked")
    public <E extends Node> E asType() {
        return (E) this;
    }

    public abstract Node copy();

    /**
    Traverse the DOM to determine the node depth.
    @return node depth
    */
    public int depth(){
        int depth = 0;
        Node current = this.parent;
        while (current != null){
            depth++;
            current = current.parent;
        }
        return depth;
    }

    public NodeType getType() {
        return type;
    }

    public boolean isType(NodeType ... types) {
        for (NodeType type : types){
            if (this.type == type) return true;
        }
        return false;
    }

    public String getName() {
        return name;
    }

    public ElementNode getParent() {
        return parent;
    }

    public boolean hasParent() {
        return parent != null;
    }

    @Override
    public String toString() {
        return "<" + name + "></" + name + ">";
    }

    /**
    In this nodes parent, replace this node with 'newNode'.
    @param newNode
    @return the copy of 'newNode' used
    @throws DocNavException if the this node does not have a parent node
     */
    public Node replaceWith(Node newNode) {
        if (this.getParent() == null) throw new DocNavException("Can not replace a node with no parent.");
        this.parent.replaceChild(this, newNode);
        return newNode;
    }

    public NodeList replaceWith(NodeList nodes) {
        if (this.getParent() == null) throw new DocNavException("Can not replace a node with no parent.");
        this.parent.replaceChild(this, nodes);
        return nodes;
    }

    /**
    Retrieve an inorder list of all nodes from the document root to this node,
    inclusive.
    @return
    */
    public NodePath getNodePath(){
        NodePath list = new NodePath();
        ElementNode current = this.getParent();

        while (current != null && !current.getName().equals("@DOCUMENT")){
            list.add(0, current);
            current = current.getParent();
        }

        return list;
    }
}
