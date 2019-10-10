package ca.sharcnet.nerve.scriber.graph;

import ca.sharcnet.nerve.scriber.sql.SQLRecord;
import java.util.Arrays;

/**
 * A tree shaped map with each branches of type BRANCH and nodes of type NODE.
 * Nodes may have no value.  Nodes with a value are considered terminal.
 * @author edward
 * @param <EDGE>
 * @param <NODE> 
 */
public class Tree<EDGE, NODE> {
    private final TreeNode root;
    
    public Tree() {
        this.root = new TreeNode();
    }
    
    /**
     * Retrieve the root.
     * @return 
     */
    public TreeNode getRoot(){
        return this.root;
    }
    
    /**
     * Add a non-terminal path to this tree.
     * @param path 
     */
    public void addPath(EDGE[] path) {
        TreeNode current = root;
        for (EDGE edge : path){
            current = current.attach(edge);
        }        
    }
    
    /**
     * Add a non-terminal path to this tree.
     * @param path 
     */
    public void addPath(EDGE[] path, NODE value) {
        TreeNode current = root;
        for (int i = 0; i < path.length - 1; i++){
            current = current.attach(path[i]);
        }        
        current.attach(path[path.length-1], value);
    }    
        
    /**
     * Add a non-terminal path to this tree.
     * @param path 
     * @return true if path exists
     */
    public boolean hasPath(Iterable<EDGE> path) {
        TreeNode current = root;
        for (EDGE edge : path){            
            current = current.next(edge);
            if (current == null) return false;            
        }
        return true;
    }
    
    public boolean hasPath(EDGE[] path) {
        return this.hasPath(Arrays.asList(path));
    }    
    
    /**
     * Add a non-terminal path to this tree.
     * @param path 
     * @return true if path exists and ends in a terminal node.
     */
    public boolean isTerminal(Iterable<EDGE> path) {
        TreeNode current = root;
        for (EDGE edge : path){            
            current = current.next(edge);
            if (current == null) return false;
        }
        return current.isTerminal();
    }    
    
    public boolean isTerminal(EDGE[] path) {
        return this.isTerminal(Arrays.asList(path));
    }    
    
    /**
     * Retrieve the value associated with path.
     * @param path 
     * @return associated value, null if no value is associated.
     */
    public NODE getValue(Iterable<EDGE> path) {
        TreeNode <EDGE, NODE> current = root;
        for (EDGE edge : path){            
            current = current.next(edge);
            if (current == null) return null;
        }
        return current.getValue();
    }        

    public NODE getValue(EDGE[] path) {
        return this.getValue(Arrays.asList(path));
    }        
    
    public Iterable<PathResult<String, SQLRecord>> allPaths(String[] tokens, int i, int i0) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
