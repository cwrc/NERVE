/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.docnav.tests;

import ca.sharcnet.nerve.Console;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.NameConstants;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import java.io.IOException;
import java.io.InputStream;
import org.junit.Assert;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 * This test loads the test classes from the file, and may at times rely on - though not explicetly test - the query
 * api.  It is similar to the query tests in this way as opposed to the earlier build A_NodeTest and B_NodeTest.
 * @author edward
 */
public class C_NodeTest implements HasStreams{

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }

    @Test
    public void test_decendents_all() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("c_nodetest.xml"));
        NodeList nodes = doc.decendentNodes();
        String string = nodes.toString(n->n.getName());
        Assert.assertEquals("xml@TEXT@DOCTYPE@TEXT@COMMENT@TEXTroot@TEXTdiv@TEXTabcd@TEXTabcd@TEXT@TEXTdiv@TEXTbcd@TEXTbcd@TEXTbcd@TEXT@TEXTdiv@TEXT", string);
    }

    @Test
    public void test_decendents_element() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("c_nodetest.xml"));
        NodeList nodes = doc.decendentNodes(NodeType.ELEMENT);
        String string = nodes.toString(n->n.getName());
        Assert.assertEquals("rootdivabcdabcddivbcdbcdbcddiv", string);
    }

    @Test
    public void test_decendents_instruction() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("c_nodetest.xml"));
        NodeList nodes = doc.decendentNodes(NodeType.INSTRUCTION);
        String string = nodes.toString(n->n.getName());
        Assert.assertEquals("xml", string);
    }

    @Test
    public void test_decendents_doctype() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("c_nodetest.xml"));
        NodeList nodes = doc.decendentNodes(NodeType.DOCTYPE);
        String string = nodes.toString(n->n.getName());
        Assert.assertEquals(NameConstants.doctype, string);
    }

    @Test
    public void test_decendents_hasAttribute_not() throws IOException{
        ElementNode node = new ElementNode("div");
        Assert.assertFalse(node.hasAttribute("class"));
    }

    @Test
    public void test_decendents_hasAttribute_not_removed() throws IOException{
        ElementNode node = new ElementNode("div");
        node.addAttribute("class", "ima class");
        node.removeAttribute("class");
        Assert.assertFalse(node.hasAttribute("class"));
    }

    @Test
    public void test_decendents_hasAttribute_by_value_not_1() throws IOException{
        ElementNode node = new ElementNode("div");
        Assert.assertFalse(node.hasAttribute("class", "ima-class"));
    }

    @Test
    public void test_decendents_hasAttribute_by_value_not_2() throws IOException{
        ElementNode node = new ElementNode("div");
        node.addAttribute("class", "ima class");
        Assert.assertFalse(node.hasAttribute("class", "not-here"));
    }

    @Test
    public void test_decendents_hasAttribute_by_value_not_3() throws IOException{
        ElementNode node = new ElementNode("div");
        node.addAttribute("class", "ima class");
        Assert.assertFalse(node.hasAttribute("class", ""));
    }

    @Test
    public void test_decendents_hasAttribute_by_value_not_removed() throws IOException{
        ElementNode node = new ElementNode("div");
        node.addAttribute("class", "ima class");
        node.removeAttribute("class");
        Assert.assertFalse(node.hasAttribute("class", "ima class"));
    }
}
