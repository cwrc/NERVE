package ca.sharcnet.nerve.context;
import ca.fa.jjjrmi.annotations.NativeJS;
import ca.fa.jjjrmi.annotations.SkipJS;
import static ca.sharcnet.nerve.context.NameSource.*;
import java.util.HashMap;
import org.json.JSONObject;

@NativeJS(trans=true)
public class TagInfo {
    private final String name;
    private final String dictionary;
    private final String nerMap;
    private final String dialog = "";
    private final String lemmaAttribute;
    private final String linkAttribute;
    private final String idAttribute;
    private final String decodeScript;
    private final String encodeScript;
    private final HashMap<String, String> defaults = new HashMap<>();
    private final String dialogMethod;

    @SkipJS
    public TagInfo(JSONObject json) {
        this.name = json.getString("name");
        this.dictionary = json.getString("dictionary");
        this.lemmaAttribute = json.getString("lemmaAttribute");
        this.linkAttribute = json.getString("linkAttribute");
        this.nerMap = json.getString("nerMap");
        this.idAttribute = json.getString("idAttribute");
        this.dialogMethod = json.getString("dialog-method");

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

    public boolean hasName(String name){
        if (getName(DICTIONARY).equals(name)) return true;
        if (getName(DIALOG).equals(name)) return true;
        if (getName(NERMAP).equals(name)) return true;
        if (getName(NAME).equals(name)) return true;
        return false;
    }

    public String getName(NameSource nameSource) {
        switch (nameSource) {
            case DICTIONARY:
                return this.dictionary;
            case DIALOG:
                return this.dialog;
            case NERMAP:
                return this.nerMap;
            case NAME:
            default:
                return this.name;
        }
    }
}
