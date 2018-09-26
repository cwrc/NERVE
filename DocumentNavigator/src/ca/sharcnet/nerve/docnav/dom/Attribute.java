package ca.sharcnet.nerve.docnav.dom;

import ca.sharcnet.docnav.DocNavException;
import java.util.Objects;

/**
 * An immutable key-value pair user by {@link ElementNode}.  Two attributes are
 * considered equal if key1=key2.  Attributes are stored in an {@link ElementNode}
 * using the {@link AttributeList} collection.
 */
public final class Attribute {
    protected String key;
    protected String value;

    /**
    Copy constructor.
    @param that the attribute to copy from
    */
    public Attribute(Attribute that){
        this.key = that.getKey();
        this.setValue(that.getValue());
    }

    /**
    By-value constructor.
    @param key the key string, can not be empty or null
    @param value the value string, can not be null
    @throws NullPointerException if the key or value is null, or the key is empty.
    */
    public Attribute(String key, String value){
        if (key == null)   throw new DocNavException("attribute key is null");
        if (key.isEmpty()) throw new DocNavException("key is empty");
        if (value == null) throw new DocNavException("value for key " + key + " is null");

        this.setKey(key);
        this.setValue(value);
    }

    /**
    Retrieve the key.
    @return a non-null, non-empty string
    */
    public String getKey() {
        return key;
    }

    private void setKey(String key) {
        this.key = key;
    }

    private void setValue(String value) {
        String v = value;
//        v = v.replaceAll("&", "&amp;"); /* TODO catch ampersands */
        v = v.replaceAll("<", "&lt;");
//        v = v.replaceAll("\"", "\\\"");
        v = v.replaceAll("\"", "&quot;");
        this.value = v;
    }

    /**
    Retrieve the value.
    @return a non-null string
    */
    public String getValue() {
        String v = value;
        v = v.replaceAll("&lt;", "<");
        v = v.replaceAll("&quot;", "\"");
//        v = v.replaceAll("&amp;", "&");  /* TODO catch ampersands */
        return v;
    }

    public String getRawValue(){
        return value;
    }

    /**
    Create a string in valid xml syntax for the attribute.
    @return string represtation
    */
    @Override
    public String toString(){
        return getKey() + "=\"" + getValue() + "\"";
    }

    public String toRawString(){
        return getKey() + "=\"" + getRawValue() + "\"";
    }

    /**
    @return an integer hash of the key string, ignores the value string
    */
    @Override
    public int hashCode() {
        int hash = 5;
        hash = 59 * hash + Objects.hashCode(this.getKey());
        return hash;
    }

    /**
    Compare key strings, ignores the value strings.
    @param obj the object to compare to
    @return true if the key strings match
    */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null) return false;
        if (getClass() != obj.getClass()) return false;
        final Attribute other = (Attribute) obj;
        if (!Objects.equals(this.key, other.key)) return false;
        return true;
    }
}