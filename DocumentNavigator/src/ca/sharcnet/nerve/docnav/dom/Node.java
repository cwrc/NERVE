package ca.sharcnet.nerve.docnav.dom;

/**
 * immutable base class from which all other nodes are derived
 */
public abstract class Node {
    private final IsNodeType type;
    private ElementNode parent;
    protected String name;

    public Node(IsNodeType type, String name) {
        this.type = type;
        this.name = name;
        this.parent = null;
    }

    public void detach(){
        if (this.parent == null) throw new NullPointerException();
        this.parent.removeChild(this);
    }

    final void setParent(ElementNode parent){
        this.parent = parent;
    }

    /**
    Set the node name, may mean different things to different nodes.
    */
    final public Node setName(String name) {
        this.name = name;
        return this;
    }

    /**
    Return a copy of this node.  All attached components should also be
    copied.
    @return A new node.
    */
    public abstract Node copy();

    /**
    Traverse up the DOM to determine the node depth.
    @return node depth
    */
    public final int depth(){
        int depth = 0;
        Node current = this.parent;
        while (current != null){
            depth++;
            current = current.parent;
        }
        return depth;
    }

    /**
    Return the type of node that was set when created.
    @return
    */
    public IsNodeType getType() {
        return type;
    }

    /**
    Determine if this nodes type matches one of the given types.
    @param types
    @return
    */
    public boolean isType(IsNodeType ... types) {
        for (IsNodeType type : types){
            if (this.type == type) return true;
        }
        return false;
    }

    public String getName() {
        return name;
    }

    /**
    Return this nodes parent, if this node has not parent the behaviour is
    undefined.
    @return
    @throws DocNavException if the this node does not have a parent node
    */
    public final ElementNode getParent() {
        if (this.parent == null) throw new DocNavException("Can not replace a node with no parent.");
        return parent;
    }

    /**
    Determine if this node has a parent node.
    */
    public boolean hasParent() {
        return parent != null;
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

    /**
    In this nodes parent, replace this node all nodes in 'list'.
    @param list
    @return the copy of 'newNode' used
    @throws DocNavException if the this node does not have a parent node
     */
    public NodeList <? extends Node> replaceWith(NodeList list) {
        if (this.getParent() == null) throw new DocNavException("Can not replace a node with no parent.");
        this.parent.replaceChild(this, list);
        return list;
    }
}
