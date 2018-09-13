package ca.sharcnet.dh.scriber.graph;
import java.util.HashMap;

class TreeNode<KEY, VALUE> {
    boolean terminal = false;
    VALUE value = null;
    private KEY key;
    HashMap<KEY, TreeNode<KEY,VALUE>> nextNodes = new HashMap<>();

    TreeNode() {
        this.key = null;
    }

    TreeNode(KEY key) {
        this.key = key;
    }

    TreeNode(KEY[] keys, VALUE value) {
        this(keys[0]);
        TreeNode<KEY,VALUE> current = this;

        for (int i = 1; i < keys.length; i++) {
            TreeNode<KEY,VALUE> next = new TreeNode<>(keys[i]);
            current.attach(next);
            current = next;
        }
        current.terminal = true;
        current.value = value;
    }

    void attach(TreeNode<KEY,VALUE> newNode) {
        if (nextNodes.containsKey(newNode.key)) {
            TreeNode<KEY,VALUE> oldNode = nextNodes.get(newNode.key);
            if (newNode.isTerminal()) {
                oldNode.terminal = true;
                oldNode.value = newNode.value;
            } else {
                for (TreeNode<KEY,VALUE> node : newNode.nextNodes.values()) {
                    oldNode.attach(node);
                }
            }
        } else {
            nextNodes.put(newNode.key, newNode);
        }
    }

    boolean isTerminal() {
        return terminal;
    }

    public String toString() {
        return "{" + key + ", " + (terminal ? "terminal" : "transient") + "}";
    }
}
