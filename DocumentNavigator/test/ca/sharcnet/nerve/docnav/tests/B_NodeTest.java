package ca.sharcnet.nerve.docnav.tests;
import ca.sharcnet.nerve.docnav.dom.Attribute;
import ca.sharcnet.docnav.DocNavException;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.UnknownKeyException;
import ca.sharcnet.nerve.docnav.tests.helpers.NodeImpl;
import ca.sharcnet.nerve.docnav.tests.helpers.TestNodeType;
import org.junit.*;
import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class B_NodeTest {
    private final NodeImpl nodeImpl;
    private final NodeImpl altNodeImpl;
    private final Node parent;
    private final Node ancestor;

    public B_NodeTest() {
        this.nodeImpl = new NodeImpl(TestNodeType.TEST_NODE, "Node");
        this.altNodeImpl = new NodeImpl(TestNodeType.ALT_TEST_NODE, "AltNode");
        this.parent = new ElementNode("Parent");
        this.ancestor = new ElementNode("Ancestor");
    }

    @Test
    public void getName() {
        Assert.assertTrue(nodeImpl.name().equals("Node"));
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
        nodeImpl.name("newName");
        Assert.assertFalse(nodeImpl.name().equals("Node"));
        Assert.assertTrue(nodeImpl.name().equals("newName"));
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

    /**
    A node must have a parent in order to be replaced, because the new node needs to attach to something.
    */
    @Test(expected=DocNavException.class)
    public void replacewith_no_parent() {
        ElementNode node1 = new ElementNode("div");
        ElementNode node2 = new ElementNode("div");
        node1.replaceWith(node2);
    }

    @Test
    public void addAttributes_none(){
        ElementNode node = new ElementNode("node");
        assertEquals(0, node.getAttributes().size());
        assertEquals(true, node.getAttributes().isEmpty());
    }

    @Test
    public void addAttributes_one(){
        ElementNode node = new ElementNode("node");
        node.attr("class", "ima-class");
        assertEquals(1, node.getAttributes().size());
        assertEquals(false, node.getAttributes().isEmpty());
    }

    @Test
    public void addAttributes_many(){
        ElementNode node = new ElementNode("node");
        node.attr("class", "ima-class");
        node.attr("id", "ima-id");
        node.attr("data", "ima-data");
        assertEquals(3, node.getAttributes().size());
        assertEquals(false, node.getAttributes().isEmpty());
    }

    @Test
    public void clearAttributes_none(){
        ElementNode node = new ElementNode("node");
        assertEquals(0, node.getAttributes().size());
        assertEquals(true, node.getAttributes().isEmpty());
    }

    @Test
    public void clearAttributes_one(){
        ElementNode node = new ElementNode("node");
        node.attr("class", "ima-class");
        node.clearAttributes();
        assertEquals(0, node.getAttributes().size());
        assertEquals(true, node.getAttributes().isEmpty());
    }

    @Test
    public void clearAttributes_many(){
        ElementNode node = new ElementNode("node");
        node.attr("class", "ima-class");
        node.attr("id", "ima-id");
        node.attr("data", "ima-data");
        node.clearAttributes();
        assertEquals(0, node.getAttributes().size());
        assertEquals(true, node.getAttributes().isEmpty());
    }

    @Test(expected=UnknownKeyException.class)
    public void getAttributes_none(){
        ElementNode node = new ElementNode("node");
        node.getAttribute("class");
    }

    @Test
    public void getAttribute_one_byAttr(){
        ElementNode node = new ElementNode("node");
        node.attr("class", "ima-class");
        assertEquals("ima-class", node.getAttribute("class").getValue());
    }

    @Test
    public void getAttribute_many_byAttr(){
        ElementNode node = new ElementNode("node");
        node.attr("class", "ima-class");
        node.attr("id", "ima-id");
        node.attr("data", "ima-data");
        assertEquals("ima-class", node.getAttribute("class").getValue());
        assertEquals("ima-id", node.getAttribute("id").getValue());
        assertEquals("ima-data", node.getAttribute("data").getValue());
    }

    @Test
    public void getAttribute_one_byValue(){
        ElementNode node = new ElementNode("node");
        node.attr("class", "ima-class");
        assertEquals("ima-class", node.attr("class"));
    }

    @Test
    public void getAttribute_many_byValue(){
        ElementNode node = new ElementNode("node");
        node.attr("class", "ima-class");
        node.attr("id", "ima-id");
        node.attr("data", "ima-data");
        assertEquals("ima-class", node.attr("class"));
        assertEquals("ima-id", node.attr("id"));
        assertEquals("ima-data", node.attr("data"));
    }

    @Test
    public void addAttribute_object_none(){
        ElementNode node = new ElementNode("node");
        assertEquals(0, node.getAttributes().size());
        assertEquals(true, node.getAttributes().isEmpty());
    }

    @Test
    public void addAttribute_object_one(){
        ElementNode node = new ElementNode("node");
        node.attr(new Attribute("class", "ima-class"));
        assertEquals(1, node.getAttributes().size());
        assertEquals(false, node.getAttributes().isEmpty());
    }

    @Test
    public void addAttribute_object_many(){
        ElementNode node = new ElementNode("node");
        node.attr(new Attribute("class", "ima-class"));
        node.attr(new Attribute("id", "ima-id"));
        node.attr(new Attribute("data", "ima-data"));
        assertEquals(3, node.getAttributes().size());
        assertEquals(false, node.getAttributes().isEmpty());
    }
}
