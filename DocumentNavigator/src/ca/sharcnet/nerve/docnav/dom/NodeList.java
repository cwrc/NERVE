package ca.sharcnet.nerve.docnav.dom;
import ca.sharcnet.nerve.docnav.selector.Select;
import java.util.ArrayList;
import java.util.Collection;
import java.util.function.Function;

public class NodeList <E extends Node> extends ArrayList<E>{

    public NodeList(){
        super();
    }

    /**
    * Create a new node list, populating it with references of all the nodes in
    * the 'that' node list.
    * @param collection The collection whose elements are to be placed into this list
    */
    public NodeList(Collection <? extends E> collection){
        super(collection);
    }

    public void add(NodeList <? extends E> that){
        for (E node : that) this.add(node);
    }

    public String toString(Function<E, String> function){
        return toString(function, "");
    }

    public String toString(Function<E, String> function, String delim){
        StringBuilder builder = new StringBuilder();

        for (int i = 0; i < this.size(); i++){
            builder.append(function.apply(this.get(i)));
            if (i != (this.size() - 1)) builder.append(delim);
        }
        return builder.toString();
    }
}
