package ca.sharcnet.nerve.context;
import ca.fa.jjjrmi.annotations.NativeJS;
import ca.fa.jjjrmi.annotations.SkipJS;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONObject;

@NativeJS(trans=true)
public class Context implements Serializable {
    private final String name;
    private final String schemaName;
    private final String scriptFilename;
    private final ArrayList<String> dictionaries = new ArrayList<>();
    private final ArrayList<String> styleList = new ArrayList<>();
    private final ArrayList<TagInfo> tagList = new ArrayList<>();

    @SkipJS
    public Context(JSONObject json) {
        this.name = json.getString("name");

        if (!json.has("schemaName")) this.schemaName = "";
        else this.schemaName = json.getString("schemaName");

        if (!json.has("scriptFile")) this.scriptFilename = "";
        else this.scriptFilename = json.getString("scriptFile");

        JSONArray jsonRFD = json.getJSONArray("readFromDictionary");
        for (int i = 0; i < jsonRFD.length(); i++) dictionaries.add(jsonRFD.getString(i));

        JSONArray jsonStyles = json.getJSONArray("styles");
        for (int i = 0; i < jsonStyles.length(); i++) styleList.add(jsonStyles.getString(i));

        JSONArray jsonTags = json.getJSONArray("tags");
        for (int i = 0; i < jsonTags.length(); i++) {
            tagList.add(new TagInfo(jsonTags.getJSONObject(i)));
        }
    }

    public boolean hasScriptFilename(){
        return (!scriptFilename.isEmpty());
    }

    public String getScriptFilename(){
        return scriptFilename;
    }

    public String getName() {
        return name;
    }

    public String getSchemaName() {
        return schemaName;
    }

    public List<String> readFromDictionary() {
        return dictionaries;
    }

    public List<String> styles() {
        return styleList;
    }

    public List<TagInfo> tags() {
        return tagList;
    }

    /*
    Return the tagInfo for the given tagname as it matches to any value in groups.
     */
    public TagInfo getTagInfo(String tagname, NameSource source) {
        for (TagInfo tagInfo : tagList) {
            if (tagInfo.getName(source).equals(tagname)) return tagInfo;
        }
        throw new NullPointerException();
    }

    /**
    Determine if a given tagname matches a taginfo rule.
    Omitting groups tests them all.
    @param tagname
    @param groups
    @return
     */
    public Boolean isTagName(String tagname, NameSource source) {
        for (TagInfo tagInfo : tagList) {
            if (tagInfo.getName(source).equals(tagname)) return true;
        }
        return false;
    }
}
