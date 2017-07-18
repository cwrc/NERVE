package ca.sharcnet.nerve.docnav.dom;
import ca.sharcnet.nerve.docnav.query.Query;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.function.Function;

public class NodeList extends ArrayList<Node>{

    public NodeList(){
        super();
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

    public Query query(String select, IsNodeType ... types){
        if (types.length == 0) types = new IsNodeType[]{NodeType.ELEMENT};
        return new Query(this, select);
    }
}
