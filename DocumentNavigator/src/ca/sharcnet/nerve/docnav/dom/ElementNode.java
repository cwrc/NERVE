package ca.sharcnet.nerve.docnav.dom;

import static ca.sharcnet.nerve.docnav.dom.NodeType.*;
import ca.sharcnet.nerve.docnav.selector.Select;
import java.util.List;
import java.util.function.Consumer;

/**
A {@link Node} that allows for attributes and children.  Any time a mutable object,
such as another element is added to this this node a copy is made.  Any time a
collection is returned from this object ({@link ElementNode#childNodes()}, {@link ElementNode#getAttributes()})
the collection returned is non-mutable.
@author edward
 */
public class ElementNode extends AttributeNode {

    private final NodeList<Node> children = new NodeList<>();

    /**
    By-value constructor, without children or attributes.
    @param name a non-null non-empty string
    @throws NullPointerException if name is null or empty.
     */
    public ElementNode(String name) {
        this(NodeType.ELEMENT, name, null, null);
    }

    /** a convenience function to create an element node with just one text node
    as a child
     * @param name
     * @param text
     */
    public ElementNode(String name, String text) {
        this(name);
        this.addChild(new TextNode(text));
    }

    /**
    By-value constructor.
    @param name a non-null non-empty string
    @param attributes list of attributes to be added, null is consided an empty list.
    @param children list of child nodes to be added, null is considered an empty list.
    @throws NullPointerException if name is null or empty.
     */
    public ElementNode(String name, AttributeList attributes, NodeList<Node> children) {
        this(NodeType.ELEMENT, name, attributes, children);
    }

    /**
    By-value constructor used to add child nodes to an element, or to construct
    nodes that extend element node ({@link Document}).
    @param type the type of node this is.
    @param name a non-null non-empty string
    @param attributes list of attributes to be added, null is consided an empty list.
    @param children list of child nodes to be added, null is considered an empty list.
    @param parent the parent of this node.
     */
    protected ElementNode(IsNodeType type, String name, AttributeList attributes, NodeList<Node> children) {
        super(type, name, attributes);
        if (name.isEmpty()) throw new NullPointerException();

        if (children != null) {
            for (Node child : children) this.addChild(child.copy());
        }
    }

    /**
    Copy method.
    @return a new element node with no parent
     */
    @Override
    public ElementNode copy() {
        return new ElementNode(getType(), getName(), attributes, children);
    }

    @Override
    public NodeType getType() {
        return (NodeType) super.getType();
    }

    public NodeList<Node> childNodes() {
        return new NodeList<>(this.children);
    }

    public int childCount() {
        return children.size();
    }

    /**
     *  Remove all child nodes from this node.
     */
    public void clearChildren() {
        for (Node child : children) child.setParent(null);
        children.clear();
    }

    /**
     * Remove a node from a parent
     * @param child the node to remove
     * @return the node removed, null if this node does not contain child.
     */
    public Node removeChild(Node child) {
        if (child == null) throw new NullPointerException();
        if (child.getParent() != this) return null;
        this.children.remove(child);
        child.setParent(null);
        return child;
    }

    /**
     * Append child to this parent.  If the child already has a
     * parent, the child is removed from that parent node first.  If the child's
     * parent is this node it is first removed then inserted into the list of
     * child nodes.
     * @param child the node to add
     * @return the child node.
     */
    public Node addChild(Node child) {
        if (child.hasParent()) child.getParent().removeChild(child);
        this.children.add(child);
        child.setParent(this);
        return child;
    }

    /**
     * Add child to this parent at index provided.  If the child already has a
     * parent, the child is removed from that parent node first.  If the child's
     * parent is this node it is first removed then inserted into the list of
     * child nodes.
     * @param index The location to add the child node at.
     * @param child the node to add
     * @return the child node.
     */
    public Node addChild(int index, Node child) {
        if (child.hasParent()) child.getParent().removeChild(child);
        this.children.add(index, child);
        child.setParent(this);
        return child;
    }

    /**
    Add all children from a list to the end of this nodes child list.
    @param nodes a {@link NodeList} of nodes to add
     */
    public void addChild(List<? extends Node> nodes) {
        for (Node node : nodes) this.addChild(node);
    }

    /**
    Add all children from a list to the end of this nodes child list.
     * @param idx
    @param nodes a {@link NodeList} of nodes to add
     */
    public void addChild(int idx, List<? extends Node> nodes) {
        for (Node node : nodes) this.addChild(idx++, node);
    }

    /**
     * In this nodes parent, replace this node with this node's children, the child
     * nodes are NOT copied.  This is essentially an unwrap function.
     */
    public void replaceWithChildren() {
        if (this.getParent() == null) throw new DocNavException("Can not replace a node with no parent.");

        ElementNode parent = this.getParent();
        int i = parent.childNodes().indexOf(this);
        getParent().removeChild(this);
        NodeList<Node> childNodes = this.childNodes();
        parent.addChild(i, childNodes);
    }

    public Node replaceChild(Node child, Node with) {
        if (child.getParent() != this) throw new DocNavException("Can not replace a child from a different parent.");
        int idx = this.children.indexOf(child);
        children.remove(child);
        child.setParent(null);
        children.add(idx, with);
        with.setParent(this);
        return with;
    }

    public List<? extends Node> replaceChild(Node child, List<? extends Node> with) {
        if (child.getParent() != this) throw new DocNavException("Can not replace a child from a different parent.");
        int idx = this.children.indexOf(child);
        children.remove(child);
        child.setParent(null);

        for (Node node : with) {
            this.children.add(idx++, node);
            node.setParent(this);
        }
        return with;
    }

    /**
    Apply 'consumer' to this node and to all child elements in pre-order depth
    first search.
    @param consumer
     */
    @Deprecated
    public void recurse(Consumer<ElementNode> consumer) {
        recurseParentFirst(consumer);
    }

    @Deprecated
    private void recurseParentFirst(Consumer<ElementNode> consumer) {
        consumer.accept(this);
        for (Node node : children) {
            if (node.getType() == NodeType.ELEMENT) {
                ((ElementNode) node).recurseParentFirst(consumer);
            }
        }
    }

    @Deprecated
    private void recurseChildFirst(Consumer<ElementNode> consumer) {
        for (Node node : children) {
            if (node.getType() == NodeType.ELEMENT) {
                ((ElementNode) node).recurseChildFirst(consumer);
            }
        }
        consumer.accept(this);
    }

    /**
    Apply 'consumer' to this node and to all child elements in pre-order depth
    first search.
    @param consumer
     */
    @Deprecated
    public void recurse(Consumer<ElementNode> consumer, RecurseOrder order) {
        switch (order) {
            case PARENTFIRST:
                this.recurseParentFirst(consumer);
                break;
            case CHILDFIRST:
                this.recurseChildFirst(consumer);
                break;
        }
    }

    public Select select() {
        return new Select(this);
    }

    /**
    @return an xml compliant string.
     */
    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();

        builder.append("<").append(this.getName());
        for (Attribute a : attributes) {
            builder.append(" ").append(a.toRawString());
        }
        builder.append(">");
        for (Node n : children) builder.append(n.toString());
        builder.append("</").append(this.getName()).append(">");

        return builder.toString();
    }

    /**
    @return an xml compliant string.
     */
    public String toString(boolean innerText) {
        StringBuilder builder = new StringBuilder();

        builder.append("<").append(this.getName());
        for (Attribute a : attributes) {
            builder.append(" ").append(a.toRawString());
        }
        builder.append(">");
        if (innerText) for (Node n : children) builder.append(n.toString());
        builder.append("</").append(this.getName()).append(">");

        return builder.toString();
    }

    /**
    The inner text for an element node is the concatanation of the inner text
    for all it's child nodes.
     * @return
     */
    public String innerText() {
        StringBuilder builder = new StringBuilder();
        for (Node n : children) {
            if (n.isType(TEXT)) {
                builder.append(((TextNode) n).getText());
            } else if (n.isType(ELEMENT)) {
                builder.append(((ElementNode) n).innerText());
            }
        }
        return builder.toString();
    }

    // </editor-fold>
}