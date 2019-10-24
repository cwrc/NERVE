package ca.sharcnet.nerve.scriber.schema;

import ca.sharcnet.nerve.scriber.query.Query;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.HashMap;
import java.util.List;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * Load a relax NG Schema. http://relaxng.org/
 *
 * @author edward
 */
public final class RelaxNGSchema implements Schema {
    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger("RelaxNGSchema");
    private final Query start;
    private final HashMap<String, Query> defines = new HashMap<>();
    private final Query query;

    public RelaxNGSchema(Query query) {
        LOGGER.trace("new RelaxNGSchema()");
        this.query = query;
        this.start = query.select("start");
        if (this.start == null) throw new RuntimeException("Start element not found");

        Query definedNodes = this.query.select("define");
        for (int i = 0; i < definedNodes.size(); i++) {
            Query node = definedNodes.select(i);
            String name = node.attribute("name");
            defines.put(name, node);
        }
    }

    public Query getQuery(){
        return this.query;
    }
    
    /**
     * Return true if this element, with the child node, does not violate the
     * schema.
     *
     * @param element
     * @param childNodeName
     * @return
     */
    @Override
    public boolean isValid(Node element, String childNodeName) {
        LOGGER.trace(String.format("RelaxNGSchema.isValid(%s, %s)", element.getNodeName(), childNodeName));
        LinkedList<String> list = new LinkedList<>();
        Node current = element;
        
        while (current.getNodeType() != Node.DOCUMENT_NODE) {
            list.addFirst(current.getNodeName());
            current = current.getParentNode();
        }

        /* Convert node list to string list */
        if (!childNodeName.isEmpty()) list.addLast(childNodeName);
        return checkValidity(list, this.start);
    }

    /**
     * Return true if this element, with the child node, does not violate the
     * schema.
     *
     * @param element
     * @return
     */
    @Override
    public boolean isValid(Node element) {
        LOGGER.trace("RelaxNGSchema.isValid()");
        return isValid(element, "");
    }

    public boolean isValid(String... tagNames) {
        LOGGER.trace("RelaxNGSchema.isValid()");
        LinkedList<String> asList = new LinkedList<>();
        for (String s : tagNames) asList.add(s);
        return checkValidity(asList, this.start);
    }

    private boolean checkValidity(LinkedList<String> path, Query schemaNode) {
        LOGGER.trace(String.format("RelaxNGSchema.checkValidity(%s, %s)", path.toString(), schemaNode.tagName()));

        if (schemaNode == null) throw new NullPointerException();

        switch (schemaNode.tagName()) {
            case "anyName":
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
                
            case "text":
                return checkText(path, schemaNode);
            case "empty":
                return checkEmpty(path, schemaNode);
              
            default:
                return false;
        }
    }

    private boolean checkText(LinkedList<String> path, Query schemaNode){
        LOGGER.trace("RelaxNGSchema.checkText()");
        if (path.size() == 0) return true;
        return false;
    }
    
    private boolean checkEmpty(LinkedList<String> path, Query schemaNode){
        LOGGER.trace("RelaxNGSchema.checkEmpty()");
        if (path.size() == 0) return true;
        return false;
    }    
    
    /**
     * Accept any head node and continue with child nodes.
     *
     * @param path
     * @param schemaNode
     * @return
     */
    private boolean checkAny(LinkedList<String> path, Query schemaNode) {
        LOGGER.trace("RelaxNGSchema.checkAny()");
        String head = path.removeFirst();
        LOGGER.trace(path);

        if (path.isEmpty()) LOGGER.trace("RelaxNGSchema.checkAny() : true");
        if (path.isEmpty()) return true;

        for (Node node : schemaNode.children()) {
            if (checkValidity(path, schemaNode.select(node))) return true;
        }

        path.addFirst(head);
        if (path.isEmpty()) LOGGER.trace("RelaxNGSchema.checkAny() : false");
        return false;
    }

    private boolean checkElement(LinkedList<String> path, Query schemaNode) {
        LOGGER.trace(String.format("RelaxNGSchema.checkElement(%s)", path.toString()));

        String elementName = schemaNode.attribute("name");

        if (elementName.isEmpty()) {
            // If the first element in an unnamed element is "anyName' then this gets
            // called.  At the moment this automatically returns true.  TODO add exclusion
            // checks.            
            Query first = schemaNode.children().select(0);
            if (!first.tagName().equals("anyName")) return false;
        } else {
            LOGGER.trace(elementName + " == " + path.getFirst());
            if (!elementName.equals(path.getFirst())) LOGGER.trace("RelaxNGSchema.checkElement() : false");
            if (!elementName.equals(path.getFirst())) return false;
        }

        String head = path.removeFirst();
        if (path.isEmpty()) LOGGER.trace("RelaxNGSchema.checkAny() : true");
        if (path.isEmpty()) return true;

        for (Node node : schemaNode.children()) {
            if (checkValidity(path, schemaNode.select(node))) return true;
        }

        path.addFirst(head);
        if (path.isEmpty()) LOGGER.trace("RelaxNGSchema.checkElement() : false");
        return false;
    }

    private boolean checkRef(LinkedList<String> path, Query schemaNode) {
        LOGGER.trace(String.format("RelaxNGSchema.checkRef(%s)", schemaNode.attribute("name")));
        String schemaNodeName = schemaNode.attribute("name");
        boolean rvalue = checkValidity(path, defines.get(schemaNodeName));
        if (!rvalue) LOGGER.trace("RelaxNGSchema.checkRef() : false");
        return rvalue;
    }

    private boolean checkGroup(LinkedList<String> path, Query schemaNode) {
        LOGGER.trace("RelaxNGSchema.checkGroup()");
        for (Node node : schemaNode.children()) {
            if (checkValidity(path, schemaNode.select(node))) return true;
        }
        if (path.isEmpty()) LOGGER.trace("RelaxNGSchema.checkGroup() : false");
        return false;
    }
}
