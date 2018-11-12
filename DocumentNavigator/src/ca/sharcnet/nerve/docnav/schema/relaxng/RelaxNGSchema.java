package ca.sharcnet.nerve.docnav.schema.relaxng;
import ca.frar.utility.console.Console;
import ca.sharcnet.docnav.StartNodeException;
import ca.sharcnet.nerve.docnav.schema.Schema;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import java.util.LinkedList;
import java.util.HashMap;

/**
 * Load a relax NG Schema.
 * http://relaxng.org/
 * @author edward
 */
public final class RelaxNGSchema extends Document implements Schema {
    private final Node start;
    private final HashMap<String, Node> defines = new HashMap<>();
    private final Document doc;

    public RelaxNGSchema(Document doc) {
        super(doc);
        this.doc = doc;
        this.start = query("start").first();
        if (this.start == null) throw new StartNodeException(doc);
        this.query("define").forEach(node -> defines.put(node.attr("name"), node));
    }

    @Override
    public String toString(){
        return this.doc.toString();
    }
    
    /**
    Return true if this element, with the child node, does not violate the schema.
    @param element
    @param childNodeName
    @return
     */
    @Override
    public boolean isValid(Node element, String childNodeName) {
        NodeList branch = element.branch(NodeType.ELEMENT);
        LinkedList<String> path = new LinkedList<>();
        
        /* Convert node list to string list */
        branch.forEach(node -> path.addFirst(node.name()));
        if (!childNodeName.isEmpty()) path.addLast(childNodeName);
        return checkValidity(path, this.start);
    }

    /**
    Return true if this element, with the child node, does not violate the schema.
    @param element
    @return
     */
    @Override
    public boolean isValid(Node element) {
        return isValid(element, "");
    }

    private boolean checkValidity(LinkedList<String> path, Node schemaNode) {
        if (schemaNode == null) throw new NullPointerException();
        
        switch (schemaNode.name()) {
            case "any":
                return checkAny(path, schemaNode);
            case "element":
                return checkElement(path, schemaNode);
            case "ref":
                return checkRef(path, schemaNode);
            case "define":
            case "start":
            case "zeroOrMore":
            case "group":
            case "interleave":
            case "choice":
            case "optional":
            case "oneOrMore":
            case "List":
            case "mixed":
                return checkGroup(path, schemaNode);
            default:
                return false;
        }
    }
    
    /**
     * Accept any head node and continue with child nodes.
     * @param path
     * @param schemaNode
     * @return 
     */
    private boolean checkAny(LinkedList<String> path, Node schemaNode){
        String head = path.removeFirst();        
        if (path.isEmpty()) return true;
        
        for (Node child : schemaNode.childNodes(NodeType.ELEMENT)) {
            if (checkValidity(path, child)) return true;
        }
        path.addFirst(head);
        return false;
    }
    
    private boolean checkElement(LinkedList<String> path, Node schemaNode) {
        if (!schemaNode.attr("name").equals(path.getFirst())) return false;

        String head = path.removeFirst();
        if (path.isEmpty()) return true;

        for (Node child : schemaNode.childNodes(NodeType.ELEMENT)) {
            if (checkValidity(path, child)) return true;
        }
        path.addFirst(head);
        return false;
    }

    private boolean checkRef(LinkedList<String> path, Node schemaNode) {
        return checkValidity(path, defines.get(schemaNode.attr("name")));
    }

    private boolean checkGroup(LinkedList<String> path, Node schemaNode) {
        for (Node child : schemaNode.childNodes(NodeType.ELEMENT)) {
            if (checkValidity(path, child)) return true;
        }
        return false;
    }

}
