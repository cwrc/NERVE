package ca.sharcnet.nerve.scriber.schema;
import org.w3c.dom.Node;

public interface Schema {

    /**
    * If the child node were appended to 'element' return true if this would not
    * violate the schema.
    * @param element
    * @param childNodeName
    * @return
    */
    boolean isValid(Node element, String childNodeName);

    /**
    Return true if this element does not violate the schema.
    @param element
    @return
     */
    boolean isValid(Node element);
}
