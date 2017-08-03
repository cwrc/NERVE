package ca.sharcnet.nerve.context;
import static ca.sharcnet.nerve.context.Context.NameSource.*;
import ca.sharcnet.utility.Console;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONObject;

public class Context implements Serializable {

    public enum NameSource {
        NAME, DICTIONARY, DIALOG, NERMAP
    };

    private final String name;
    private final String schemaName;
    private ArrayList<String> readFromDictionary = new ArrayList<>();
    private ArrayList<String> styles = new ArrayList<>();
    private HashMap<String, TagInfo> tags = new HashMap<>();

    public Context(JSONObject json) {
        this.name = json.getString("name");

        if (!json.has("schemaName")) this.schemaName = "";
        else this.schemaName = json.getString("schemaName");

        JSONArray jsonRFD = json.getJSONArray("readFromDictionary");
        for (int i = 0; i < jsonRFD.length(); i++) readFromDictionary.add(jsonRFD.getString(i));

        JSONArray jsonStyles = json.getJSONArray("styles");
        for (int i = 0; i < jsonStyles.length(); i++) styles.add(jsonStyles.getString(i));

        JSONArray jsonTags = json.getJSONArray("tags");
        for (int i = 0; i < jsonTags.length(); i++) {
            TagInfo tagInfo = new TagInfo(jsonTags.getJSONObject(i));
            tags.put(tagInfo.name, tagInfo);
        }
    }

    public String getName() {
        return name;
    }

    public String getSchemaName() {
        return schemaName;
    }

    public List<String> readFromDictionary() {
        return new ArrayList<>(readFromDictionary);
    }

    public List<String> styles() {
        return new ArrayList<>(styles);
    }

    public Map<String, TagInfo> tags() {
        return new HashMap<>(tags);
    }

    /**
    Return true if this context has a taginfo element with the name 'tagname'.
     */
    public boolean hasTagInfo(String tagname) {
        for (TagInfo tagInfo : tags.values()) {
            if (tagInfo.name.equals(tagname)) return true;
        }
        return false;
    }

    public boolean hasTagInfo(String tagname, NameSource... validSources) {
        for (TagInfo tagInfo : tags.values()) {
            for (NameSource t : validSources) {
                switch(t){
                    case NAME:
                        if (tagInfo.name.equals(tagname)) return true;
                        break;
                    case DICTIONARY:
                        if (tagInfo.dictionary.equals(tagname)) return true;
                        break;
                    case DIALOG:
                        if (tagInfo.dialog.equals(tagname)) return true;
                        break;
                    case NERMAP:
                        if (tagInfo.nerMap.equals(tagname)) return true;
                        break;
                }
            }
        }
        return false;
    }

    /*
    Return the tagInfo for the given tagname as it matches to any value in groups.
    */
    public TagInfo getTagInfo(String tagname, NameSource... groups) {
        for (TagInfo tagInfo : tags.values()) {
            Console.log(tagInfo);
            for (NameSource t : groups) {
                switch(t){
                    case NAME:
                        if (tagInfo.name.equals(tagname)) return tagInfo;
                        break;
                    case DICTIONARY:
                        if (tagInfo.dictionary.equals(tagname)) return tagInfo;
                        break;
                    case DIALOG:
                        if (tagInfo.dialog.equals(tagname)) return tagInfo;
                        break;
                    case NERMAP:
                        if (tagInfo.nerMap.equals(tagname)) return tagInfo;
                        break;
                }
            }
        }
        return null;
    }

    /**
    Determine if a given tagname matches a taginfo rule.
    Omitting groups tests them all.
    @param tagname
    @param groups
    @return
    */
    public Boolean isTagName(String tagname, NameSource ... groups) {
        if (groups.length == 0) groups = NameSource.values();
        List<NameSource> asList = Arrays.asList(groups);

        for (TagInfo tagInfo : tags.values()) {
            if (asList.contains(NAME) && tagInfo.name.equals(tagname)) return true;
            if (asList.contains(DICTIONARY) && tagInfo.dictionary.equals(tagname)) return true;
            if (asList.contains(DIALOG) && tagInfo.dialog.equals(tagname)) return true;
            if (asList.contains(NERMAP) && tagInfo.nerMap.equals(tagname)) return true;
        }
        return false;
    }

    @Deprecated
    public TagInfo getTagInfo(String tagname) {
        for (TagInfo tagInfo : tags.values()) {
            if (tagInfo.name.equals(tagname)) return tagInfo;
            if (tagInfo.dictionary.equals(tagname)) return tagInfo;
            if (tagInfo.dialog.equals(tagname)) return tagInfo;
            if (tagInfo.nerMap.equals(tagname)) return tagInfo;
        }
        return null;
    }

    public boolean isNERMap(String tagname) {
        for (TagInfo tagInfo : tags.values()) {
            if (tagInfo.nerMap.equals(tagname)) return true;
        }
        return false;
    }
}
