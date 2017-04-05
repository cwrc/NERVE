package ca.sharcnet.nerve.context;
import java.util.HashMap;
import org.json.JSONObject;

public class TagInfo {
    public final String name;
    public final String dictionary;
    public final String lemmaAttribute;
    public final String linkAttribute;
    public final String nerMap;
    public final String dialog;
    public final String idAttribute;
    private final HashMap<String, String> defaults = new HashMap<>();

    public TagInfo(JSONObject json){
        this.name = json.getString("name");
        this.dictionary = json.getString("dictionary");
        this.lemmaAttribute = json.getString("lemmaAttribute");
        this.linkAttribute = json.getString("linkAttribute");
        this.nerMap = json.getString("nerMap");
        this.dialog = json.getString("dialog");
        this.idAttribute = json.getString("idAttribute");

        JSONObject jsonDefaults = json.getJSONObject("defaults");
        for (String key : jsonDefaults.keySet()){
           String value = jsonDefaults.getString(key);
           defaults.put(key, value);
        }
    }

    public HashMap<String, String> defaults(){ return new HashMap<>(this.defaults); }
    public String getDefault(String key){ return defaults.get(key);}
    public Boolean hasDefault(String key){ return defaults.containsKey(key);}
}
