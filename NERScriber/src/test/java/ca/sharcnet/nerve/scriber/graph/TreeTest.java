/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.graph;

import java.io.IOException;
import javax.xml.parsers.ParserConfigurationException;
import junit.framework.TestCase;
import org.xml.sax.SAXException;

/**
 *
 * @author edward
 */
public class TreeTest extends TestCase {

    public TreeTest(String testName) {
        super(testName);
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();
    }

    @Override
    protected void tearDown() throws Exception {
        super.tearDown();
    }

    public void test_add_path() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0});
    }

    public void test_has_path_true() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0});
        assertTrue(tree.hasPath(new Integer[]{0, 0, 0, 0}));
    }

    public void test_has_path_true_partial() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0});
        assertTrue(tree.hasPath(new Integer[]{0, 0}));
    }

    public void test_has_path_false() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0});
        assertFalse(tree.hasPath(new Integer[]{1, 0, 0, 0}));
        assertFalse(tree.hasPath(new Integer[]{0, 1, 1, 0}));
        assertFalse(tree.hasPath(new Integer[]{0, 0, 0, 1}));
    }

    public void test_has_path_false_oversize() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0});
        assertFalse(tree.hasPath(new Integer[]{0, 0, 0, 0, 0}));
    }

    public void test_has_path_multiple_true() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0});
        tree.addPath(new Integer[]{0, 1, 0, 0});
        assertTrue(tree.hasPath(new Integer[]{0, 0, 0, 0}));
        assertTrue(tree.hasPath(new Integer[]{0, 1, 0, 0}));
    }

    public void test_has_path_multiple_partial_true() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0});
        tree.addPath(new Integer[]{0, 1, 0, 0});
        assertTrue(tree.hasPath(new Integer[]{0, 0, 0}));
        assertTrue(tree.hasPath(new Integer[]{0, 1, 0}));
    }

    public void test_is_terminal_true() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0}, "T");
        assertTrue(tree.isTerminal(new Integer[]{0, 0, 0, 0}));
    }

    public void test_is_terminal_false_0() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0});
        assertFalse(tree.isTerminal(new Integer[]{0, 0, 0, 0}));
    }

    public void test_is_terminal_false_1() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0}, "T");
        assertFalse(tree.isTerminal(new Integer[]{1, 0, 0, 0}));
        assertFalse(tree.isTerminal(new Integer[]{0, 1, 1, 0}));
        assertFalse(tree.isTerminal(new Integer[]{0, 0, 0, 1}));
    }

    public void test_is_terminal_false_oversize() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0}, "T");
        assertFalse(tree.isTerminal(new Integer[]{0, 0, 0, 0, 0}));
    }

    public void test_get_value() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0}, "ZERO");
        assertEquals("ZERO", tree.getValue(new Integer[]{0, 0, 0, 0}));
    }
    
    public void test_get_value_replaced() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0}, "ONE");
        tree.addPath(new Integer[]{0, 0, 0, 0}, "ZERO");
        assertEquals("ZERO", tree.getValue(new Integer[]{0, 0, 0, 0}));
    }    
    
    public void test_multi() throws SAXException {
        Tree tree = new Tree<Integer, String>();
        tree.addPath(new Integer[]{0, 0, 0, 0}, "ZERO");
        tree.addPath(new Integer[]{0, 0, 0, 1}, "ZERO-ONE");
        tree.addPath(new Integer[]{0, 0, 0, 0, 1}, "ONE");
        tree.addPath(new Integer[]{0, 2}, "TWO");
        assertEquals("ZERO-ONE", tree.getValue(new Integer[]{0, 0, 0, 1}));
        assertEquals("ZERO", tree.getValue(new Integer[]{0, 0, 0, 0}));
        assertEquals("ONE", tree.getValue(new Integer[]{0, 0, 0, 0, 1}));
        assertEquals("TWO", tree.getValue(new Integer[]{0, 2}));
        assertEquals(null, tree.getValue(new Integer[]{0, 2, 0, 0, 0}));
    }
}
