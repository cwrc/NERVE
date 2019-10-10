package ca.sharcnet.nerve.scriber.graph;
import java.util.HashMap;

/**
 * A single Node on a tree.  This class records both the path to the node and 
 * the node value.
 * @author edward
 * @param <EDGE>
 * @param <NODE> 
 */
class TreeBranch<EDGE, NODE> {    
    // node value
    NODE value = null;
    
    // the first node on the path
    private EDGE root;
    
    // a maping of outgoing branches, Branch -> TreeNode
    HashMap<EDGE, TreeBranch<EDGE,NODE>> nextNodes = new HashMap<>();

    /**
     * Create a single node.
     * @param key 
     */
    TreeBranch(EDGE key) {
        this.root = key;
    }

    /**
     * Create a branch of nodes based on keys .
     */
    TreeBranch(EDGE[] edges, NODE value) {
        this.root = edges[0];
        TreeBranch<EDGE,NODE> current = this;

        for (int i = 1; i < edges.length; i++) {
            nextNodes.put(edges[i], new TreeBranch<>(edges[i]));
        }
        
        /* the last node on the branch contains the value */
        current.value = value;
    }

    /**
     * Merge two branches.
     * Attach the root-edge of 'that' to the first matching edge in 'this'.
     * Replace any terminal values in 'this' with terminal values in 'that'.
     * @param that 
     */
    void attach(TreeBranch<EDGE,NODE> that) {
        if (nextNodes.containsKey(that.root)) {
            TreeBranch<EDGE,NODE> oldNode = nextNodes.get(that.root);
            
            /* if the new node is terminal replace the old value with the new */
            if (that.isTerminal()) {
                oldNode.value = that.value;
            } else {
                for (TreeBranch<EDGE,NODE> node : that.nextNodes.values()) {
                    oldNode.attach(node);
                }
            }
        } else {
            nextNodes.put(that.root, that);
        }
    }

    boolean isTerminal() {
        return value != null;
    }

    public String toString() {
        return "{" + root + ", " + (isTerminal() ? "terminal" : "transient") + "}";
    }
}
