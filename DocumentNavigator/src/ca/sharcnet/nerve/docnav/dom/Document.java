package ca.sharcnet.nerve.docnav.dom;

/**
* Root object for all structured documents.  Is of type NodeType.DOCUMENT, and
* has node name "@DOCUMENT".  Otherwise it is identical to an
* {@link Node}.
* @author edward
*/
public class Document extends Node{

    public Document(){
        super(NodeType.DOCUMENT, "@DOCUMENT", new AttributeList(), new NodeList());
    }

    public Document(Node source){
        super(NodeType.DOCUMENT, "@DOCUMENT", source.getAttributes(), source.childNodes());
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        for (Node n : this.childNodes()){
            builder.append(n.toString());
        }
        return builder.toString();
    }

    @Override
    public Document copy() {
        throw new UnsupportedOperationException("Documents can not be copied");
    }
}