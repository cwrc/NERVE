package ca.sharcnet.nerve.docnav.schema.relaxng;
import ca.sharcnet.nerve.docnav.schema.Schema;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import java.util.HashMap;

public final class RelaxNGSchema extends Document implements Schema{
    private final Node start;
    private final HashMap<String, Node> defines = new HashMap<>();

    public RelaxNGSchema(Document doc){
        super(doc);
        this.start = query("start").first();
        query("define").forEach(node->defines.put(node.getAttributeValue("name"), node));
    }

    /**
    Return true if this element, with the child node, does not violate the schema.
    @param element
    @return
    */
    @Override
    public boolean isValid(Node element, String childNodeName){
        NodeList elementPath = getNodePath(element);
        Node current = start;
        boolean rvalue = true;

        for (Node pathNode : elementPath) {
            String nextNodeName = pathNode.getName();
            if (current != null) current = nextNode(current, nextNodeName);
            if (current == null) rvalue = false;
        }

        if (current != null && nextNode(current, childNodeName) == null) rvalue = false;
        return rvalue;
    }

    /**
    Return true if this element, with the child node, does not violate the schema.
    @param element
    @return
    */
    @Override
    public boolean isValid(Node element){
        NodeList elementPath = getNodePath(element);
        Node current = start;
        boolean rvalue = true;

        for (Node pathNode : elementPath) {
            String nextNodeName = pathNode.getName();
            if (current != null) current = nextNode(current, nextNodeName);
            if (current == null) rvalue = false;
        }

        return rvalue;
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
        while (current != null && !current.getName().equals("@DOCUMENT")) {
            list.add(0, current);
            current = current.getParent();
        }
        return list;
    }

    /**
    Given a schema element, if an element with 'name' is a valid child, return
    the matching schema element.
    @param current The current node in question
    @param name The name of the next potential node
    @return a node if valid, null if not.
    */
    private Node nextNode(Node current, String name) {
        NodeList elements = current.query(String.format("element[name='%s']", name));

        if (!elements.isEmpty()){
            return elements.get(0);
        }

        NodeList refs = current.query("ref");

        for (Node ref : refs){
            String refname = ref.getAttributeValue("name");
            if (!defines.containsKey(refname)) throw new RuntimeException("define name = '" + refname + "' not found");
            Node next = nextNode(defines.get(refname), name);
            if (next != null) return next;
        }

        NodeList others = current.query("zeroOrMore, oneOrMore, optional, group, choice, interleave");

        for (Node other : others){
            Node next = nextNode(other, name);
            if (next != null) return next;
        }

        return null;
    }
}
