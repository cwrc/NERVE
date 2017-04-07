package ca.sharcnet.nerve.docnav.tests;
import ca.sharcnet.nerve.docnav.dom.DocNavException;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.tests.helpers.NodeImpl;
import ca.sharcnet.nerve.docnav.tests.helpers.TestNodeType;
import org.junit.*;
import org.junit.Test;

public class NodeTest {
    private final NodeImpl nodeImpl;
    private final NodeImpl altNodeImpl;
    private final ElementNode parent;
    private final ElementNode ancestor;

    public NodeTest() {
        this.nodeImpl = new NodeImpl(TestNodeType.TEST_NODE, "Node");
        this.altNodeImpl = new NodeImpl(TestNodeType.ALT_TEST_NODE, "AltNode");
        this.parent = new ElementNode("Parent");
        this.ancestor = new ElementNode("Ancestor");
    }

    @Test
    public void getName() {
        Assert.assertTrue(nodeImpl.getName().equals("Node"));
    }

    @Test
    public void getType() {
        Assert.assertTrue(nodeImpl.getType() == TestNodeType.TEST_NODE);
    }

    @Test
    public void isType_single_true() {
        Assert.assertTrue(nodeImpl.isType(TestNodeType.TEST_NODE));
    }

    @Test
    public void isType_mult_true() {
        Assert.assertTrue(nodeImpl.isType(TestNodeType.TEST_NODE, TestNodeType.ALT_TEST_NODE));
    }

    @Test
    public void isType_single_false() {
        Assert.assertFalse(nodeImpl.isType(TestNodeType.ALT_TEST_NODE));
    }

    @Test
    public void isType_mult_false() {
        Assert.assertFalse(nodeImpl.isType(TestNodeType.THIRD_TYPE, TestNodeType.ALT_TEST_NODE));
    }

    @Test
    public void setName() {
        nodeImpl.setName("newName");
        Assert.assertFalse(nodeImpl.getName().equals("Node"));
        Assert.assertTrue(nodeImpl.getName().equals("newName"));
    }

    @Test
    public void getParent() {
        parent.addChild(nodeImpl);
        Assert.assertEquals(parent, nodeImpl.getParent());
    }

    @Test(expected=DocNavException.class)
    public void getParent_exception() {
        nodeImpl.getParent();
    }

    @Test
    public void getParent_sharedParent() {
        parent.addChild(nodeImpl);
        parent.addChild(altNodeImpl);
        Assert.assertEquals(parent, nodeImpl.getParent());
        Assert.assertEquals(parent, altNodeImpl.getParent());
    }

    @Test
    public void hasParent() {
        parent.addChild(nodeImpl);
        Assert.assertTrue(nodeImpl.hasParent());
    }

    @Test
    public void hasParent_sharedParent() {
        parent.addChild(nodeImpl);
        parent.addChild(altNodeImpl);
        Assert.assertTrue(nodeImpl.hasParent());
        Assert.assertTrue(altNodeImpl.hasParent());
    }

    @Test
    public void depth_noParent() {
        Assert.assertEquals(0, nodeImpl.depth());
    }

    @Test
    public void depth() {
        parent.addChild(nodeImpl);
        Assert.assertEquals(1, nodeImpl.depth());
    }

    @Test
    public void depth_ancestor() {
        ancestor.addChild(parent);
        parent.addChild(nodeImpl);
        Assert.assertEquals(2, nodeImpl.depth());
    }

    @Test
    public void depth_siblings() {
        parent.addChild(nodeImpl);
        parent.addChild(altNodeImpl);
        Assert.assertEquals(1, nodeImpl.depth());
    }

    @Test
    public void depth_ancestor_siblings() {
        ancestor.addChild(parent);
        parent.addChild(nodeImpl);
        parent.addChild(altNodeImpl);
        Assert.assertEquals(2, nodeImpl.depth());
    }

    @Test
    public void replacewith_single() {
        parent.addChild(nodeImpl);
        nodeImpl.replaceWith(altNodeImpl);
        Assert.assertFalse(nodeImpl.hasParent());
        Assert.assertTrue(altNodeImpl.hasParent());
        Assert.assertEquals(parent, altNodeImpl.getParent());
        Assert.assertFalse(parent.childNodes().contains(nodeImpl));
        Assert.assertTrue(parent.childNodes().contains(altNodeImpl));
    }

    @Test
    public void replacewith_nodeList() {
        NodeList<NodeImpl> list = new NodeList<>();
        NodeImpl node1 = new NodeImpl(TestNodeType.TEST_NODE, "Node1");
        NodeImpl node2 = new NodeImpl(TestNodeType.TEST_NODE, "Node2");
        NodeImpl node3 = new NodeImpl(TestNodeType.TEST_NODE, "Node3");

        list.add(node1);
        list.add(node2);
        list.add(node3);

        parent.addChild(nodeImpl);
        nodeImpl.replaceWith(list);
        Assert.assertFalse(nodeImpl.hasParent());
        Assert.assertTrue(node1.hasParent());
        Assert.assertTrue(node2.hasParent());
        Assert.assertTrue(node3.hasParent());
        Assert.assertEquals(parent, node1.getParent());
        Assert.assertEquals(parent, node2.getParent());
        Assert.assertEquals(parent, node3.getParent());

        NodeList<Node> childNodes = parent.childNodes();
        Assert.assertEquals(childNodes.get(0), node1);
        Assert.assertEquals(childNodes.get(1), node2);
        Assert.assertEquals(childNodes.get(2), node3);
    }

}
