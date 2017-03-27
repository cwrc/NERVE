package ca.sharcnet.nerve.docnav.dom;

/**
* Root object for all structured documents.  Is of type NodeType.DOCUMENT, and
* has node name "@DOCUMENT".  Otherwise it is identical to an
* {@link ElementNode}.
* @author edward
*/
public class Document extends ElementNode{

    public Document(){
        super(NodeType.DOCUMENT, "@DOCUMENT", new AttributeList(), new NodeList(), null);
    }

    public Document(ElementNode source){
        super(NodeType.DOCUMENT, "@DOCUMENT", source.getAttributes(), source.childNodes(), null);
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        for (Node n : this.childNodes()) builder.append(n.toString());
        return builder.toString();
    }

    /**
    Copy constructor.
    @return a new element node with no parent
    */
    @Override
    public Document copy() {
        ElementNode elementNode = super.copy();
        elementNode = elementNode.renameCopy("@DOCUMENT");
        elementNode = elementNode.retypeCopy(NodeType.DOCUMENT);
        return (Document) elementNode;
    }
}
