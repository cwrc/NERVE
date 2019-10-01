package ca.sharcnet.nerve.scriber.schema;
import org.w3c.dom.Node;

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
