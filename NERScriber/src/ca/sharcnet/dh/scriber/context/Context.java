package ca.sharcnet.dh.scriber.context;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.frar.jjjrmi.translator.DataObject;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;

public class Context extends JJJObject implements Serializable, DataObject {
    private String name;
    private String schemaName = "";
    private String scriptFilename;
    private String tagSourceAttribute;
    private String style = "";
    private String sourceString = "";
    private ArrayList<TagInfo> tagList = new ArrayList<>();
    private final JSONObject json;

    public Context(String jsonString) {
        this.sourceString = jsonString;
        JSONTokener jst = new JSONTokener(jsonString);
        this.json = new JSONObject(jst);
        this.name = json.getString("name");

        if (!json.has("schemaName")) this.schemaName = "";
        else this.schemaName = json.getString("schemaName");

        if (!json.has("scriptFile")) this.scriptFilename = "";
        else this.scriptFilename = json.getString("scriptFile");

        if (!json.has("tagSourceAttribute")) this.tagSourceAttribute = "";
        else this.tagSourceAttribute = json.getString("tagSourceAttribute");

        if (!json.has("style")) this.style = "";
        else this.style = json.getString("style");

        JSONObject jsonTags = json.getJSONObject("tags");
        for (String key : jsonTags.keySet()){
            JSONObject tagInfoJSON = jsonTags.getJSONObject(key);
            tagList.add(new TagInfo(key, tagInfoJSON));
        }
    }

    public String getSourceString(){
        return this.sourceString;
    }
    
    @NativeJS
    public boolean hasTagSourceAttribute() {
        return (!tagSourceAttribute.isEmpty());
    }

    @NativeJS
    public String getTagSourceAttribute() {
        return tagSourceAttribute;
    }

    @NativeJS
    public boolean hasScriptFilename() {
        return (!scriptFilename.isEmpty());
    }

    @NativeJS
    public String getScriptFilename() {
        return scriptFilename;
    }

    @NativeJS
    public String getName() {
        return name;
    }

    @NativeJS
    public String getSchemaName() {
        return schemaName;
    }

    @NativeJS
    public String getStyle() {
        return style;
    }

    @NativeJS
    public List<TagInfo> tags() {
        return tagList;
    }

    /*
    Return the tagInfo for the matching 'standard' tag name.
     */
    @NativeJS
    public TagInfo getTagInfo(String standardTagName) {
        for (TagInfo tagInfo : tagList) {
            if (tagInfo.getStandard().equals(standardTagName)) return tagInfo;
        }
        throw new ContextException("in context '" + this.getName() + "' standard tag name '" + standardTagName + "' not found.");
    }

    @NativeJS
    public String getStandardTag(String schemaTagName) {
        for (TagInfo tagInfo : tagList) {
            if (tagInfo.getName().equals(schemaTagName)) return tagInfo.getStandard();
        }
        throw new ContextException("in context '" + this.getName() + "' schema tag name '" + schemaTagName + "' not found.");
    }

    @NativeJS
    public boolean isTagName(String schemaTagName) {
        for (TagInfo tagInfo : tagList) {
            if (tagInfo.getName().equals(schemaTagName)) return true;
        }
        return false;
    }
    
    @NativeJS
    public boolean isStandardTag(String schemaTagName) {
        for (TagInfo tagInfo : tagList) {
            if (tagInfo.getStandard().equals(schemaTagName)) return true;
        }
        return false;
    }    
    
    public List<String>getDictionaries(){
        ArrayList<String> rvalue = new ArrayList<>();
        
        if (!this.json.has("dictionaries")) return rvalue;
        JSONArray jsonArray = this.json.getJSONArray("dictionaries");
        for (int i = 0; i < jsonArray.length(); i++){
            rvalue.add(jsonArray.getString(i));
        }
        return rvalue;
    }
}
