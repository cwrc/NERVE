package ca.sharcnet.nerve.docnav.dom;

import ca.sharcnet.nerve.docnav.query.Query;

/**
* Root object for all structured documents.  Is of type NodeType.DOCUMENT, and
* has node name "@DOCUMENT".  Otherwise it is identical to an
* {@link ElementNode}.
* @author edward
*/
public class Document extends ElementNode{

    public Document(){
        super(NodeType.DOCUMENT, "@DOCUMENT", new AttributeList(), new NodeList());
    }

    public Document(ElementNode source){
        super(NodeType.DOCUMENT, "@DOCUMENT", source.getAttributes(), source.childNodes());
    }

    public InstructionNode getInstructionNode(String name){
        for (Node node : this.childNodes()){
            if (node.isType(NodeType.INSTRUCTION) && node.getName().equals(name)) return (InstructionNode) node;
        }
        return null;
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

    public Query query(String select){
        return new Query(this, select);
    }

    public Query queryInstructionNodes(String select){
        Query query = new Query();
        for (Node node : this.childNodes()){
            if (node.isType(NodeType.INSTRUCTION)) query.add((ElementNode)node);
        }
        return query.filter(select);
    }
}