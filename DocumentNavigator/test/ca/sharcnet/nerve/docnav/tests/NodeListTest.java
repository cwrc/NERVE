/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.docnav.tests;

import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import java.util.Collection;
import org.junit.Test;
import static org.junit.Assert.*;

public class NodeListTest {

    @Test
    public void constructor_default(){
        NodeList nodeList = new NodeList();
        assertEquals(0, nodeList.size());
    }

    @Test
    public void add_new(){
        NodeList nodeList = new NodeList();
        ElementNode node = new ElementNode("div");
        assertTrue(nodeList.add(node));
        assertEquals(1, nodeList.size());
        assertTrue(nodeList.contains(node));
    }

    @Test
    public void add_repeat(){
        NodeList nodeList = new NodeList();
        ElementNode node = new ElementNode("div");
        assertTrue(nodeList.add(node));
        assertFalse(nodeList.add(node));
        assertEquals(1, nodeList.size());
        assertTrue(nodeList.contains(node));
    }

    @Test
    public void add_nodelist(){
        NodeList nodeList1 = new NodeList();
        NodeList nodeList2 = new NodeList();
        assertTrue(nodeList1.add(new ElementNode("div")));
        assertTrue(nodeList1.add(new ElementNode("div")));
        assertTrue(nodeList1.add(new ElementNode("div")));
        nodeList2.add(nodeList1);
        for (Node node : nodeList1) assertTrue(nodeList2.contains(node));
    }

    @Test
    public void add_iterable(){
        Collection<Node> nodeList1 = new NodeList();
        NodeList nodeList2 = new NodeList();
        assertTrue(nodeList1.add(new ElementNode("div")));
        assertTrue(nodeList1.add(new ElementNode("div")));
        assertTrue(nodeList1.add(new ElementNode("div")));
        nodeList2.add(nodeList1);
        for (Node node : nodeList1) assertTrue(nodeList2.contains(node));
    }

    @Test
    public void query1(){
        NodeList nodeList = new NodeList();
        nodeList.filter("*");
    }
}
