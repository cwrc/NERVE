package ca.sharcnet.dh.scriber.context;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.JJJOptions;
import ca.frar.jjjrmi.annotations.JSPrequel;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.jjjrmi.translator.DataObject;
import java.util.HashMap;
import org.json.JSONObject;

@JJJ
@JJJOptions(retain=false)
@JSPrequel("const HashMap = require('jjjrmi').HashMap;")
public class TagInfo implements DataObject{
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

    @NativeJS
    public HashMap<String, String> defaults() {
        return new HashMap<>(this.defaults);
    }

    @NativeJS
    public boolean hasEncodeScript(){
        return (!this.encodeScript.isEmpty());
    }

    @NativeJS
    public boolean hasDecodeScript(){
        return (!this.decodeScript.isEmpty());
    }

    @NativeJS
    public String getEncodeScript(){
        return this.encodeScript;
    }

    @NativeJS
    public String getDecodeScript(){
        return this.decodeScript;
    }

    @NativeJS
    public String getDefault(String key) {
        return defaults.get(key);
    }

    @NativeJS
    public Boolean hasDefault(String key) {
        return defaults.containsKey(key);
    }

    @NativeJS
    public String getLemmaAttribute() {
        return lemmaAttribute;
    }

    @NativeJS
    public String getLinkAttribute() {
        return linkAttribute;
    }

    @NativeJS
    public String getIdAttribute() {
        return idAttribute;
    }

    @NativeJS
    public String getDialogMethod(){
        return dialogMethod;
    }

    @NativeJS
    public String getName(){
        return this.name;
    }

    @NativeJS
    public String getStandard() {
        return this.standard;
    }
}
