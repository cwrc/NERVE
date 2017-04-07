package ca.sharcnet.nerve;

public class Constants {
    private Constants(){}

    /**
    The name of the HTML dom element.
    */
    public final static String HTML_TAGNAME = "div";

    /**
    The HTML attribute that contains the XML tag name.
    */
    public final static String ORIGINAL_TAGNAME_ATTR = "xmltagname";

    /**
    The HTML attribute whose value is the XML attributes as a JSON object.
    */
    public final static String XML_ATTR_LIST = "xmlattrs";

    /**
    The HTML class for non entity, non prolog elements.
    */
    public final static String HTML_NONENTITY_CLASSNAME = "xmltag";

    /**
    The HTML class for XML instruction elements.
    */
    public final static String HTML_PROLOG_CLASSNAME = "xmlprolog";

    /**
    The HTML class for XML doctype elements.
    */
    public final static String HTML_DOCTYPE_CLASSNAME = "xmldoctype";

    /**
    The HTML class for XML tagged entity elements.
    */
    public final static String HTML_ENTITY_CLASSNAME = "taggedentity";

    /**
    The innertext value of XML doctype elements.
    */
    public final static String DOCTYPE_INNERTEXT = "xmlinnertext";

    /**
    The name of the context attribute which contains the context name.
    */
    public final static String CONTEXT_ATTRIBUTE = "data-context";
}
