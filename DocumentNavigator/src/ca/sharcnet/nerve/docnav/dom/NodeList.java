package ca.sharcnet.nerve.docnav.dom;
import ca.sharcnet.nerve.docnav.query.Query;
import java.util.ArrayList;
import java.util.function.Function;
import java.util.function.Predicate;

public class NodeList extends ArrayList<Node>{

    public NodeList(){
        super();
    }

    /**
    Create a new NodeList with copies of all Nodes From a given NodeList.
    @param that
    @return
    */
    public NodeList deepCopy(Iterable <Node> that){
        NodeList list = new NodeList();
        that.forEach(n->list.add(n.copy()));
        return list;
    }

    public void add(Iterable <Node> that){
        for (Node node : that) this.add(node);
    }

    /**
    Add a node to this list if that node is not already a member.
    @param e
    @return
    */
    @Override
    public boolean add(Node e){
        if (!this.contains(e)) return super.add(e);
        return false;
    }

    public String toString(Function<Node, String> function){
        return toString(function, "");
    }

    public String toString(Function<Node, String> function, String delim){
        StringBuilder builder = new StringBuilder();

        for (int i = 0; i < this.size(); i++){
            builder.append(function.apply(this.get(i)));
            if (i != (this.size() - 1)) builder.append(delim);
        }
        return builder.toString();
    }


    public Query filter(String select){
        return new Query(this, select);
    }

    /**
    Return true if the test passes on any node.
    @param predicate
    @return
    */
    public boolean testAny(Predicate<Node> predicate){
        for (Node node : this){
            if (predicate.test(node)) return true;
        }
        return false;
    }

    /**
     * @param select A select string with format information
     * @param args Arguments referenced by the format specifiers in the format string. If there are more arguments than format
     * specifiers, the extra arguments are ignored. The number of arguments is variable and may be zero. The maximum number
     * of arguments is limited by the maximum dimension of a Java array as defined by The Java™ Virtual Machine
     * Specification. The behaviour on a null argument depends on the conversion.
     * @return
     */
    public Query filterf(String select, Object ... args){
        return new Query(this, String.format(select, args));
    }
}
