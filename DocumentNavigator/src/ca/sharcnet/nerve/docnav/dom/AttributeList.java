package ca.sharcnet.nerve.docnav.dom;
import java.util.ArrayList;
import java.util.Collection;

/**
A container for attributes that is used by {@link ElementNode}.  Only attributes
with a unique key are added to the attribute list.  Because attributes are immutable
the attribute is added without copying it first.
@author edward
*/
public class AttributeList extends ArrayList<Attribute>{

    public AttributeList(){
        super();
    }

    /**
    Constructs an attribute list containing the elements of the specified collection,
    in the order they are returned by the collection's iterator. Only unique
    key values are added.
    @param that the list to copy from
    */
    public AttributeList(Collection<Attribute> that){        
        that.forEach((a) -> {
            this.add(new Attribute(a));
        });
    }

    /**
    Retrieves an attribute based on it's key value.
    @param key the key value to retrieve by, can not be null or empty.
    @return a non-null attribute
    @throws IndexOutOfBoundsException if the key doesn't exist.
    @throws NullPointerException if the key is null or empty.
    */
    public Attribute get(String key){
        if (key == null || key.isEmpty()) throw new NullPointerException();

        for (Attribute a : this){
            if (a.getKey().equals(key)){
                return a;
            }
        }
        throw new IndexOutOfBoundsException("Key " + key + " is not a member of this collection.");
    }

    /**
    Remove an attribute based on it's key value.
    @param key the key value to retrieve by, can not be null or empty.
    @return the attribute removed
    @throws IndexOutOfBoundsException if the key doesn't exist.
    @throws NullPointerException if the key is null or empty.
    */
    public Attribute remove(String key){
        if (key == null || key.isEmpty()) throw new NullPointerException();
        for (Attribute a : this){
            if (a.getKey().equals(key)){
                super.remove(a);
                return a;
            }
        }
        throw new IndexOutOfBoundsException("Key " + key + " is not a member of this collection.");
    }

    /**
    Determine if an attribute exists in this collection matching the given key.
    @param key the key value to retrieve by, can not be null or empty.
    @return true if a match for 'key' is found, otherwise false.
    @throws NullPointerException if the key is null or empty.
    */
    public boolean contains(String key){
        if (key == null || key.isEmpty()) throw new NullPointerException();
        for (Attribute a : this){
            if (a.getKey().equals(key)){
                return true;
            }
        }
        return false;
    }

    /**
    Add a new attribute to this collection.  If the collection already contains
    the new attribute replaces the old attribute.
    @param attribute a non-null {@link Attribute} object
    @return always returns true
    @throws NullPointerException if the attribute is null.
    */
    @Override
    public boolean add(Attribute attribute){
        if (attribute == null) throw new NullPointerException();
        if (this.contains(attribute)) remove(attribute);
        super.add(attribute);
        return true;
    }
}
