package ca.sharcnet.nerve.docnav.dom;
import static ca.sharcnet.nerve.docnav.dom.NodeType.DOCUMENT;
import static ca.sharcnet.nerve.docnav.dom.NodeType.ELEMENT;
import java.util.Iterator;

/**
Create an interator that will iterate through all of a nodes decendent nodes, not self inclusive.
@author edward
*/
public class ElementNodeIterator implements Iterator<ElementNode> {
    private final NodeList<ElementNode> allNodes = new NodeList<>();
    private final Iterator<ElementNode> inner;

    public ElementNodeIterator(ElementNode root) {
        this.addElement(root);
        inner = allNodes.iterator();
    }

    private void addElement(ElementNode node) {
        if (!node.isType(ELEMENT, DOCUMENT)) return;
        if (node.isType(ELEMENT)) allNodes.add(node);
        for (ElementNode child : node.childElements()) {
            if (child.isType(ELEMENT)) this.addElement(child);
        }
    }

    @Override
    public boolean hasNext() {
        return inner.hasNext();
    }

    @Override
    public ElementNode next() {
        return inner.next();
    }
}