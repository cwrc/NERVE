package ca.sharcnet.nerve.docnav.dom;

/**
The inner text of a comment node does not contain the braces.
@author edward
*/
public class CommentNode extends Node{
    private final String commentText;

    /**
    By-value constructor, if 'sourceText' starts with '&gt!--' and ends with
    '--&lt', 'innertext' will have the enclosing comment markup truncated.
    @param sourceText
    */
    public CommentNode(String sourceText){
        super(NodeType.COMMENT, "@COMMENT");
        String string = sourceText.startsWith("<!--") && sourceText.endsWith("-->") ? sourceText.substring(4, sourceText.length() - 3) : sourceText;
        this.commentText = string;
    }

    @Override
    public String toString(){
        return "<!--" + commentText + "-->";
    }

    @Override
    public Node copy() {
        return new CommentNode(commentText);
    }
}
