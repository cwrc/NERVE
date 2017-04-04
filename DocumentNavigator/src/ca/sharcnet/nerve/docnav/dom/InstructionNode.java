package ca.sharcnet.nerve.docnav.dom;

/**
The inner text of a meta data node does contain the braces.
@author edward
*/
public class InstructionNode extends AttributeNode{
    /**
    By-value constructor.
    @param innerText
    */
    public InstructionNode(String innerText){
        this(innerText, null);
        parse(innerText);
    }

    public InstructionNode(){
        this("", null);
    }

    InstructionNode(String innerText, ElementNode parent){
        super(NodeType.INSTRUCTION, innerText, "@METADATA", parent);
        parse(innerText);
    }

    public InstructionNode setName(String name) {
        if (name.startsWith("@")
            || name.contains(" ")) {
            throw new RuntimeException("Invalid node name");
        }
        super.name = name;
        return this;
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

    @Override
    Node copy(ElementNode newParent){
        return new InstructionNode(this.innerText(), newParent);
    }

    /**
    @return an xml compliant string.
     */
    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();

        builder.append("<").append("?").append(" ").append(this.getName());
        for (Attribute a : attributes) {
            builder.append(" ").append(a.toString());
        }
        builder.append(" ").append("?").append(">");
        return builder.toString();
    }
}
