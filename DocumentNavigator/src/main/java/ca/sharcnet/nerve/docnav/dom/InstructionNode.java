package ca.sharcnet.nerve.docnav.dom;

/**
The inner text of a meta data node does contain the braces.
@author edward
*/
public class InstructionNode extends Node{

    public InstructionNode(String name, AttributeList attributes){
        super(NodeType.INSTRUCTION, name, attributes);
    }

    public InstructionNode(String name){
        super(NodeType.INSTRUCTION, name);
    }

    @Override
    public NodeType getType(){
        return (NodeType) super.getType();
    }

    @Override
    public InstructionNode copy() {
        InstructionNode that = new InstructionNode(this.name(), this.attributes);
        for (Attribute attr : this.attributes){
            that.attr(attr.key, attr.value);
        }
        return that;
    }

    /**
    @return an xml compliant string.
     */
    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();

        builder.append("<").append("?").append(this.name());
        for (Attribute a : attributes) {
            builder.append(" ").append(a.toString());
        }
        builder.append("?").append(">");
        return builder.toString();
    }
}
