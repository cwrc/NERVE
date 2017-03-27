package ca.sharcnet.nerve.docnav.dom;

/**
The inner text of a comment node does not contain the braces.
@author edward
*/
public class CommentNode extends Node{
    /**
    By-value constructor, if 'innerText' starts with '&gt!--' and ends with
    '--&lt', 'innertext' will have the enclosing comment markup truncated.
    @param innerText
    */
    public CommentNode(String innerText){
        this(innerText.startsWith("<!--") && innerText.endsWith("-->") ? innerText.substring(4, innerText.length() - 3) : innerText, null);
    }

    /**
    Copy contructor.  Create a new comment node from the innertext of a given
    node.  No truncation takes place.
    @param that the source node
    */
    public CommentNode(Node that){
        this(that.innerText(), null);
    }

    CommentNode(String innerText, ElementNode parent){
        super(NodeType.COMMENT, innerText, "@COMMENT", parent);
    }

    @Override
    CommentNode copy(ElementNode newParent){
        return new CommentNode(this.innerText(), newParent);
    }

    @Override
    public String toString(){
        return "<!--" + innerText() + "-->";
    }
}
