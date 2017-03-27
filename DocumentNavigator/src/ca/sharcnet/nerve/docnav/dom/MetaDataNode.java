package ca.sharcnet.nerve.docnav.dom;

/**
The inner text of a meta data node does contain the braces.
@author edward
*/
public class MetaDataNode extends Node{

    /**
    By-value constructor.
    @param innerText
    */
    public MetaDataNode(String innerText){
        this(innerText, null);
    }

    MetaDataNode(String innerText, ElementNode parent){
        super(NodeType.METADATA, innerText, "@METADATA", parent);
    }

    @Override
    Node copy(ElementNode newParent){
        return new MetaDataNode(this.innerText(), newParent);
    }

    @Override
    public String toString(){
        return innerText();
    }
}
