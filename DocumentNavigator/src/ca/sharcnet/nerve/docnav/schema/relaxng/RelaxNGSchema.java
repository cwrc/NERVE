package ca.sharcnet.nerve.docnav.schema.relaxng;
import ca.sharcnet.nerve.docnav.schema.Schema;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.selector.ElementList;
import java.util.HashMap;

public final class RelaxNGSchema extends Document implements Schema{
    private final ElementNode start;
    private final HashMap<String, ElementNode> defines = new HashMap<>();

    public RelaxNGSchema(Document doc){
        super(doc);
        this.start = this.select().name("start").get(0);
        for (ElementNode node : this.select().name("define")){
            defines.put(node.getAttributeValue("name"), node);
        }
    }

    /**
    Return true if this element, with the child node, does not violate the schema.
    @param element
    @return
    */
    @Override
    public boolean isValid(ElementNode element, String childNodeName){
        NodeList <ElementNode> elementPath = getNodePath(element);
        ElementNode current = start;
        boolean rvalue = true;

        for (ElementNode pathNode : elementPath) {
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
    public boolean isValid(ElementNode element){
        NodeList <ElementNode> elementPath = getNodePath(element);
        ElementNode current = start;
        boolean rvalue = true;

        for (ElementNode pathNode : elementPath) {
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
    private NodeList <ElementNode> getNodePath(ElementNode eNode) {
        NodeList<ElementNode> list = new NodeList<>();
        list.add(eNode);

        ElementNode current = eNode.getParent();
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
    private ElementNode nextNode(ElementNode current, String name) {
        ElementList elements =
            current
            .childElements()
            .keepName("element")
            .keepAttribute("name", name);

        if (!elements.isEmpty()){
            return elements.get(0);
        }

        ElementList refs = current.childElements().keepName("ref");

        for (ElementNode ref : refs){
            String refname = ref.getAttributeValue("name");
            if (!defines.containsKey(refname)) throw new RuntimeException("define name = '" + refname + "' not found");
            ElementNode next = nextNode(defines.get(refname), name);
            if (next != null) return next;
        }

        ElementList others =
            current
            .childElements()
            .keepName("zeroOrMore", "oneOrMore", "optional", "group", "choice", "interleave");

        for (ElementNode other : others){
            ElementNode next = nextNode(other, name);
            if (next != null) return next;
        }

        return null;
    }
}
