package ca.sharcnet.nerve.docnav.schema;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.query.Query;

public class SchemaObject implements Schema{
    private final Document grammar;
    private final NodeList references;

    public SchemaObject(Document document) {
        this.reduceGrammar(document);
        this.grammar = new Document(document.query("start").first());
        this.references = document.query("define");
    }

    /**
     * 1) For each 'oneOrMore' node, attach its child nodes to its parent.
     */
    private void reduceGrammar(Node document) {
        document.query("a:documentation").detach();
        document.query("attribute").detach();
        document.query("text").detach();
        document.query("text").detach();

        document.query("*").forEach(node->{
            if (node.name().equals("start")) return;
            if (node.name().equals("element")) return;
            if (node.name().equals("define")) return;
            if (node.name().equals("ref")) return;
            if (node.hasParent()) node.replaceWithChildren();
        });
    }

    /**
    Return true if this element does not violate the schema.
    @param element
    @return
    */
    public boolean isValid(Node element){
        NodeList elementPath = getNodePath(element);
        Node current = grammar;

        for (Node pathNode : elementPath) {
            String nextNodeName = pathNode.name();
            current = nextNode(current, nextNodeName);
            if (current == null) return false;
        }
        return true;
    }

    /**
    Return true if this element does not violate the schema.
    @param element
    @return
    */
    public boolean verboseValid(Node element, String childNodeName){
        NodeList elementPath = getNodePath(element);
        Node current = grammar;
        boolean rvalue = true;

        for (Node pathNode : elementPath) {
            String nextNodeName = pathNode.name();
            if (current != null) current = nextNode(current, nextNodeName);
            if (current == null) rvalue = false;
        }

        if (rvalue && nextNode(current, childNodeName) == null){
            rvalue = false;
        }

        return rvalue;
    }

    /**
    Return true if this element, with the child node, does not violate the schema.
    @param element
    @return
    */
    public boolean isValid(Node element, String childNodeName){
        NodeList elementPath = getNodePath(element);
        Node current = grammar;

        for (Node pathNode : elementPath) {
            String nextNodeName = pathNode.name();
            current = nextNode(current, nextNodeName);
            if (current == null) return false;
        }

        if (nextNode(current, childNodeName) == null) return false;

        return true;
    }

    /**
    Given a schema node check if the that node has a child node with the given
    name, if that node is a ref, return the reference node, else return that
    node.
    @param current The current node in question
    @param name The name of the next potential node
    @return a node if valid, null if not.
    */
    private Node nextNode(Node current, String name) {
        Query query = current.query(String.format("[name='$1']", name));
        if (query.isEmpty()) return null;
        if (query.name().equals("element")) return query.first();

        Query refQuery = references.filter(String.format("[name='$1']", name));
        if (refQuery.isEmpty()) throw new RuntimeException("SCHEMA: Reference not found");
        return refQuery.first();
    }

    /**
    Retrieve an inorder list of all nodes from the document root to this node,
    inclusive.
    @return
     */
    private NodeList getNodePath(Node eNode) {
        NodeList list = new NodeList();
        list.add(eNode);

        Node current = eNode.getParent();
        while (current != null && !current.name().equals("@DOCUMENT")) {
            list.add(0, current);
            current = current.getParent();
        }
        return list;
    }

    @Override
    public String toString() {
        return this.grammar.toString(2);
    }
}
