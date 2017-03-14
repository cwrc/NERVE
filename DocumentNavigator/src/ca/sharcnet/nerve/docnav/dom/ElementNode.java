package ca.sharcnet.nerve.docnav.dom;

import java.util.function.Consumer;
import java.util.function.Function;

/**
A {@link Node} that allows for attributes and children.  Any time a mutable object,
such as another element is added to this this node a copy is made.  Any time a
collection is returned from this object ({@link ElementNode#childNodes()}, {@link ElementNode#getAttributes()})
the colleciton returned is non-mutable.
@author edward
 */
public class ElementNode extends Node {

    private final NodeList<Node> children;
    private final AttributeList attributes;

    /**
    By-value constructor, without children or attributes.
    @param name a non-null non-empty string
    @throws NullPointerException if name is null or empty.
     */
    public ElementNode(String name) {
        this(NodeType.ELEMENT, name, null, null, null);
    }

    /** a convienince function to create an element node with just one text node
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
        this(NodeType.ELEMENT, name, attributes, children, null);
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
    ElementNode(NodeType type, String name, AttributeList attributes, NodeList<Node> children, ElementNode parent) {
        super(NodeType.ELEMENT, "", name, parent);
        if (name.isEmpty()) throw new NullPointerException();

        this.attributes = new AttributeList();
        if (attributes != null) {
            for (Attribute a : attributes) this.addAttribute(a);
        }

        this.children = new NodeList<>();
        if (children != null) {
            for (Node a : children) this.addChild(a);
        }
    }

    /**
        Remove all child nodes from this node;
     */
    public void clearChildren() {
        this.children.clear();
    }

    public int childCount(){
        return children.size();
    }

    public void clearAttributes() {
        this.attributes.clear();
    }

    /**
    Copy constructor that accepts a new parent node value.
    @param newParent
    @return
     */
    @Override
    ElementNode copy(ElementNode newParent) {
        return new ElementNode(getType(), getName(), attributes, children, newParent);
    }

    /**
    Copy constructor.
    @return a new element node with no parent
     */
    @Override
    public ElementNode copy() {
        return new ElementNode(getType(), getName(), attributes, children, null);
    }

    /**
     * add a copy of 'child' to the tail of this nodes list.
     * @param child the node to add
     * @return the copy of 'child' that was inserted
     */
    public final Node addChild(Node child) {
        Node copy = child.copy(this);
        children.add(copy);
        return copy;
    }

    /**
     * Add a copy of 'child' to this nodes child node list at a given index.
     * @param index the index the child node will be located at
     * @param child the child node to add
     * @return the copy of 'child' that was inserted
     */
    public Node addChild(int index, Node child) {
        Node copy = child.copy(this);
        children.add(index, copy);
        return copy;
    }

    /**
    Determine if this node contains an attribute.
    @param key the attribute name to poll for
     */
    public final boolean hasAttribute(String key) {
        assert attributes != null;
        return attributes.contains(key);
    }

    /**
    Retrieve and attribute from this node.
    @param key the attribute name to retreive
    @return the attribute to which the specified key is mapped
    @throws IndexOutOfBoundsException if this node does not have an attribute with 'key'
     */
    public final Attribute getAttribute(String key) {
        if (!attributes.contains(key)) throw new IndexOutOfBoundsException();
        return attributes.get(key);
    }

    /**
    Retrive the attribute value from the node, if the node doesn't have the
    given attribute, return an empty string.
    @param key the attribute name to retreive
    @return the value to which the specified key is mapped, if not mapped => "".
     */
    public final String getAttributeValue(String key) {
        if (!attributes.contains(key)) return "";
        return attributes.get(key).getValue();
    }

    /**
    Add an attribute to this node.  The attribute passed in is copied before
    being added.
    @param attribute the attribute to add
     */
    public final void addAttribute(Attribute attribute) {
        attributes.add(new Attribute(attribute));
    }

    /**
    Add a new attribute to this node with provided key/value pair;
    @param key
    @param value
     */
    public final void addAttribute(String key, String value) {
        attributes.add(new Attribute(key, value));
    }

    /**
     * Will remove any attribute with the 'key' value if it exists, otherwise
     * no action is taken.
     * @param key the key string of the attribute to remove
     */
    public void removeAttribute(String key) {
        if (!attributes.contains(key)) return;
        this.attributes.remove(key);
    }

    /**
    @return an xml compliant string.
     */
    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();

        builder.append("<").append(this.getName());
        for (Attribute a : attributes) {
            builder.append(" ").append(a.toString());
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
    for all it's child nodes.  Unlike {@see toString} the surrounding tags
    are ommitted.
     * @return
     */
    @Override
    public String innerText() {
        StringBuilder builder = new StringBuilder();
        for (Node n : children) builder.append(n.innerText());
        return builder.toString();
    }

    /**
    If recurse is true, return a concatanation of the inner text for all it's child nodes.
    If recurse if false, return a concatanation of the inner text for all it's child nodes of type TEXT.
    Unlike {@see toString} the surrounding tags are ommitted.
     * @return
     */
    public String innerText(boolean recurse) {
        if (recurse) return innerText();

        StringBuilder builder = new StringBuilder();
        for (Node n : children) {
            if (n.getType() == Node.NodeType.TEXT) {
                builder.append(n.innerText());
            }
        }
        return builder.toString();
    }

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
    public String endTag() {
        StringBuilder builder = new StringBuilder();
        builder.append("</").append(this.getName()).append(">");
        return builder.toString();
    }

    /**
     * @return a non-reflective list of this node's child nodes
     */
    public NodeList<Node> childNodes() {
        return new NodeList<>(this.children);
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
     * @return a non-reflective list of this node's attributes
     */
    public AttributeList getAttributes() {
        AttributeList arrayList = new AttributeList();
        for (Attribute a : attributes) arrayList.add(a);
        return arrayList;
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

    public Node removeChild(Node node) {
        children.remove(node);
        return node;
    }

    /**
    Add all children from a list to the end of this nodes child list.
    @param nodes a {@link NodeList} of nodes to add
     */
    public void addChildNodes(NodeList<Node> nodes) {
        for (Node node : nodes) this.addChild(node);
    }

    /**
    Retrieve a specific child node by index.
    @param index the location of the child to retrieve
    @return the node located at index
     */
    public Node getChild(int index) {
        return this.childNodes().get(index);
    }

    /*
    In this nodes parent, replace this node with this node's children, the child
    nodes are NOT copied.
     */
    public void replaceWithChildren() {
        if (this.getParent() == null) throw new DocNavException("Can not replace a node with no parent.");

        int i = getParent().childNodes().indexOf(this);
        getParent().removeChild(this);

        for (Node node : this.children) {
            getParent().children.add(i, node);
            node.setParent(getParent());
        }
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
        return recursiveNodesByName(name, new NodeList<>(), caseSensative, null);
    }

    public NodeList<ElementNode> getElementsByName(String name, boolean caseSensative) {
        if (name.equals("*")) return getAllElements(new NodeList<>());
        else return recursiveNodesByName(name, new NodeList<>(), caseSensative, NodeType.ELEMENT);
    }

    private NodeList<ElementNode> getAllElements(NodeList<ElementNode> list){
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
    Returns a new node with a different name keeping the other parameters.
    The new node will not have a parent, all child nodes will also be copied.
    @param name
    @return
     */
    @Override
    public ElementNode renameCopy(String name) {
        return new ElementNode(this.getType(), name, this.getAttributes(), this.childNodes(), null);
    }

    public ElementNode setName(String name) {
        if (name.startsWith("@")
            || name.contains(" ")) {
            throw new RuntimeException("Invalid node name");
        }
        super.name = name;
        return this;
    }

    /**
    Returns a new node with a different type keeping the other parameters.
    The new node will not have a parent, all child nodes will also be copied.
    @param type
    @return
     */
    @Override
    public ElementNode retypeCopy(NodeType type) {
        return new ElementNode(type, this.getName(), this.getAttributes(), this.childNodes(), null);
    }

    public String toTreeString() {
        StringBuilder builder = new StringBuilder();
        this.toTreeString(0, builder);
        return builder.toString();
    }

    private void toTreeString(int depth, StringBuilder builder) {
        for (int i = 0; i < depth; i++) builder.append("    ");
        builder.append(this.startTag()).append("\n");

        for (Node child : this.children) {
            if (child.getType() == NodeType.ELEMENT) {
                ((ElementNode) child).toTreeString(depth + 1, builder);
            }
        }

        for (int i = 0; i < depth; i++) builder.append("    ");
        builder.append(this.endTag()).append("\n");
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
}
