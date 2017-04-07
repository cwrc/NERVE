package ca.sharcnet.nerve.docnav.tests;
import ca.sharcnet.nerve.docnav.tests.helpers.NodeImpl;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.tests.helpers.TestNodeType;
import static org.junit.Assert.*;
import org.junit.Test;

/**
 *
 * @author edward
 */
public class DocumentTest {
    private final Document document;


    public DocumentTest() {
        document = new Document();
    }

    @Test
    public void document_addChild_one() {
        NodeImpl nodeImpl = new NodeImpl(TestNodeType.TEST_NODE, "Node1");
        document.addChild(nodeImpl);
        assertTrue(document.childNodes().contains(nodeImpl));
    }

    @Test
    public void document_addChild_two() {
        NodeImpl nodeImpl1 = new NodeImpl(TestNodeType.TEST_NODE, "Node1");
        NodeImpl nodeImpl2 = new NodeImpl(TestNodeType.TEST_NODE, "Node1");
        document.addChild(nodeImpl1);
        document.addChild(nodeImpl2);
        assertTrue(document.childNodes().contains(nodeImpl1));
        assertTrue(document.childNodes().contains(nodeImpl2));
    }

    @Test
    public void document_addChild_many() {
        int n = (int) (Math.random() * 30) + 10;
        NodeImpl[] nodes = new NodeImpl[n];

    }
}
