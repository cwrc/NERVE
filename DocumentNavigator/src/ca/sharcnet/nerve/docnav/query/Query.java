package ca.sharcnet.nerve.docnav.query;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.TextNode;
import java.util.Arrays;
import java.util.List;

public class Query extends NodeList<ElementNode> {

    private SelectAny selectAny;

    public Query() {
    }

    public Query(Iterable<ElementNode> iterable, String select) {
        selectAny = new SelectAny(select);

        for (ElementNode element : iterable) {
            boolean result = check(element);
            if (result) this.add(element);
        }
    }

    public Query(Iterable<ElementNode> iterable) {
        for (ElementNode element : iterable) {
            this.add(element);
        }
    }

    public Query(ElementNode node) {
        this.add(node);
    }

    public Query filter(String select) {
        return new Query(this, select);
    }

    @Override
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

    private boolean check(ElementNode element) {
        return selectAny.check(element);
    }

    /**
        Change the name of all elements in this query return the value of the first element.
        @param name
     */
    public String name(String name) {
        this.forEach(n -> n.setName(name));
        return this.get(0).getName();
    }

    /**
        Return the name value of the first element in this query.
     */
    public String name() {
        return this.get(0).getName();
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
            String prevClassAttr = node.getAttributeValue("class");
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

            node.addAttribute("class", prevClassAttr);
        });
    }

    /**
        Determine whether any of the matched elements are assigned the given class.
        @param classNames Zero or more strings, each of which is a space deliminated list of classNames.
        @return true if any element in the query contains any of the listed classnames.
     */
    public boolean hasClass(String... classNames) {
        for (ElementNode node : this) {
            String prevClassAttr = node.getAttributeValue("class");
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

        for (ElementNode node : this) {
            String prevClassAttr = node.getAttributeValue("class");

            for (String s1 : classNames) {
                String[] split = s1.split("[ ]+");
                for (String s2 : split) {
                    prevClassAttr = prevClassAttr.replaceAll(s2, "");
                }
            }

            prevClassAttr = prevClassAttr.trim();
            if (prevClassAttr.isEmpty()) node.removeAttribute("class");
            else node.addAttribute("class", prevClassAttr);
        }
    }

    /**
        Remove all matched elements from the document after refining the selection.
     * @param select
     */
    public void remove(String select) {
        Query filter = this.filter(select);
        filter.remove();
    }

    /**
        Remove all matched elements from the document.
     */
    public void remove() {
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
    Replace all selected nodes with their children after refining the selection.
     */
    public void extract(String select) {
        Query filter = this.filter(select);
        filter.extract();
    }

    /**
    Retrieve the attribute value for the first matched element.  Returns a null if no attribute is found or the set is
    empty.
    @param key
    @param value
    @return
     */
    public String attr(String key) {
        if (this.isEmpty()) return null;
        ElementNode node = this.get(0);
        if (!node.hasAttribute(key)) return null;
        return node.getAttributeValue(key);
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
        this.forEach(node -> node.addAttribute(key, value));
    }

    /**
        Return the child elemants of each matched element as a new query.
     */
    public Query children() {
        Query query = new Query();
        this.forEach(node -> query.add(node.childElements()));
        return query;
    }

    /**
        Retrieve the children of each matched element, after refining the selection.
     */
    public Query children(String select) {
        return this.filter(select).children();
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
    public String text(){
        if (this.isEmpty()) return null;
        return this.get(0).innerText();
    }

    /**
    Repleces all children of each selected element with a single text node containing the specified string.
     * @param string
    */
    public void text(String string){
        this.forEach(node->{
            node.clearChildren();
            node.addChild(new TextNode(string));
        });
    }

    public ElementNode first() {
        if (this.isEmpty()) return null;
        return this.get(0);
    }

    public ElementNode last() {
        if (this.isEmpty()) return null;
        return this.get(this.size());
    }
}