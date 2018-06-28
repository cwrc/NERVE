package ca.sharcnet.nerve.context;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.JJJOptions;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.jjjrmi.translator.DataObject;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONObject;

@JJJ
@JJJOptions(retain=false)
public class Context implements Serializable, DataObject {
    private final String name;
    private final String schemaName;
    private final String scriptFilename;
    private final String tagSourceAttribute;
    private final ArrayList<String> dictionaries = new ArrayList<>();
    private final ArrayList<String> styleList = new ArrayList<>();
    private final ArrayList<TagInfo> tagList = new ArrayList<>();

    public Context(JSONObject json) {
        this.name = json.getString("name");

        if (!json.has("schemaName")) this.schemaName = "";
        else this.schemaName = json.getString("schemaName");

        if (!json.has("scriptFile")) this.scriptFilename = "";
        else this.scriptFilename = json.getString("scriptFile");

        if (!json.has("tagSourceAttribute")) this.tagSourceAttribute = "";
        else this.tagSourceAttribute = json.getString("tagSourceAttribute");
        
        JSONArray jsonRFD = json.getJSONArray("readFromDictionary");
        for (int i = 0; i < jsonRFD.length(); i++) dictionaries.add(jsonRFD.getString(i));

        JSONArray jsonStyles = json.getJSONArray("styles");
        for (int i = 0; i < jsonStyles.length(); i++) styleList.add(jsonStyles.getString(i));

        JSONArray jsonTags = json.getJSONArray("tags");
        for (int i = 0; i < jsonTags.length(); i++) {
            tagList.add(new TagInfo(jsonTags.getJSONObject(i)));
        }
    }

    @NativeJS
    public boolean hasTagSourceAttribute(){
        return (!tagSourceAttribute.isEmpty());
    }

    @NativeJS
    public String getTagSourceAttribute(){
        return tagSourceAttribute;
    }    
    
    @NativeJS
    public boolean hasScriptFilename(){
        return (!scriptFilename.isEmpty());
    }

    @NativeJS
    public String getScriptFilename(){
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
    public List<String> readFromDictionary() {
        return dictionaries;
    }

    @NativeJS
    public List<String> styles() {
        return styleList;
    }

    @NativeJS
    public List<TagInfo> tags() {
        return tagList;
    }

    /*
    Return the tagInfo for the given tagname as it matches to any value in groups.
     */
    @NativeJS
    public TagInfo getTagInfo(String tagname, NameSource source) {
        for (TagInfo tagInfo : tagList) {
            if (tagInfo.getName(source).equals(tagname)) return tagInfo;
        }
        throw new ContextException("in context '" + this.getName() + "' tag name '" + tagname + "' of source '" + source.name() + "' not found.");
    }

    /**
    Determine if a given tagname matches a taginfo rule.
    Omitting groups tests them all.
    @param tagname
    @param groups
    @return
     */
    @NativeJS
    public Boolean isTagName(String tagname, NameSource source) {       
        for (TagInfo tagInfo : tagList) {
            if (tagInfo.getName(source).equals(tagname)) return true;
        }
        return false;
    }
}
