package ca.sharcnet.nerve.scriber;

public class Constants {
    private Constants(){}

    // The default logger name.
    public final static String LOG_NAME = "NERScriber";
    
    // The name of the instruction node which will have the schema url.
    public final static String SCHEMA_NODE_NAME = "xml-model";

    // The name of the attribute in the schema instruction node which holds the chema url value.
    public final static String SCHEMA_NODE_ATTR = "href";
    
    // Maximum string match token count (# of words).
    public final static int MAX_MATCH_TOKENS = 5;
}
