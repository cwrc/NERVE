package ca.sharcnet.nerve.docnav.dom;

/**
The inner text of a meta data node does contain the braces.
@author edward
*/
public class MetaDataNode extends AttributeNode{
    private String bracesType = "";

    /**
    By-value constructor.
    @param innerText
    */
    public MetaDataNode(String innerText){
        this(innerText, null);
    }

    MetaDataNode(String innerText, ElementNode parent){
        super(NodeType.METADATA, innerText, "@METADATA", parent);
        parse(innerText);
    }

    public MetaDataNode setName(String name) {
        if (name.startsWith("@")
            || name.contains(" ")) {
            throw new RuntimeException("Invalid node name");
        }
        super.name = name;
        return this;
    }

    private void parse(String innerText){
        bracesType = innerText.substring(1, 2);
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
        return new MetaDataNode(this.innerText(), newParent);
    }

    @Override
    public String toString(){
        return innerText();
    }
}
