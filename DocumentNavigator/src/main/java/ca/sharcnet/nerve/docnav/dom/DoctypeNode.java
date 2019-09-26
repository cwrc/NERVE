package ca.sharcnet.nerve.docnav.dom;

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
        super(NodeType.DOCTYPE, "@DOCTYPE");
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
    public DoctypeNode copy() {
        return new DoctypeNode(innerText);
    }
}
