package ca.sharcnet.nerve.docnav.dom;

/**
 * immutable base class from which all other nodes are derived
 */
public class Node {

    public enum NodeType {
        DOCUMENT, TEXT, ELEMENT, COMMENT, METADATA
    };
    private final NodeType type;
    private final String innerText;
    private ElementNode parent;
    protected String name;

    public Node(NodeType type, String innerText, String name) {
        this.type = type;
        this.innerText = innerText;
        this.name = name;
        this.parent = null;
    }

    public Node setName(String name) {
        if (name.startsWith("@")
            || name.contains(" ")) {
            throw new RuntimeException("Invalid node name");
        }
        this.name = name;
        return this;
    }    
    
    Node(NodeType type, String innerText, String name, ElementNode parent) {
        if (name == null) throw new NullPointerException();
        this.type = type;
        this.innerText = innerText;
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

    Node copy(ElementNode newParent) {
        return new Node(type, innerText, name, newParent);
    }

    public Node copy() {
        return new Node(type, innerText, null);
    }

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

    public String innerText() {
        return innerText;
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
        return innerText;
    }

    /**
    Returns a new node with a different name keeping the other parameters.
    The new node will not have a parent.
    @param name
    @return
     */
    public Node renameCopy(String name) {
        return new Node(this.getType(), this.innerText(), name);
    }

    /**
    Returns a new node with a different type keeping the other parameters.
    The new node will not have a parent.
    @param name
    @return
     */
    public Node retypeCopy(NodeType type) {
        return new Node(type, this.innerText(), this.getName());
    }

    /**
    Returns a new node with a different inner text keeping the other parameters.
    The new node will not have a parent.
    @param name
    @return
     */
    public Node setText(String text) {
        return new Node(this.getType(), text, this.getName());
    }

    /**
    In this nodes parent, replace this node with a copy of 'newNode'
    @param newNode
    @return the copy of 'newNode' used
    @throws DocNavException if the this node does not have a parent node
     */
    public Node replaceWith(Node newNode) {
        if (this.getParent() == null) throw new DocNavException("Can not replace a node with no parent.");

        NodeList<Node> children = parent.childNodes();
        int i = children.indexOf(this);
        parent.removeChild(this);
        return parent.addChild(i, newNode);
    }

    /**
    In this nodes parent, replace this node with a copy of all nodes in list
    @param list a list of nodes to use
    @throws DocNavException if the this node does not have a parent node
     */
    public void replaceWith(NodeList<Node> list) {
        if (this.getParent() == null) throw new DocNavException("Can not replace a node with no parent.");
        ElementNode parent = this.getParent();
        NodeList<Node> children = parent.childNodes();
        int i = children.indexOf(this);
        parent.removeChild(this);

        for (Node newNode : list) {
            parent.addChild(i, newNode.copy(parent));
            i++;
        }
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
