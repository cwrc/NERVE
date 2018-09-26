package ca.sharcnet.nerve.docnav.tests;
import ca.sharcnet.docnav.DocNavException;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import static ca.sharcnet.nerve.docnav.dom.NodeType.ELEMENT;
import ca.sharcnet.nerve.docnav.dom.TextNode;
import org.junit.Assert;
import org.junit.Test;

/**
 *
 * @author edward
 */
public class A_NodeTest {
    private final Node eNode1;
    private final Node root;
    private final Node gen1[] = new ElementNode[3];
    private final Node gen2[] = new ElementNode[9];

    /* Creates a root node with 3 gen1 nodes each with 3 gen2 nodes */
    public A_NodeTest() {
        this.eNode1 = new ElementNode("div");
        this.root = new ElementNode("root");
        for (int i = 0; i < gen1.length; i++){
            gen1[i] = new ElementNode("gen1");
            root.addChild(gen1[i]);
        }
        for (int i = 0; i < gen2.length; i++){
            gen2[i] = new ElementNode("gen2");
            gen1[i / 3].addChild(gen2[i]);
        }
    }

    @Test
    public void getName(){
        Assert.assertEquals("div", eNode1.name());
    }

    @Test
    public void getType(){
        Assert.assertEquals(ELEMENT, eNode1.getType());
    }

    @Test
    public void testSetup(){
        Assert.assertEquals(3, root.childCount());
        Assert.assertTrue(root.childNodes().contains(gen1[0]));
        Assert.assertTrue(root.childNodes().contains(gen1[1]));
        Assert.assertTrue(root.childNodes().contains(gen1[2]));
        Assert.assertTrue(gen1[0].childNodes().contains(gen2[0]));
        Assert.assertTrue(gen1[0].childNodes().contains(gen2[1]));
        Assert.assertTrue(gen1[0].childNodes().contains(gen2[2]));
        Assert.assertTrue(gen1[1].childNodes().contains(gen2[3]));
        Assert.assertTrue(gen1[1].childNodes().contains(gen2[4]));
        Assert.assertTrue(gen1[1].childNodes().contains(gen2[5]));
        Assert.assertTrue(gen1[2].childNodes().contains(gen2[6]));
        Assert.assertTrue(gen1[2].childNodes().contains(gen2[7]));
        Assert.assertTrue(gen1[2].childNodes().contains(gen2[8]));
        Assert.assertFalse(root.hasParent());
        Assert.assertEquals(root, gen1[0].getParent());
        Assert.assertEquals(root, gen1[1].getParent());
        Assert.assertEquals(root, gen1[2].getParent());
        Assert.assertEquals(gen1[0], gen2[0].getParent());
        Assert.assertEquals(gen1[0], gen2[1].getParent());
        Assert.assertEquals(gen1[0], gen2[2].getParent());
        Assert.assertEquals(gen1[1], gen2[3].getParent());
        Assert.assertEquals(gen1[1], gen2[4].getParent());
        Assert.assertEquals(gen1[1], gen2[5].getParent());
        Assert.assertEquals(gen1[2], gen2[6].getParent());
        Assert.assertEquals(gen1[2], gen2[7].getParent());
        Assert.assertEquals(gen1[2], gen2[8].getParent());
    }

    @Test
    @SuppressWarnings("SizeReplaceableByIsEmpty")
    public void childNodes_empty(){
        Assert.assertTrue(eNode1.childNodes().isEmpty());
        Assert.assertTrue(eNode1.childNodes().size() == 0);
    }

    @Test
    public void childNodes_one(){
        eNode1.addChild(new ElementNode("div"));
        Assert.assertFalse(eNode1.childNodes().isEmpty());
        Assert.assertTrue(eNode1.childNodes().size() == 1);
    }

    @Test
    public void childNodes_many(){
        Assert.assertFalse(root.childNodes().isEmpty());
        Assert.assertTrue(root.childNodes().size() == 3);
    }

    @SuppressWarnings("SizeReplaceableByIsEmpty")
    public void clearChildren_none(){
        eNode1.clearChildren();
        Assert.assertTrue(eNode1.childNodes().isEmpty());
        Assert.assertTrue(eNode1.childNodes().size() == 0);
    }

    @SuppressWarnings("SizeReplaceableByIsEmpty")
    public void clearChildren_some(){
        gen1[2].clearChildren();
        Assert.assertTrue(gen1[2].childNodes().isEmpty());
        Assert.assertTrue(gen1[2].childNodes().size() == 0);
    }

    @Test
    public void removeChild(){
        root.removeChild(gen1[0]);
        Assert.assertFalse(gen1[0].hasParent());
        Assert.assertFalse(root.childNodes().contains(gen1[0]));
        Assert.assertTrue(root.childNodes().contains(gen1[1]));
        Assert.assertTrue(root.childNodes().contains(gen1[2]));
    }

    @Test(expected=NullPointerException.class)
    public void removeChild_null(){
        root.removeChild(null);
    }

    @Test
    public void removeChild_notContained(){
        Assert.assertNull(root.removeChild(gen2[0]));
    }

    @Test
    public void childOrder(){
        Assert.assertEquals(gen1[0], root.childNodes().get(0));
        Assert.assertEquals(gen1[1], root.childNodes().get(1));
        Assert.assertEquals(gen1[2], root.childNodes().get(2));
    }

    @Test
    public void childOrder_after_remove(){
        root.removeChild(gen1[0]);
        Assert.assertEquals(gen1[1], root.childNodes().get(0));
        Assert.assertEquals(gen1[2], root.childNodes().get(1));
    }

    @Test
    public void childOrder_after_readd(){
        root.addChild(gen1[0]);
        Assert.assertEquals(gen1[1], root.childNodes().get(0));
        Assert.assertEquals(gen1[2], root.childNodes().get(1));
        Assert.assertEquals(gen1[0], root.childNodes().get(2));
    }

    @Test
    public void replaceWithChildren(){
        gen1[0].replaceWithChildren();
        Assert.assertEquals(gen2[0], root.childNodes().get(0));
        Assert.assertEquals(gen2[1], root.childNodes().get(1));
        Assert.assertEquals(gen2[2], root.childNodes().get(2));
        Assert.assertEquals(gen1[1], root.childNodes().get(3));
        Assert.assertEquals(gen1[2], root.childNodes().get(4));
    }

    @Test
    public void replaceWithChildren_checkparents(){
        gen1[0].replaceWithChildren();
        Assert.assertEquals(root, gen2[0].getParent());
        Assert.assertEquals(root, gen2[1].getParent());
        Assert.assertEquals(root, gen2[2].getParent());
        Assert.assertEquals(root, gen1[1].getParent());
        Assert.assertEquals(root, gen1[2].getParent());
    }

    @Test(expected=DocNavException.class)
    public void replaceWithChildren_noParent(){
        root.replaceWithChildren();
    }

    @Test(expected=DocNavException.class)
    public void replaceChild_not_owned(){
        gen1[0].replaceChild(gen2[8], new ElementNode("new"));
    }

    @Test
    public void copy(){
        ElementNode source = new ElementNode("div");
        ElementNode copy = source.copy();
        Assert.assertNotEquals(source, copy);
    }

    @Test
    public void copy_with_children_1(){
        ElementNode source = new ElementNode("div");
        source.addChild(new TextNode("text"));
        ElementNode copy = source.copy();

        Assert.assertEquals(source.toString(), copy.toString());
        Assert.assertNotEquals(source.childNodes().get(0), copy.childNodes().get(0));
    }

    @Test
    public void copy_with_children_2(){
        ElementNode source = new ElementNode("div");
        TextNode child = (TextNode) source.addChild(new TextNode("text"));
        ElementNode copy = source.copy();
        child.setText("ima copy");
        Assert.assertNotEquals(source.toString(), copy.toString());
    }

    @Test
    public void copy_with_attributes_1(){
        ElementNode source = new ElementNode("div");
        source.attr("class", "ima-class");
        source.attr("id", "ima-id");
        ElementNode copy = source.copy();
        Assert.assertEquals(source.toString(), copy.toString());
    }

    @Test
    public void copy_with_attributes_2(){
        ElementNode source = new ElementNode("div");
        source.attr("class", "ima-class");
        source.attr("id", "ima-id");
        ElementNode copy = source.copy();
        source.attr("id", "ima-id-copy");
        Assert.assertNotEquals(source.toString(), copy.toString());
    }

}
