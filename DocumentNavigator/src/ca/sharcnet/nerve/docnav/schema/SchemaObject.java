package ca.sharcnet.nerve.docnav.schema;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.selector.Select;

public class SchemaObject implements Schema{
    private final Document grammar;
    private final NodeList<ElementNode> references;

    public SchemaObject(Document document) {
        this.reduceGrammar(document);
        this.grammar = new Document(document.select().name("start").get(0));
        this.references = document.select().name("define");
    }

    /**
     * 1) For each 'oneOrMore' node, attach its child nodes to its parent.
     */
    private void reduceGrammar(ElementNode document) {
        for (Node node : document.select().name("a:documentation")) {
            node.getParent().removeChild(node);
        }

        for (Node node : document.select().name("attribute")) {
            node.getParent().removeChild(node);
        }

        for (Node node : document.select().name("text")) {
            node.getParent().removeChild(node);
        }

        for (Node node : document.select().all()) {
            if (node.getName().equals("start")) continue;
            if (node.getName().equals("element")) continue;
            if (node.getName().equals("define")) continue;
            if (node.getName().equals("ref")) continue;
            if (node.hasParent()) ((ElementNode)node).replaceWithChildren();
        }
    }

    /**
    Return true if this element does not violate the schema.
    @param element
    @return
    */
    public boolean verboseValid(ElementNode element){
        NodeList <ElementNode> elementPath = getNodePath(element);
        ElementNode current = grammar;
        boolean rvalue = true;

        for (ElementNode pathNode : elementPath) {
            String nextNodeName = pathNode.getName();
            System.out.print("[" + nextNodeName + "(" + (rvalue ? "" : "X") + ")]");
            if (current != null) current = nextNode(current, nextNodeName);
            if (current == null) rvalue = false;
        }

        System.out.println();
        return rvalue;
    }

    /**
    Return true if this element does not violate the schema.
    @param element
    @return
    */
    public boolean isValid(ElementNode element){
        NodeList <ElementNode> elementPath = getNodePath(element);
        ElementNode current = grammar;

        for (ElementNode pathNode : elementPath) {
            String nextNodeName = pathNode.getName();
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
    public boolean verboseValid(ElementNode element, String childNodeName){
        NodeList <ElementNode> elementPath = getNodePath(element);
        ElementNode current = grammar;
        boolean rvalue = true;

        for (ElementNode pathNode : elementPath) {
            System.out.print(pathNode.getType() + pathNode.getName() + " ");
        }

        for (ElementNode pathNode : elementPath) {
            String nextNodeName = pathNode.getName();
            if (current != null) current = nextNode(current, nextNodeName);
            if (current == null) rvalue = false;
            System.out.print("[" + nextNodeName + "(" + (rvalue ? "" : "X") + ")]");
        }

        if (rvalue && nextNode(current, childNodeName) == null){
            rvalue = false;
            System.out.print("[" + childNodeName + "(" + (rvalue ? "" : "X") + ")]");
        }

        System.out.println();
        return rvalue;
    }

    /**
    Return true if this element, with the child node, does not violate the schema.
    @param element
    @return
    */
    public boolean isValid(ElementNode element, String childNodeName){
        NodeList <ElementNode> elementPath = getNodePath(element);
        ElementNode current = grammar;

        for (ElementNode pathNode : elementPath) {
            String nextNodeName = pathNode.getName();
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
    private ElementNode nextNode(ElementNode current, String name) {
        NodeList<ElementNode> list = current.select().attribute("name", name);
        if (list.isEmpty()) return null;
        ElementNode eNode = list.get(0);
        if (eNode.getName().equals("element")) return eNode;

        Select byReference = new Select(references).attribute("name", name);
        if (byReference.isEmpty()) throw new RuntimeException("SCHEMA: Reference not found");
        return (ElementNode) byReference.get(0);
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

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();

        this.grammar.recurse((element) -> {
            int d = element.depth();
            while (d-- > 0)
                builder.append("  ");
            builder.append(element.getName()).append(":").append(element.getAttributeValue("name")).append("\n");
        });

        for (Node node : references) {
            ElementNode ele = (ElementNode) node;
            ele.recurse((element) -> {
                int d = element.depth();
                while (d-- > 0)
                    builder.append("  ");
                builder.append(element.getName()).append(":\"").append(element.getAttributeValue("name")).append("\"\n");
            });
        }

        return builder.toString();
    }
}
