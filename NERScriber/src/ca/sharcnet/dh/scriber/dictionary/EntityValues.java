package ca.sharcnet.dh.scriber.dictionary;
import ca.sharcnet.dh.sql.*;
import java.util.HashMap;
import java.util.Set;
import org.json.JSONObject;

/**
Values set to NULL are explicitly unset, those set to "" are blank.  During copies all null should be ignored.
@author edward
*/


public final class EntityValues {
    private HashMap<String, String> values = new HashMap<>();

    private EntityValues() {}

    public EntityValues(SQLRecord record) {
        this.text(record.getEntry("entity").getValue());
        this.lemma(record.getEntry("lemma").getValue());
        this.link(record.getEntry("link").getValue());
        this.tag(record.getEntry("tag").getValue());
        this.source(record.getEntry("source").getValue());
    }
    
    public EntityValues(JSONObject json){
        if (json.has("entity")) this.text(json.getString("entity"));
        if (json.has("lemma")) this.lemma(json.getString("lemma"));
        if (json.has("link")) this.link(json.getString("link"));
        if (json.has("tag")) this.tag(json.getString("tag"));
        if (json.has("source")) this.source(json.getString("source"));
    }
    
    public JSONObject toJSONObject(){
        JSONObject json = new JSONObject();
        if (this.hasText()) json.put("entity", this.text());
        if (this.hasLemma()) json.put("lemma", this.lemma());
        if (this.hasLink()) json.put("link", this.link());
        if (this.hasTag()) json.put("tag", this.tag());
        if (this.hasSource()) json.put("source", this.source());
        return json;
    }
    
    public Set<String> keySet() {
        return this.values.keySet();
    }
    
    public EntityValues clone(){
        EntityValues entityValues = new EntityValues();
        for (String key : this.values.keySet()){
            entityValues.set(key, this.get(key));
        }
        return entityValues;
    }
    

    public EntityValues values(EntityValues that){
        this.text(that.text());
        this.lemma(that.lemma());
        this.link(that.link());
        this.tag(that.tag());
        this.source(that.source());
        return this;
    }
    
    public String text() {
        return this.values.get("text");
    }

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

    public EntityValues link(String value) {
        /*JS{
            if (typeof value === "undefined") return this.values.get("link");
        }*/
        this.values.put("link", value);
        return this;
    }

    public String source() {
        return this.values.get("source");
    }

    public EntityValues source(String value) {
        /*JS{
            if (typeof value === "undefined") return this.values.get("source");
        }*/
        this.values.put("source", value);
        return this;
    }    
    
    public String tag() {
        return this.values.get("tag");
    }

    public EntityValues set(String key, String value){
        this.values.put(key, value);
        return this;
    }
    
    public String get(String key){
        return this.values.get(key);
    }    
    
    
    public boolean has(String key){
        return this.values.containsKey(key);
    }        
    
    
    public EntityValues tag(String value) {
        /*JS{
            if (typeof value === "undefined") return this.values.get("tag");
        }*/
        this.values.put("tag", value);
        return this;
    }
    
    
    public boolean hasText(){
        return this.values.containsKey("text");
    }
    
    
    public boolean hasLemma(){
        return this.values.containsKey("lemma");
    }

    
    public boolean hasLink(){
        return this.values.containsKey("link");
    }

    
    public boolean hasTag(){
        return this.values.containsKey("tag");
    }    
    
    
    public boolean hasSource(){
        return this.values.containsKey("source");
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
