package ca.sharcnet.nerve.docnav.dom;

public class TextNode extends Node{
    private String innerText;

    public TextNode(String innerText){
        super(NodeType.TEXT, "@TEXT");
        this.innerText = innerText;
    }

    public String getText() {
        return innerText;
    }

    public void setText(String s) {
        innerText = s;
    }

    @Override
    public String toString(){
        return this.innerText;
    }

    @Override
    public Node copy() {
        return new TextNode(innerText);
    }
}
