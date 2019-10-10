/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.stringmatch;

import ca.sharcnet.nerve.scriber.graph.Tree;
import ca.sharcnet.nerve.scriber.stringmatch.TreeTraversal.STATE;
import junit.framework.TestCase;

/**
 *
 * @author edward
 */
public class TreeTraversalTest extends TestCase {
    
    public TreeTraversalTest(String testName) {
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

    public void testAccept() {
        System.out.println("testAccept");
        Tree tree = new Tree<Integer, String>();
        
        tree.addPath(new String[]{"A", "B", "C", "D"}, 0);
        
        TreeTraversal<String, Integer> instance = new TreeTraversal<>();
        
//        assertEquals(STATE.PENDING, instance.consumeToken("A"));
//        assertEquals(STATE.PENDING, instance.consumeToken("B"));
//        assertEquals(STATE.PENDING, instance.consumeToken("C"));
//        assertEquals(STATE.PENDING_ACCEPT, instance.consumeToken("D"));
//        assertEquals(STATE.ACCEPT, instance.finish());
    }

    public void testReject00() {
        System.out.println("testReject00");
        Tree tree = new Tree<Integer, String>();
        
        tree.addPath(new String[]{"A", "B", "C", "D"}, 0);
        
        TreeTraversal<String, Integer> instance = new TreeTraversal<>();
        
//        assertEquals(STATE.PENDING_REJECT, instance.consumeToken("X"));
//        assertEquals(STATE.PENDING_REJECT, instance.consumeToken("Y"));
//        assertEquals(STATE.PENDING_REJECT, instance.consumeToken("Z"));
//        assertEquals(STATE.REJECT, instance.finish());
    }
    
    public void testReject01() {
        System.out.println("testReject01");
        Tree tree = new Tree<Integer, String>();
        
        tree.addPath(new String[]{"A", "B", "C", "D"}, 0);
        
        TreeTraversal<String, Integer> instance = new TreeTraversal<>();
        
//        assertEquals(STATE.PENDING, instance.consumeToken("A"));
//        assertEquals(STATE.PENDING, instance.consumeToken("B"));
//        assertEquals(STATE.PENDING_REJECT, instance.consumeToken("Z"));
//        assertEquals(STATE.REJECT, instance.finish());
    }   
    
    public void testAcceptReject00() {
        System.out.println("testAcceptReject00");
        Tree tree = new Tree<Integer, String>();
        
        tree.addPath(new String[]{"A", "B"}, 0);
        
        TreeTraversal<String, Integer> instance = new TreeTraversal<>();
        
//        assertEquals(STATE.PENDING, instance.consumeToken("A"));
//        assertEquals(STATE.PENDING_ACCEPT, instance.consumeToken("B"));
//        assertEquals(STATE.ACCEPT, instance.consumeToken("A"));
//        assertEquals(STATE.REJECT, instance.finish());
    }       
    
}
