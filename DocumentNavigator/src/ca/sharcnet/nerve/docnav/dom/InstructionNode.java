package ca.sharcnet.nerve.docnav.dom;

/**
The inner text of a meta data node does contain the braces.
@author edward
*/
public class InstructionNode extends Node{
    /**
    By-value constructor.
    @param innerText
    */
    public InstructionNode(String innerText){
        this();
        parse(innerText);
    }

    public InstructionNode(){
        super(NodeType.INSTRUCTION, "@METADATA");
    }

    @Override
    public NodeType getType(){
        return (NodeType) super.getType();
    }

    @Override
    public InstructionNode copy() {
        InstructionNode that = new InstructionNode();
        for (Attribute attr : this.attributes){
            that.addAttribute(attr.key, attr.value);
        }
        return that;
    }

    private void parse(String innerText){
        innerText = innerText.substring(2, innerText.length() - 2);
        String[] tokens = innerText.split(" ");
        this.setName(tokens[0]);

        for (int i = 1; i < tokens.length; i++){
            String s = tokens[i];
            String[] a = s.split("=");
            if (a.length == 1){
                this.attributes.add(new Attribute(a[0], ""));
            } else {
                String value = a[1].substring(1, a[1].length() - 1);
                this.attributes.add(new Attribute(a[0], value));
            }
        }
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
