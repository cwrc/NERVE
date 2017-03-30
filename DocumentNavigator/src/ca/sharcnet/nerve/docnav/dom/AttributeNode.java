package ca.sharcnet.nerve.docnav.dom;

public abstract class AttributeNode extends Node  {
    final AttributeList attributes;

    AttributeNode(NodeType type, String innerText, String name, ElementNode parent){
        super(type, innerText, name, parent);
        this.attributes = new AttributeList();        
    }
    
    AttributeNode(NodeType type, String name, AttributeList attributes, ElementNode parent){
        super(type, "", name, parent);
        this.attributes = new AttributeList();
        
        if (attributes != null) {
            for (Attribute a : attributes) this.addAttribute(a);
        }
    }
    

    /**
     * @return a non-reflective list of this node's attributes
     */
    public AttributeList getAttributes() {
        AttributeList arrayList = new AttributeList();
        for (Attribute a : attributes) arrayList.add(a);
        return arrayList;
    }    
    
    public void clearAttributes() {
        this.attributes.clear();
    }    
    
    /**
    Determine if this node contains an attribute.
    @param key the attribute name to poll for
     */
    public final boolean hasAttribute(String key) {
        assert attributes != null;
        return attributes.contains(key);
    }

    /**
    Retrieve and attribute from this node.
    @param key the attribute name to retreive
    @return the attribute to which the specified key is mapped
    @throws IndexOutOfBoundsException if this node does not have an attribute with 'key'
     */
    public final Attribute getAttribute(String key) {
        if (!attributes.contains(key)) throw new IndexOutOfBoundsException();
        return attributes.get(key);
    }

    /**
    Retrive the attribute value from the node, if the node doesn't have the
    given attribute, return an empty string.
    @param key the attribute name to retreive
    @return the value to which the specified key is mapped, if not mapped => "".
     */
    public final String getAttributeValue(String key) {
        if (!attributes.contains(key)) return "";
        return attributes.get(key).getValue();
    }

    /**
    Add an attribute to this node.  The attribute passed in is copied before
    being added.
    @param attribute the attribute to add
     */
    public final void addAttribute(Attribute attribute) {
        attributes.add(new Attribute(attribute));
    }

    /**
    Add a new attribute to this node with provided key/value pair;
    @param key
    @param value
     */
    public final void addAttribute(String key, String value) {
        attributes.add(new Attribute(key, value));
    }

    /**
     * Will remove any attribute with the 'key' value if it exists, otherwise
     * no action is taken.
     * @param key the key string of the attribute to remove
     */
    public void removeAttribute(String key) {
        if (!attributes.contains(key)) return;
        this.attributes.remove(key);
    }    
}
