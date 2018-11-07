package ca.sharcnet.nerve.docnav.dom;
import ca.sharcnet.docnav.DocNavException;
import static ca.sharcnet.nerve.docnav.dom.NodeType.*;
import ca.sharcnet.nerve.docnav.query.Query;
import java.util.Iterator;

/**
A node is a DOM object which may have a parent node, child nodes and/or attributes.
The Node class is the parent class to all document nodes, and has no default specified type.
@author edward
*/
public abstract class Node implements Iterable<Node> {
    private NodeList children = new NodeList();
    final AttributeList attributes;
    private final IsNodeType type;
    private Node parent;
    protected String name;

    /**
     * Create a new Node, copy all attributes (as copies) copy all children (as copies).
     * @param type
     * @param name
     * @param attributes
     * @param children
     */
    public Node(IsNodeType type, String name, AttributeList attributes, NodeList children) {
        this.type = type;
        this.name(name);
        this.attributes = new AttributeList(attributes);
        for (Node node : children) this.addChild(node.copy());
    }

    /**
     * Create a new Node, copy all attributes (as copies) copy all children (as copies).
     * @param type
     * @param name
     * @param attributes
     * @param children
     */
    public Node(IsNodeType type, String name, AttributeList attributes) {
        this.type = type;
        this.name(name);
        this.attributes = new AttributeList(attributes);
    }

    /**
     * Create a new Node, with an empty attribute and child lists.
     * @param type
     * @param name
     * @param attributes
     * @param children
     */
    public Node(IsNodeType type, String name) {
        this.type = type;
        this.name(name);
        this.attributes = new AttributeList();
    }

    /**
     * Returns an itertor that iterates only it's self.
     * @return
     */
    @Override
    public Iterator<Node> iterator() {
        return new Iterator<Node>() {
            Node next = Node.this;

            @Override
            public boolean hasNext() {
                return next != null;
            }

            @Override
            public Node next() {
                Node r = next;
                next = null;
                return r;
            }
        };
    }

    public void detach() {
        if (this.parent == null) throw new NullPointerException();
        this.parent.removeChild(this);
    }

    final void setParent(Node parent) {
        this.parent = parent;
    }

    /**
     * Set the node name, may mean different things to different nodes.
     * @param name the name of the node (ie \<name\>\</name\>).
     */
    final public Node name(String name) {
        if (name == null) throw new DocNavException("Node name can not be null");
        this.name = name;
        return this;
    }

    public final String name() {
        return name;
    }

    /**
     * Traverse up the DOM to determine the node depth.
     *
     * @return node depth
     */
    public final int depth() {
        int depth = 0;
        Node current = this.parent;
        while (current != null) {
            depth++;
            current = current.parent;
        }
        return depth;
    }

    /**
     * Return the type of node that was set when created.
     *
     * @return
     */
    public IsNodeType getType() {
        return type;
    }

    /**
     * Determine if this nodes type matches one of the given types.
     *
     * @param types
     * @return
     */
    public boolean isType(IsNodeType... types) {
        for (IsNodeType type : types) {
            if (this.type == type) return true;
        }
        return false;
    }

    /**
     * Return this nodes parent, if this node has not parent the behaviour is
     * undefined.
     *
     * @return
     * @throws DocNavException if the this node does not have a parent node
     */
    public final Node getParent() {
        if (this.parent == null) {
            throw new DocNavException("Node does not have a parent node.");
        }
        return parent;
    }

    /**
     * Determine if this node has a parent node.
     */
    public boolean hasParent() {
        return parent != null;
    }

    /**
     * In this nodes parent, replace this node with 'newNode'.
     *
     * @param nodes
     * @param newNode
     * @return the copy of 'newNode' used
     * @throws DocNavException if the this node does not have a parent node
     */
    public void replaceWith(Iterable<Node> nodes) {
        if (this.parent == null) throw new DocNavException("Can not replace a node with no parent.");
        this.parent.replaceChild(this, nodes);
    }

    /**
     * @return a non-reflective list of this node's attributes
     */
    public AttributeList getAttributes() {
        AttributeList arrayList = new AttributeList();
        for (Attribute a : attributes) arrayList.add(a);
        return arrayList;
    }

    public Node clearAttributes() {
        this.attributes.clear();
        return this;
    }

    /**
     * Determine if this node contains an attribute.
     *
     * @param key the attribute name to poll for
     */
    public final boolean hasAttribute(String key) {
        return attributes.contains(key);
    }

    /**
     * Determine if this node contains an attribute with the given value.
     *
     * @param key the attribute name to poll for
     * @param value
     */
    public final boolean hasAttribute(String key, Object value) {
        if (!attributes.contains(key)) return false;
        return attributes.get(key).value.equals(value.toString());
    }

    /**
     * Retrieve an attribute from this node.
     *
     * @param key the attribute name to retreive
     * @return the attribute to which the specified key is mapped
     * @throws IndexOutOfBoundsException if this node does not have an attribute
     * with 'key'
     */
    public final Attribute getAttribute(String key) {
        if (!attributes.contains(key)) throw new UnknownKeyException(key);
        return attributes.get(key);
    }

    /**
     * Retrive the attribute value from the node, if the node doesn't have the
     * given attribute, return an empty string.
     *
     * @param key the attribute name to retreive
     * @return the value to which the specified key is mapped, if not mapped =>
     * "".
     */
    public final String attr(String key) {
        if (!attributes.contains(key)) return "";
        return attributes.get(key).getValue();
    }

    /**
     * Add an attribute to this node. The attribute passed in is copied before
     * being added.
     *
     * @param attribute the attribute to add
     */
    public final Node attr(Attribute attribute) {
        attributes.add(new Attribute(attribute));
        return this;
    }

    /**
     * Add a new attribute to this node with provided key/value pair;
     *
     * @param key
     * @param value
     */
    public final Node attr(String key, Object value) {
        attributes.add(new Attribute(key, value.toString()));
        return this;
    }

    /**
     * Will remove any attribute with the 'key' value if it exists, otherwise no
     * action is taken.
     *
     * @param key the key string of the attribute to remove
     */
    public Node removeAttribute(String key) {
        if (!attributes.contains(key)) return this;
        this.attributes.remove(key);
        return this;
    }

    /**
     * Copy method.
     * @return a new element node with no parent
     */
    abstract public Node copy();

    /**
    Retrieve a list of ancestor nodes that this node is decended from, and also match 'types'.  If types is not included
    retrieve all ancestor nodes.
    @param types
    @return
     */
    public NodeList ancestorNodes(IsNodeType... types) {
        NodeList nodeList = new NodeList();
        Node current = this;

        while (current.hasParent()) {
            if (types.length == 0 || current.getParent().isType(types)) {
                nodeList.add(current.getParent());
            }
            current = current.getParent();
        }
        return nodeList;
    }

    /**
    Retrieve a list of ancestor nodes that this node is descended from this node, inclusive.
    @param types A list of node types to include in the result.  A non-inclusive type will not terminate the traversal.
    @return
     */
    public NodeList branch(IsNodeType... types) {
        NodeList nodeList = new NodeList();
        Node current = this;

        if (types.length == 0 || current.isType(types)) {
            nodeList.add(current);
        }

        while (current.hasParent()) {
            if (types.length == 0 || current.getParent().isType(types)) {
                nodeList.add(current.getParent());
            }
            current = current.getParent();
        }
        return nodeList;
    }

    /**
    Retrieve a list of child nodes that descend from this element, and also match 'types'.  If types is not included
    retrieve all descendent nodes.
    @param types
    @return
     */
    public NodeList decendentNodes(IsNodeType... types) {
        NodeList nodeList = new NodeList();

        if (types.length == 0) {
            for (Node node : this.children) {
                nodeList.add(node);
                node.decendentNodes(nodeList, types);
            }
        } else {
            for (Node node : this.children) {
                if (node.isType(types)) nodeList.add(node);
                node.decendentNodes(nodeList, types);
            }
        }

        return nodeList;
    }

    /**
    Retrieve a list of child nodes that decend from this element, and also match 'types'.  If types is not included
    retrieve all decendent nodes.  The matched nodes are added to 'nodeList'.
    @param types
    @return
     */
    private NodeList decendentNodes(NodeList nodeList, IsNodeType... types) {
        if (types.length == 0) {
            for (Node node : this.children) {
                nodeList.add(node);
                node.decendentNodes(nodeList, types);
            }
        } else {
            for (Node node : this.children) {
                if (node.isType(types)) nodeList.add(node);
                node.decendentNodes(nodeList, types);
            }
        }

        return nodeList;
    }

    /**
    Retrieve a list of immediate child nodes that match 'types'.  If types is not included retrieve all child nodes.
    @param types
    @return
     */
    public NodeList childNodes(IsNodeType... types) {
        NodeList nodeList = new NodeList();

        if (types.length == 0) {
            for (Node node : this.children) nodeList.add(node);
        } else {
            for (Node node : this.children) if (node.isType(types)) nodeList.add(node);
        }

        return nodeList;
    }

    public int childCount() {
        return children.size();
    }

    /**
     * Remove all child nodes from this node.
     */
    public void clearChildren() {
        for (Node child : children) child.setParent(null);
        children.clear();
    }

    /**
     * Remove a node from a parent
     *
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
     * Append child to this parent. If the child already has a parent, the child
     * is removed from that parent node first. If the child's parent is this
     * node it is first removed then inserted into the list of child nodes.
     *
     * @param child the node to add
     * @return the child node.
     */
    public final Node addChild(Node child) {
        if (child.hasParent()) child.getParent().removeChild(child);
        this.children.add(child);
        child.setParent(this);
        return child;
    }

    /**
     * Add child to this parent at index provided. If the child already has a
     * parent, the child is removed from that parent node first. If the child's
     * parent is this node it is first removed then inserted into the list of
     * child nodes.
     *
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
     * Add all children from a list to the end of this nodes child list.
     *
     * @param nodes a {@link NodeList} of nodes to add
     */
    public void addChild(Iterable<? extends Node> nodes) {
        for (Node node : nodes) this.addChild(node);
    }

    /**
     * Add all children from a list to the end of this nodes child list.
     *
     * @param idx
     * @param nodes a {@link NodeList} of nodes to add
     */
    public void addChild(int idx, Iterable<? extends Node> nodes) {
        for (Node node : nodes) this.addChild(idx++, node);
    }

    /**
     * In this nodes parent, replace this node with this node's children, the
     * child nodes are NOT copied. This is essentially an unwrap function.
     */
    public void replaceWithChildren() {
        Node parent = this.getParent();
        int i = parent.childNodes().indexOf(this);
        getParent().removeChild(this);
        NodeList childNodes = this.childNodes();
        parent.addChild(i, childNodes);
    }

    /**
    Replace the specfied child node with the provided new node or nodes.
    @param child
    @param with
    */
    public void replaceChild(Node child, Iterable<? extends Node> with) {
        if (child.getParent() != this) throw new DocNavException("Can not replace a child from a different parent.");
        int idx = this.children.indexOf(child);
        children.remove(child);
        child.setParent(null);

        for (Node node : with) {
            children.add(idx++, node);
            node.setParent(this);
        }
    }

    /* return a string with this nodes name, id, and classes that will accepted by a query */
    public String toSelect(String... attributes) {
        String id = this.attr("id");
        String classes = this.attr("class");

        StringBuilder builder = new StringBuilder();
        builder.append(this.name());
        if (!id.isEmpty()) builder.append("#").append(id);
        if (!classes.isEmpty()) {
            String[] split = classes.split("[ ]+");
            for (String s : split) builder.append(".").append(s);
        }

        for (String attr : attributes) {
            if (this.hasAttribute(attr)) builder.append("[").append(attr).append("='").append(this.attr(attr)).append("']");
        }

        return builder.toString();
    }

    /**
     * @return an xml compliant string.
     */
    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();

        builder.append("<").append(this.name());
        for (Attribute a : attributes) {
            builder.append(" ").append(a.toRawString());
        }
        builder.append(">");
        for (Node n : children) builder.append(n.toString());
        builder.append("</").append(this.name()).append(">");

        return builder.toString();
    }

    /**
     * @return an xml compliant string.
     */
    public String toString(int indent) {
        StringBuilder builder = new StringBuilder();

        for (int i = 0; i < indent * this.depth(); i++) builder.append(" ");
        builder.append("<").append(this.name());
        for (Attribute a : attributes) {
            builder.append(" ").append(a.toRawString());
        }
        builder.append(">\n");

        for (Node n : children) builder.append(n.toString(indent));

        for (int i = 0; i < indent * this.depth(); i++) builder.append(" ");
        builder.append("</").append(this.name()).append(">\n");

        return builder.toString();
    }

    /**
     * @return an xml compliant string.
     */
    public String toString(boolean innerText) {
        StringBuilder builder = new StringBuilder();

        builder.append("<").append(this.name());
        for (Attribute a : attributes) {
            builder.append(" ").append(a.toRawString());
        }
        builder.append(">");
        if (innerText) for (Node n : children) builder.append(n.toString(innerText));
        builder.append("</").append(this.name()).append(">");

        return builder.toString();
    }

    /**
     * The inner text for an element node is the concatanation of the inner text
     * for all it's child elements and it's text nodes.
     *
     * @return
     */
    public String text() {
        if (this.isType(TEXT)) return ((TextNode) this).getText();

        StringBuilder builder = new StringBuilder();
        for (Node n : children) {
            if (n.isType(TEXT)) {
                builder.append(((TextNode) n).getText());
            } else if (n.isType(ELEMENT)) {
                builder.append(n.text());
            }
        }
        return builder.toString();
    }

    /**
    Using the provided selection string, select all <b>element</b> nodes that are a decended from this node.
    @param select
    @param types
    @return
     */
    public Query query(String select) {
        return this.query(NodeType.ELEMENT).filter(select);
    }

    /**
    Select all element nodes using the specified format string and arguments.
    @param select
    @param args
    @return
     */
    public Query queryf(String select, Object... args) {
        return this.query(NodeType.ELEMENT).filterf(select, args);
    }

    /**
    Select all decendent nodes that match any type in 'types'.  Calling this method with no arguments will return an
    empty set.  To get a set of all nodes, of all types, use query(NodeType.values()).
    @param select
    @param types
    @return
     */
    public Query query(IsNodeType... types) {
        return new Query(this.decendentNodes(types), "*");
    }
}
