package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.JJJOptions;
import ca.frar.jjjrmi.annotations.JSPrequel;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.frar.utility.SQL.SQLRecord;
import java.util.HashMap;
import java.util.Set;

/**
Values set to NULL are explicitly unset, those set to "" are blank.  During copies all null should be ignored.
@author edward
*/


@JSPrequel("const HashMap = require ('jjjrmi').HashMap;")
@JJJ()
@JJJOptions(retain = false)
public final class EntityValues extends JJJObject{
    private HashMap<String, String> values = new HashMap<>();

    @NativeJS
    private EntityValues() {}

    public EntityValues(SQLRecord record) {
        this.text(record.getEntry("entity").getValue());
        this.lemma(record.getEntry("lemma").getValue());
        this.link(record.getEntry("link").getValue());
        this.tag(record.getEntry("tag").getValue());
    }

    @NativeJS("[Symbol.iterator]")
    public Set<String> keySet() {
        return this.values.keySet();
    }
    
    @NativeJS
    public EntityValues clone(){
        EntityValues entityValues = new EntityValues();
        for (String key : this.values.keySet()){
            entityValues.set(key, this.get(key));
        }
        return entityValues;
    }
    
    @NativeJS
    public EntityValues copyTo(Object dest){
        /*JS{
            if (this.text() !== null) dest.text(this.text());
            if (this.lemma() !== null) dest.lemma(this.lemma());
            if (this.link() !== null) dest.link(this.link());
            if (this.tag() !== null) dest.tag(this.tag());
        }*/
        return this;
    }

    @NativeJS
    public EntityValues values(EntityValues that){
        /*JS{
            if (typeof that === "undefined") return this;
        }*/
        this.text(that.text());
        this.lemma(that.lemma());
        this.link(that.link());
        this.tag(that.tag());
        return this;
    }
    
    public String text() {
        return this.values.get("text");
    }

    @NativeJS
    public EntityValues text(String value) {
        /*JS{
            if (typeof value === "undefined") return this.values.get("text");
        }*/
        this.values.put("text", value);
        return this;
    }

    public String lemma() {
        return this.values.get("lemma");
    }

    @NativeJS
    public EntityValues lemma(String value) {
        /*JS{
            if (typeof value === "undefined") return this.values.get("lemma");
        }*/
        this.values.put("lemma", value);
        return this;
    }

    public String link() {
        return this.values.get("link");
    }

    @NativeJS
    public EntityValues link(String value) {
        /*JS{
            if (typeof value === "undefined") return this.values.get("link");
        }*/
        this.values.put("link", value);
        return this;
    }

    public String tag() {
        return this.values.get("tag");
    }

    @NativeJS
    public EntityValues set(String key, String value){
        this.values.put(key, value);
        return this;
    }
    
    @NativeJS
    public String get(String key){
        return this.values.get(key);
    }    
    
    @NativeJS
    public boolean has(String key){
        return this.values.containsKey(key);
    }        
    
    @NativeJS
    public EntityValues tag(String value) {
        /*JS{
            if (typeof value === "undefined") return this.values.get("tag");
        }*/
        this.values.put("tag", value);
        return this;
    }
    
    @NativeJS
    public boolean hasText(){
        return this.values.containsKey("text");
    }
    
    @NativeJS
    public boolean hasLemma(){
        return this.values.containsKey("lemma");
    }

    @NativeJS
    public boolean hasLink(){
        return this.values.containsKey("link");
    }

    @NativeJS
    public boolean hasTag(){
        return this.values.containsKey("tag");
    }    
    
    public String toString(){
        int i = 0;
        StringBuilder builder = new StringBuilder();
        builder.append("{");
        for (String key : this.keySet()){
            if (i++ != 0) builder.append(", ");
            builder.append(key).append(":").append(this.values.get(key));            
        }
        builder.append("}");
        return builder.toString();
    }
}
