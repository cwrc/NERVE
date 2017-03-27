package ca.sharcnet.nerve.docnav.dom;

import java.util.ArrayList;
import java.util.function.Function;
import java.util.function.Predicate;

public class NodeList <E extends Node> extends ArrayList<E>{

    public NodeList(){
        super();
    }

    /**
    * Create a new node list, populating it with references of all the nodes in
    * the 'that' node list.
    * @param that
    */
    public NodeList(NodeList <? extends E> that){
        for (E node : that) this.add(node);
    }

    public void add(NodeList <? extends E> that){
        for (E node : that) this.add(node);
    }

    /**
     *
     * @param predicate
     * @return
     */
    public NodeList<E> filter(Predicate <E> predicate){
        NodeList <E> rvalue = new NodeList<>();
        this.forEach((node)->{
            if (predicate.test(node)) rvalue.add(node);
        });
        return rvalue;
    }

    /**
    A convienince function to return a nodelist of a certain type.  The list
    returned is a non-relective copy.
    @param <T>
    @return
    */
    @Deprecated
    public <T extends Node> NodeList<T> asListType(){
        NodeList<T> newList = new NodeList<>();
        for (Node n : this) newList.add((T)n);
        return newList;
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
