package ca.sharcnet.nerve.docnav.dom;

public class TextNode extends Node{

    public TextNode(String innerText){
        this(innerText, null);
    }

    TextNode(String innerText, ElementNode parent){
        super(NodeType.TEXT, innerText, "@TEXT", parent);
    }

    @Override
    Node copy(ElementNode newParent){
        return new TextNode(this.innerText(), newParent);
    }

    @Override
    public String toString(){
        return this.innerText();
    }
}
