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
    public final static String ORG_TAGNAME = "xmltagname";

    /**
    The HTML attribute whose value is the XML attributes as a JSON object.
    */
    public final static String XML_ATTR_LIST = "xmlattrs";

    /**
    The HTML class for non entity, non prolog elements.
    */
    public final static String HTML_NONENTITY = "xmltag";

    /**
    The HTML class for XML instruction elements.
    */
    public final static String HTML_PROLOG = "xmlprolog";

    /**
    The HTML class for XML doctype elements.
    */
    public final static String HTML_DOCTYPE = "xmldoctype";

    /**
    The HTML class for XML tagged entity elements.
    */
    public final static String HTML_ENTITY = "taggedentity";

    /**
    The innertext value of XML doctype elements.
    */
    public final static String DOCTYPE_INNERTEXT = "xmlinnertext";

    /**
    The name of the html attribute which contains the context name.
    */
    public final static String CONTEXT_ATTRIBUTE = "data-context";

    /*
    The name of the instruction node which will have the schema url.
    */
    public final static String SCHEMA_NODE_NAME = "xml-model";

    /*
    The name of the attribue in the schema instruction node which holds the chema url value.
    */
    public final static String SCHEMA_NODE_ATTR = "href";

    /*
    The name of the instruction node which will have the schema url.
    */
    public final static String CONTEXT_NODE_NAME = "context";

    /*
    The name of the attribue in the schema instruction node which holds the chema url value.
    */
    public final static String CONTEXT_NODE_ATTR = "name";
}
