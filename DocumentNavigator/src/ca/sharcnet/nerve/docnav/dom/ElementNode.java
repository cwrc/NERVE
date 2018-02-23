package ca.sharcnet.nerve.docnav.dom;


/**
 * A node that may have a parent, attributes, and/or children.
 * @author Ed Armstrong
 */
public class ElementNode extends Node{

    /**
     * Create a new ElementNode, copy all attributes as copies, and copy all children as copies.
     * @param type
     * @param name
     * @param attributes
     * @param children
     */
    public ElementNode(String name, AttributeList attributes, NodeList children) {
        super(NodeType.ELEMENT, name, attributes, children);
    }

    /**
    * Create an new ElementNode with 'name' as the node name.
    @param name
    */
    public ElementNode(String name) {
        super(NodeType.ELEMENT, name);
    }

    /**
     * Create an new ElementNode with 'name' as the node name, and 'text' as the contents.
     *@param name
     * @param text
    */
    public ElementNode(String name, String text) {
        super(NodeType.ELEMENT, name);
        this.addChild(new TextNode(text));
    }

    /**
    Create a copy of this element node with all attributes and decendent nodes also as copies.
    @return
    */
    @Override
    public ElementNode copy(){
        return new ElementNode(this.name(), this.attributes, this.childNodes());
    }
}