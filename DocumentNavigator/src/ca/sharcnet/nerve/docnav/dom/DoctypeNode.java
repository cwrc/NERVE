package ca.sharcnet.nerve.docnav.dom;

import static ca.sharcnet.nerve.docnav.dom.Node.NodeType.DOCTYPE;

/**
The inner text of a meta data node does contain the braces.
@author edward
*/
public class DoctypeNode extends Node{
    private final String innerText;

    /**
    By-value constructor.
    @param innerText
    */
    public DoctypeNode(String innerText){
        super(DOCTYPE, "@DOCTYPE");
        this.innerText = innerText;
    }

    /**
    @return an xml compliant string.
     */
    @Override
    public String toString() {
        return innerText;
    }

    @Override
    public Node copy() {
        return new DoctypeNode(innerText);
    }
}
