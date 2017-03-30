package ca.sharcnet.nerve.docnav.dom;

public class Schema {
    private final Document grammar;
    private final NodeList<ElementNode> references;

    public Schema(Document document) {
        this.reduceGrammar(document);
        this.grammar = new Document((ElementNode) document.getNodesByName("start").get(0));
        this.references = document.getElementsByName("define");
    }

    /**
     * 1) For each 'oneOrMore' node, attach its child nodes to its parent.
     */
    private void reduceGrammar(ElementNode document) {
        for (Node node : document.getNodesByName("a:documentation")) {
            node.getParent().removeChild(node);
        }

        for (Node node : document.getNodesByName("attribute")) {
            node.getParent().removeChild(node);
        }

        for (Node node : document.getNodesByName("text")) {
            node.getParent().removeChild(node);
        }

        for (ElementNode node : document.getElementsByName("*")) {
            if (node.getName().equals("start")) continue;
            if (node.getName().equals("element")) continue;
            if (node.getName().equals("define")) continue;
            if (node.getName().equals("ref")) continue;
            if (node.hasParent()) node.replaceWithChildren();
        }
    }

    private ElementNode nextNode(ElementNode schemaNode, String name) {
        NodeList<ElementNode> childElements = schemaNode.childElements();

        for (ElementNode n : childElements) {
            ElementNode check = check(n, name);
            if (check != null) return check;
        }
        return null;
    }

    private ElementNode check(ElementNode eleNode, String name) {
        if (eleNode.getName().equals("element") && eleNode.getAttributeValue("name").equals(name)) {
            return eleNode;
        }

        if (!eleNode.getName().equals("ref")) return null;
        NodeList<ElementNode> refList = this.references.filter((n)->n.getAttributeValue("name").equals(eleNode.getAttributeValue("name")));
        if (refList.isEmpty()) return null;
        NodeList<ElementNode> childElements = refList.get(0).childElements();

        for (ElementNode n : childElements) {
            ElementNode check = check(n, name);
            if (check != null) return check;
        }
        return null;
    }

    public boolean isValidPath(NodePath queryPath) {
        ElementNode current = grammar;
        for (Node pathNode : queryPath) {
            String nextNodeName = pathNode.getName();
            current = nextNode(current, nextNodeName);
            if (current == null) return false;
        }
        return true;
    }

    public boolean isValidPath(String[] queryPath) {
        ElementNode current = grammar;
        for (String pathName : queryPath) {
            current = nextNode(current, pathName);
            if (current == null) return false;
        }
        return true;
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
