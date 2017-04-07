package ca.sharcnet.nerve.docnav.tests.helpers;
import ca.sharcnet.nerve.docnav.dom.Node;

public class NodeImpl extends Node {

    public NodeImpl(TestNodeType type, String name) {
        super(type, name);
    }

    @Override
    public TestNodeType getType() {
        return (TestNodeType) super.getType();
    }

    @Override
    public Node copy() {
        throw new UnsupportedOperationException();
    }
}