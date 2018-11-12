package ca.sharcnet.nerve.docnav.query;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.IsNodeType;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.dom.TextNode;
import java.util.Arrays;
import java.util.List;

public class Query extends NodeList {
    private SelectAny selectAny;
    private String select;

    public Query() {
        this.select = "";
    }

    public Query(Iterable<Node> iterable, String select) {
        this.select = select;
        selectAny = new SelectAny(select);

        for (Node element : iterable) {
            if (selectAny.check(element)) this.add(element);
        }
    }
    
    public Query(Node node){
        this.add(node);
    }

    public String getSelectString(){
        return select;
    }

    public String toString() {
        if (this.isEmpty()) return "[]";

        StringBuilder builder = new StringBuilder();

        builder.append("[");
        for (int i = 0; i < this.size() - 1; i++) {
            builder.append(this.get(i).toSelect()).append(", ");
        }
        builder.append(this.get(this.size() - 1).toSelect());
        builder.append("]");
        return builder.toString();
    }

    public String toString(String ... attributes) {
        if (this.isEmpty()) return "[]";

        StringBuilder builder = new StringBuilder();

        builder.append("[");
        for (int i = 0; i < this.size() - 1; i++) {
            builder.append(this.get(i).toSelect(attributes)).append(", ");
        }
        builder.append(this.get(this.size() - 1).toSelect(attributes));
        builder.append("]");
        return builder.toString();
    }

    /* Query operations */
    /**
        Change the name of all elements in this query return the value of the first element.
        @param name
     * @return
     */
    public String name(String name) {
        this.forEach(n -> n.name(name));
        return this.get(0).name();
    }

    /**
        Return the name value of the first element in this query.'
        Returns null if there are no selected elements.
     */
    public String name() {
        if (this.isEmpty()) return null;
        return this.get(0).name();
    }

    /**
        Adds the specified class(es) to each element in the set of matched elements.  Each string is assumed to be a
        space seperated list of class names. It's important to note that this method does not replace a class. It simply
        adds the class, appending it to any which may already be assigned to the elements. It will only add the class
        if it is not already present.
        @param classNames Zero or more strings, each of which is a space deliminated list of classNames.
     */
    public void addClass(String... classNames) {
        this.forEach(node -> {
            String prevClassAttr = node.attr("class");
            List<String> has = Arrays.asList(prevClassAttr.split("[ ]+"));

            for (String s1 : classNames) {
                String[] split = s1.split("[ ]+");
                for (String s2 : split) {
                    if (!has.contains(s2)) {
                        if (prevClassAttr.isEmpty()) prevClassAttr = s2;
                        else prevClassAttr += " " + s2;
                    }
                }
            }

            node.attr("class", prevClassAttr);
        });
    }

    /**
        Determine whether any of the matched elements are assigned the given class.
        @param classNames Zero or more strings, each of which is a space deliminated list of classNames.
        @return true if any element in the query contains any of the listed classnames.
     */
    public boolean hasClass(String... classNames) {
        for (Node node : this) {
            String prevClassAttr = node.attr("class");
            List<String> has = Arrays.asList(prevClassAttr.split("[ ]+"));

            for (String s1 : classNames) {
                String[] split = s1.split("[ ]+");
                for (String s2 : split) {
                    if (has.contains(s2)) return true;
                }
            }
        };
        return false;
    }

    /**
    Description: Remove a single class, multiple classes, or all classes from each element in the set of matched
    elements.  If one or more class names are included as a parameter, then only those classes will be removed from the
    set of matched elements. If no class names are specified in the parameter, all classes will be removed.  If the
    class name is repeated in the class attribute the behavior is undefined.
    @param classNames
     */
    public void removeClass(String... classNames) {
        if (classNames.length == 0) {
            this.forEach(n -> n.removeAttribute("class"));
            return;
        }

        for (Node node : this) {
            String prevClassAttr = node.attr("class");

            for (String s1 : classNames) {
                String[] split = s1.split("[ ]+");
                for (String s2 : split) {
                    prevClassAttr = prevClassAttr.replaceAll(s2, "");
                }
            }

            prevClassAttr = prevClassAttr.trim();
            if (prevClassAttr.isEmpty()) node.removeAttribute("class");
            else node.attr("class", prevClassAttr);
        }
    }

    /**
        Remove all matched elements from the document after refining the selection.
     * @param select
     */
    public void remove(String select) {
        Query filter = this.filter(select);
        filter.detach();
    }

    /**
        Remove all matched elements from the document.
     */
    public void detach() {
        try {
            this.forEach(node -> node.detach());
        } catch (NullPointerException ex) {
            throw new QueryOperationException(ex);
        }
    }

    /**
    Replace all selected nodes with their children.
     */
    public void extract() {
        this.forEach(node -> node.replaceWithChildren());
    }

    /**
    Retrieve the attribute value for the first matched element.  Returns an empty string if no attribute is found or the set is
    empty.
    @param key
    @param value
    @return
     */
    public String attr(String key) {
        if (this.isEmpty()) return "";
        Node node = this.get(0);
        if (!node.hasAttribute(key)) return "";
        return node.attr(key);
    }

    /**
    Determine if the first matched element contains the given attribute.
    Returns false if no elements are selected.
    @param key
    @param value
    @return
     */
    public Boolean hasAttr(String key) {
        if (this.isEmpty()) return false;
        Node node = this.get(0);
        return node.hasAttribute(key);
    }

    /**
    Remove the attribute for all matched elements.  No operation taken on elements without the attribute.
    empty.
    @param key
    @return
     */
    public void removeAttr(String key) {
        this.forEach(node -> node.removeAttribute(key));
    }

    /**
    Set the attribute of all matched element.s
    @param key
    @param value
     */
    public void attr(String key, Object value) {
        this.forEach(node -> node.attr(key, value));
    }

    /**
        Return the child elemants of each matched element as a new query.
     */
    public Query children(IsNodeType... types) {
        if (types.length == 0) types = new IsNodeType[]{NodeType.ELEMENT};
        Query query = new Query();
        for (Node node : this) query.add(node.childNodes(types));
        return query;
    }

    /**
    Return a new query of elements which are contained in both queries.
    @param that
    @return
     */
    public Query intersect(Query match) {
        Query query = new Query();
        this.forEach(n1 -> {
            match.forEach(n2 -> {
                if (n1 == n2) query.add(n1);
            });
        });
        return query;
    }

    /**
    Return a new query of elements which are 'this' and not in 'that'.
    @param that
    @return
     */
    public Query unique(Query that) {
        Query query = new Query();
        this.forEach(n1 -> {
            if (!that.contains(n1)) query.add(n1);
        });
        return query;
    }

    /**
    Return a new query of elements which are 'this' or in 'that', but not in both.
    @param that
    @return
     */
    public Query xor(Query that) {
        Query query = new Query();
        this.forEach(node -> {
            if (!that.contains(node)) query.add(node);
        });
        that.forEach(node -> {
            if (!this.contains(node)) query.add(node);
        });
        return query;
    }

    /**
    Returns the text content of the first element (and all it's decendents).
     * @return The text of the first element, or null if query is empty.
     */
    public String text() {
        if (this.isEmpty()) return null;
        return this.get(0).text();
    }

    /**
    Replaces all children of each selected element with a single text node containing the specified string.
     * @param string
     */
    public void text(String string) {
        this.forEach(node -> {
            node.clearChildren();
            node.addChild(new TextNode(string));
        });
    }

    /**
    Create a copy of each selected node.  These copies will be detached from a parent, but will
    contain children, copies of which may also be returned.
    @return a query containing all copies.
     */
    public Query copy() {
        Query query = new Query();
        this.forEach(n -> query.add(n.copy()));
        return query;
    }

    /**
     * Add a copy of 'node' to the beginning of each selected element.  Given the child nodes of a selected element
     * = {c0 ... cN}, child nodes + {n0 ... nN} = {n0 ... nN, c0 ... cN}.
     * @param nodes
     */
    public void append(Iterable<Node> nodes) {
        for (Node n : this) {
            for (Node m : nodes) {
                n.addChild(m.copy());
            }
        }
    }

    /**
     * Add a copy of 'node' to the beginning of each selected element.  Given the child nodes of a selected element
     * = {c0 ... cN}, child nodes + {n0 ... nN} = {n0 ... nN, c0 ... cN}.
     * @param nodes
     */
    public void prepend(Iterable<Node> nodes) {
        for (Node n : this) {
            int k = 0;
            for (Node m : nodes) {
                n.addChild(k++, m.copy());
            }
        }
    }

    /**
    Attach a new node with 'name' to the end of all selected elements.
    @param name
    @return a query containing all new nodes.
     */
    public Query appendNew(String name) {
        Query query = new Query();
        this.forEach(n -> {
            Node elementNode = new ElementNode(name);
            query.add(elementNode);
            n.addChild(elementNode);
        });
        return query;
    }

    /**
    Attach a new node with 'name' to the beginning of all selected elements.
    @param name
    @return a query containing all new nodes.
     */
    public Query prependNew(String name) {
        Query query = new Query();
        this.forEach(n -> {
            Node elementNode = new ElementNode(name);
            query.add(0, elementNode);
            n.addChild(0, elementNode);
        });
        return query;
    }

    /**
    Return the first node, null if empty.
    @return
    */
    public Node first() {
        if (this.isEmpty()) return null;
        return this.get(0);
    }

    /**
    Return the last node, null if empty.
    @return
    */
    public Node last() {
        if (this.isEmpty()) return null;
        return this.get(this.size() - 1);
    }

    /*
    Replace the first Node in this list with copies of all nodes in 'list'.
    */
    public NodeList replaceWith(Iterable <Node> iterable) {
        NodeList rlist = new NodeList();

        for (Node dstNode : this){
            rlist.add(dstNode);
            dstNode.replaceWith(iterable);
        }

        return rlist;
    }
}
