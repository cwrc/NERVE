package ca.sharcnet.nerve.docnav.dom;

import static ca.sharcnet.nerve.docnav.dom.Node.NodeType.DOCTYPE;

/**
The inner text of a meta data node does contain the braces.
@author edward
*/
public class DoctypeNode extends Node{

    /**
    By-value constructor.
    @param innerText
    */
    public DoctypeNode(String innerText){
        super(DOCTYPE, innerText, "@DOCTYPE");
    }

    public DoctypeNode(String innerText, ElementNode parent){
        super(DOCTYPE, innerText, "@DOCTYPE", parent);
    }

    @Override
    Node copy(ElementNode newParent){
        return new DoctypeNode(this.innerText(), newParent);
    }

    /**
    @return an xml compliant string.
     */
    @Override
    public String toString() {
        return this.innerText();
    }
}
