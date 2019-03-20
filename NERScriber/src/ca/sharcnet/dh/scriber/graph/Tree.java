package ca.sharcnet.dh.scriber.graph;
import java.util.ArrayList;

public class Tree<KEY, VALUE> extends TreeNode<KEY, VALUE> {

    public Tree() {
        super();
    }

    /**
    Return true if this path exists and the end of the path corrisponds with a
    terminal node in the graph.
    @param path
    @return
     */
    public boolean containsExactPath(KEY[] path) {
        TreeNode<KEY, VALUE> current = this;
        if (current == null) return false;
        int i = 0;

        while (i < path.length) {
            KEY type = path[i];

            if (current.nextNodes.containsKey(type)) {
                current = current.nextNodes.get(type);
                i = i + 1;
            } else {
                return false;
            }
        }

        return current.isTerminal();
    }

    public VALUE getValue(KEY[] path) {
        return getValue(path, 0, 0);
    }

    public VALUE getValue(KEY[] path, int from, int skip) {
        VALUE result = null;
        TreeNode<KEY, VALUE> current = this;

        if (current == null) return null;
        int i = from;

        while (i < path.length) {
            KEY key = path[i];

            if (current.nextNodes.containsKey(key)) {
                current = current.nextNodes.get(key);
                if (current.isTerminal()) result = current.value;
                i = i + 1 + skip;
            } else {
                break;
            }
        }

        return result;
    }

    public Object[] longestSubPath(KEY[] path) {
        return longestSubPath(path, 0, 0);
    }

    public Object[] longestSubPath(KEY[] path, int from, int skip) {
        int to = from;
        TreeNode<KEY, VALUE> current = this;

        if (current == null) return new Object[0];
        int i = from;

        while (i < path.length) {
            KEY type = path[i];

            if (current.nextNodes.containsKey(type)) {
                current = current.nextNodes.get(type);
                i = i + 1 + skip;
                if (current.isTerminal()) to = i;
            } else {
                break;
            }
        }

        ArrayList<KEY> result = new ArrayList<>();
        for (int j = from; j < to && j < path.length; j = j + 1) {
            result.add(path[j]);
        }
        return result.toArray();
    }

    public PathResult<KEY,VALUE> firstPath(KEY[] path) {
        return firstPath(path, 0, 0);
    }

    /**
    Return the longest path from the earliest start point.  Skip every 'skip'
    nodes from the earliest start point.
    @param path
    @param from
    @param skip
    @return
     */
    public PathResult<KEY,VALUE> firstPath(KEY[] path, int from, int skip) {
        int k = from;
        PathResult<KEY,VALUE> result = new PathResult<>(path);

        while (result.end == -1 && k < path.length) {
            while (k < path.length && !this.nextNodes.containsKey(path[k])) {
                k++;
            }

            TreeNode<KEY, VALUE> current = this;
            result.start = k;

            while (k < path.length) {
                if (current.nextNodes.containsKey(path[k])) {
                    current = current.nextNodes.get(path[k]);
                    if (current.isTerminal()){
                        result.end = k;
                        result.value = current.value;
                    }
                    k = k + 1 + skip;
                } else {
                    break;
                }
            }
        }

        if (result.end == -1) result.start = -1;
        return result;
    }

    public Iterable<PathResult<KEY,VALUE>> allPaths(KEY[] path) {
        return allPaths(path, 0, 0);
    }

    /**
    Return all longest paths without overlap, precedence will be given to paths
    that start earlier.
    @param path
    @param from
    @param skip
    @return
     */
    public Iterable<PathResult<KEY,VALUE>> allPaths(KEY[] path, int from, int skip) {
        ArrayList<PathResult<KEY,VALUE>> arrayList = new ArrayList<>();
        PathResult<KEY,VALUE> current = firstPath(path, from, skip);

        while(current.end != -1){
            arrayList.add(current);
            if (current.end + 1 >= path.length) break;
            current = firstPath(path, current.end + 1, skip);
        }
        return arrayList;
    }

    public void addPath(KEY[] path) {
        TreeNode<KEY, VALUE> node = new TreeNode<>(path, null);
        this.attach(node);
    }

    public void addPath(KEY[] path, VALUE value) {
        TreeNode<KEY, VALUE> node = new TreeNode<>(path, value);
        this.attach(node);
    }
}
