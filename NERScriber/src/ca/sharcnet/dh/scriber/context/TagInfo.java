package ca.sharcnet.dh.scriber.context;
import java.util.HashMap;
import org.json.JSONObject;

public class TagInfo {
    private final String name;
    private final String standard;
    private final String lemmaAttribute;
    private final String linkAttribute;
    private final String idAttribute;
    private final String decodeScript;
    private final String encodeScript;
    private final HashMap<String, String> defaults = new HashMap<>();
    private final String dialogMethod;

    public TagInfo(String standard, JSONObject json) {
        this.name = json.getString("name");
        this.lemmaAttribute = json.getString("lemmaAttribute");
        this.linkAttribute = json.getString("linkAttribute");
        this.idAttribute = json.getString("idAttribute");
        this.standard = standard;
        
        if (json.has("dialog-method")) this.dialogMethod = json.getString("dialog-method");
        else this.dialogMethod = "";
        if (json.has("decode")) this.decodeScript = json.getString("decode");
        else this.decodeScript = "";
        if (json.has("encode")) this.encodeScript = json.getString("encode");
        else this.encodeScript = "";
        
        JSONObject jsonDefaults = json.getJSONObject("defaults");
        for (String key : jsonDefaults.keySet()) {
            String value = jsonDefaults.getString(key);
            defaults.put(key, value);
        }
    }

    
    public HashMap<String, String> defaults() {
        return new HashMap<>(this.defaults);
    }

    
    public boolean hasEncodeScript(){
        return (!this.encodeScript.isEmpty());
    }

    
    public boolean hasDecodeScript(){
        return (!this.decodeScript.isEmpty());
    }

    
    public String getEncodeScript(){
        return this.encodeScript;
    }

    
    public String getDecodeScript(){
        return this.decodeScript;
    }

    
    public String getDefault(String key) {
        return defaults.get(key);
    }

    
    public Boolean hasDefault(String key) {
        return defaults.containsKey(key);
    }

    
    public String getLemmaAttribute() {
        return lemmaAttribute;
    }

    
    public String getLinkAttribute() {
        return linkAttribute;
    }

    
    public String getIdAttribute() {
        return idAttribute;
    }

    
    public String getDialogMethod(){
        return dialogMethod;
    }

    
    public String getName(){
        return this.name;
    }

    
    public String getStandard() {
        return this.standard;
    }
}
