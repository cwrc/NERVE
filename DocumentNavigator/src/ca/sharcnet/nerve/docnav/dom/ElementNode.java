package ca.sharcnet.nerve.docnav.dom;
import static ca.sharcnet.nerve.docnav.dom.NodeType.*;
import ca.sharcnet.nerve.docnav.selector.Select;
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

    /**
    By-value constructor, without children or attributes.
    @param name a non-null non-empty string
    @throws NullPointerException if name is null or empty.
     */
    public ElementNode(String name, AttributeList attributes) {
        super(NodeType.ELEMENT, name, attributes);
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
    ElementNode(NodeType type, String name, AttributeList attributes, NodeList<Node> children) {
        super(NodeType.ELEMENT, name, attributes);
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
    public NodeType getType(){
        return (NodeType) super.getType();
    }

    public NodeList<Node> childNodes(){
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
    public void addChildNodes(NodeList<Node> nodes) {
        for (Node node : nodes) this.addChild(node);
    }

    /**
     * @return a non-reflective list of this node's child element nodes
     */
    public NodeList<ElementNode> childElements() {
        NodeList<ElementNode> nodes = new NodeList<>();

        for (Node node : this.children) {
            if (node.getType() == NodeType.ELEMENT) {
                nodes.add((ElementNode) node);
            }
        }

        return nodes;
    }

    /**
    Search the node tree to determine if it contains 'node'.
    @param node the node to search for
    @return true if the node is found, otherwise false
     */
    public boolean contains(Node node) {
        if (this.children.contains(node)) return true;
        NodeList<Node> nodesByType = this.getNodesByType(NodeType.ELEMENT);
        for (Node child : nodesByType) {
            ElementNode ele = (ElementNode) child;
            if (ele.contains(node)) return true;
        }
        return false;
    }

    /**
     * In this nodes parent, replace this node with this node's children, the child
     * nodes are NOT copied.  This is essentially an unwrap function.
     */
    public void replaceWithChildren() {
        if (this.getParent() == null) throw new DocNavException("Can not replace a node with no parent.");

        int i = getParent().childNodes().indexOf(this);
        ElementNode parent = this.getParent();
        getParent().removeChild(this);
        NodeList<Node> childNodes = this.childNodes();

        for (Node node : childNodes) {
            parent.addChild(i, node);
            /* should i be i++ ? */
        }
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

    public NodeList<Node> replaceChild(Node child, NodeList<Node> with) {
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
     Retrieve a list of all child nodes with the given name from this node
     and all child nodes recursively.
     @param name
     @return
     */
    public NodeList<Node> getNodesByName(String name) {
        return getNodesByName(name, false);
    }

    public NodeList<ElementNode> getElementsByName(String name) {
        return getElementsByName(name, false);
    }

    /**
     Retrieve a list of all child nodes with the given name from this node
     and all child nodes recursively.
     @param name
     @param caseSensative if true perform a case senstative search.
     @return
     */
    public NodeList<Node> getNodesByName(String name, boolean caseSensative) {
        if (name.equals("*")) return getAllNodes(new NodeList<>());
        return recursiveNodesByName(name, new NodeList<>(), caseSensative, null);
    }

    public NodeList<ElementNode> getElementsByName(String name, boolean caseSensative) {
        if (name.equals("*")) return getAllElements(new NodeList<>());
        else return recursiveNodesByName(name, new NodeList<>(), caseSensative, NodeType.ELEMENT);
    }

    private NodeList<Node> getAllNodes(NodeList<Node> list) {
        list.add(this);
        for (Node node : this.children) {
            if (node.getType() == NodeType.ELEMENT) {
                ((ElementNode) node).getAllNodes(list);
            } else {
                list.add(node);
            }
        }
        return list;
    }

    private NodeList<ElementNode> getAllElements(NodeList<ElementNode> list) {
        list.add(this);
        for (Node node : this.children) {
            if (node.getType() == NodeType.ELEMENT) {
                ((ElementNode) node).getAllElements(list);
            }
        }
        return list;
    }

    private <T extends Node> NodeList<T> recursiveNodesByName(String name, NodeList list, boolean caseSensative, NodeType type) {
        if (!caseSensative && this.getName().equals(name)) {
            if (type == null) list.add(this);
            else if (this.getType() == type) list.add(this);
        } else if (this.getName().toLowerCase().equals(name.toLowerCase())) {
            if (type == null) list.add(this);
            else if (this.getType() == type) list.add(this);
        }

        for (Node node : this.children) {
            if (node.getType() == NodeType.ELEMENT) {
                ((ElementNode) node).recursiveNodesByName(name, list, caseSensative, type);
            }
        }

        return list;
    }

    public NodeList<Node> getNodesByType(NodeType type) {
        return getNodesByType(type, new NodeList<>());
    }

    private NodeList<Node> getNodesByType(NodeType type, NodeList<Node> list) {
        if (this.getType() == type) {
            list.add(this);
        }

        for (Node node : this.children) {
            if (node.getType() == NodeType.ELEMENT) {
                ((ElementNode) node).getNodesByType(type, list);
            } else {
                if (node.getType() == type) {
                    list.add(node);
                }
            }
        }

        return list;
    }

    /**
     * Returns a list of all element nodes with the given name from a recursive
     * search.
     * @param attrName
     * @return
     */
    public NodeList<Node> getNodesByAttribute(String attrName) {
        return getNodesByAttribute(attrName, null, new NodeList());
    }

    /**
     * Returns a list of all element nodes with the given name-value pair.
     * @param attrName
     * @param attrValue
     * @return
     */
    public NodeList<Node> getNodesByAttribute(String attrName, String attrValue) {
        return getNodesByAttribute(attrName, attrValue, new NodeList<>());
    }

    private NodeList<Node> getNodesByAttribute(String attrName, String attrValue, NodeList list) {
        if (this.attributes.contains(attrName))
            if (attrValue == null) {
                list.add(this);
            } else {
                Attribute attr = this.attributes.get(attrName);
                if (attr.getValue().equals(attrValue)) {
                    list.add(this);
                }
            }

        for (Node node : this.children) {
            if (node.getType() == NodeType.ELEMENT) {
                ((ElementNode) node).getNodesByAttribute(attrName, attrValue, list);
            }
        }

        return list;
    }

    /**
    Retrieve a recrusive list of all child nodes.
    @return an in-order list of all child nodes
     */
    public NodeList<Node> nodes() {
        NodeList<Node> list = new NodeList<>();
        nodes(list, this);
        return list;
    }

    /**
    @return an in-order recursive list of all child nodes
     */
    private void nodes(NodeList<Node> list, ElementNode current) {
        list.add(current);
        for (Node child : current.childNodes()) {
            if (child.getType() == NodeType.ELEMENT) {
                nodes(list, (ElementNode) child);
            } else {
                list.add(child);
            }
        }
    }

    /**
    Retrieve an inorder list of all nodes from the document root to this node,
    inclusive.
    @return
     */
    public NodePath getNodePath() {
        NodePath list = new NodePath();
        list.add(this);

        ElementNode current = this.getParent();
        while (current != null && !current.getName().equals("@DOCUMENT")) {
            list.add(0, current);
            current = current.getParent();
        }

        return list;
    }

    /**
    Apply 'consumer' to this node and to all child elements in pre-order depth
    first search.
    @param consumer
     */
    public void recurse(Consumer<ElementNode> consumer) {
        recurseParentFirst(consumer);
    }

    private void recurseParentFirst(Consumer<ElementNode> consumer) {
        consumer.accept(this);
        for (Node node : children) {
            if (node.getType() == NodeType.ELEMENT) {
                ((ElementNode) node).recurseParentFirst(consumer);
            }
        }
    }

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

    // <editor-fold defaultstate="collapsed" desc="String building methods">
    /**
    @return a string that represtents an xml start tag
     */
    public String startTag() {
        StringBuilder builder = new StringBuilder();

        builder.append("<").append(this.getName());
        for (Attribute a : attributes) {
            builder.append(" ").append(a.toString());
        }
        builder.append(">");
        return builder.toString();
    }

    /**
    @return a string that represtents an xml end tag
     */
    /**
     * Conver this node to a string without traversing child nodes
     * @return
     */
    public String toShortString() {
        StringBuilder builder = new StringBuilder();

        builder.append("<").append(this.getName());
        for (Attribute a : attributes) {
            builder.append(" ").append(a.toString());
        }
        builder.append(">");
        if (this.childCount() > 0) builder.append("...");
        builder.append("</").append(this.getName()).append(">");
        return builder.toString();
    }

    public String endTag() {
        StringBuilder builder = new StringBuilder();
        builder.append("</").append(this.getName()).append(">");
        return builder.toString();
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
    public String toString(int indent) {
        return toString(indent, 0);
    }

    /**
    @return an xml compliant string.
     */
    private String toString(int indent, int mult) {
        StringBuilder builder = new StringBuilder();
        int spaces = indent * mult;

        for (int i = 0; i < spaces; i++) builder.append(".");
        builder.append("<").append(this.getName());
        for (Attribute a : attributes) {
            builder.append(" ").append(a.toString());
        }
        builder.append(">\n");

        for (Node n : children) {
            if (n.getType() == NodeType.ELEMENT) {
                ElementNode e = (ElementNode) n;
                builder.append(e.toString(indent, mult + 1));
            } else {
                builder.append(n.toString());
            }
        }

        for (int i = 0; i < spaces; i++) builder.append(",");
        builder.append("</").append(this.getName()).append(">\n");
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
                builder.append(((TextNode)n).getText());
            }
            else if (n.isType(ELEMENT)) {
                builder.append(((ElementNode)n).innerText());
            }
        }
        return builder.toString();
    }

    // </editor-fold>
}
