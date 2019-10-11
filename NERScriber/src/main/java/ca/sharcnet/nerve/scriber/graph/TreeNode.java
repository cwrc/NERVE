package ca.sharcnet.nerve.scriber.graph;
import java.util.HashMap;

/**
 * A single Node on a tree.  This class records both the path to the node and 
 * the node value.
 * @author edward
 * @param <EDGE>
 * @param <NODE> 
 */
public class TreeNode<EDGE, NODE> {    
    // node value
    NODE value = null;
    
    // a maping of outgoing branches, Branch -> TreeNode
    HashMap<EDGE, TreeNode<EDGE,NODE>> outgoing = new HashMap<>();

    /**
     * Create a single node.
     * @param key 
     */
    TreeNode() {}

    /**
     * Create a branch of nodes based on keys .
     */
    TreeNode(NODE value) {
        this.value = value;
    }
    
    /**
     * Attach a single non-terminal node onto this node.  If an attached node
     * already exists, return that node, else create, attach, and return a new
     * node.
     * @param that 
     */
    TreeNode attach(EDGE edge) {
        if (!this.outgoing.containsKey(edge)){
            this.outgoing.put(edge, new TreeNode());
        }
        return this.outgoing.get(edge);
    }

    /**
     * Attach a single terminal node onto this node connected by 'edge'.  If a
     * node already exists, change it to terminal.
     * @param that 
     */
    TreeNode attach(EDGE edge, NODE value) {
        TreeNode<EDGE, NODE> get = this.outgoing.get(edge);
        if (get != null){
            get.value = value;
        } else {
            this.outgoing.put(edge, new TreeNode(value));
        }
                
        return this.outgoing.get(edge);
    }    
    
    public TreeNode next(EDGE edge){
        if (this.outgoing.containsKey(edge)) return this.outgoing.get(edge);
        return null;
    }
    
    public boolean isTerminal() {
        return value != null;
    }  

    public NODE getValue() {
        return this.value;
    }
}
