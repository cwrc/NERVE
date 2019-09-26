package ca.sharcnet.nerve.docnav.schema;
import ca.sharcnet.nerve.docnav.dom.Node;

public interface Schema {

    /**
    Return true if this element, with the child node, does not violate the schema.
    @param element
    @param childNodeName
    @return
     */
    boolean isValid(Node element, String childNodeName);

    /**
    Return true if this element does not violate the schema.
    @param element
    @return
     */
    boolean isValid(Node element);
}
