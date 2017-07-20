package ca.sharcnet.nerve.docnav.dom;

/**
The inner text of a meta data node does contain the braces.
@author edward
*/
public class InstructionNode extends Node{

    public InstructionNode(String name, AttributeList attributes){
        super(NodeType.INSTRUCTION, name, attributes);
    }

    @Override
    public NodeType getType(){
        return (NodeType) super.getType();
    }

    @Override
    public InstructionNode copy() {
        InstructionNode that = new InstructionNode(this.getName(), this.attributes);
        for (Attribute attr : this.attributes){
            that.addAttribute(attr.key, attr.value);
        }
        return that;
    }

    /**
    @return an xml compliant string.
     */
    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();

        builder.append("<").append("?").append(this.getName());
        for (Attribute a : attributes) {
            builder.append(" ").append(a.toString());
        }
        builder.append("?").append(">");
        return builder.toString();
    }
}
