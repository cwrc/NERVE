package ca.sharcnet.nerve.docnav.schema;
import ca.sharcnet.nerve.docnav.dom.ElementNode;

public interface Schema {

    /**
    Return true if this element, with the child node, does not violate the schema.
    @param element
    @return
     */
    boolean isValid(ElementNode element, String childNodeName);

    /**
    Return true if this element does not violate the schema.
    @param element
    @return
     */
    boolean isValid(ElementNode element);
}
