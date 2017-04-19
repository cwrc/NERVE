package ca.sharcnet.nerve.context;

import ca.fa.utility.collections.SimpleCollection;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONObject;

public class Context implements Serializable {

    public enum NameType {
        TAGINFO, DICTIONARY, DIALOG, NERMAP
    };

    public final String name;
    public final String schemaName;
    private ArrayList<String> readFromDictionary = new ArrayList<>();
    private ArrayList<String> styles = new ArrayList<>();
    private HashMap<String, TagInfo> tags = new HashMap<>();

    public Context(JSONObject json) {
        this.name = json.getString("name");
        this.schemaName = json.getString("schemaName");

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

    public boolean hasTagInfo(String tagname, NameType... groups) {
        for (TagInfo tagInfo : tags.values()) {
            for (NameType t : groups) {
                switch(t){
                    case TAGINFO:
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

    public TagInfo getTagInfo(String tagname, NameType... groups) {
        for (TagInfo tagInfo : tags.values()) {
            for (NameType t : groups) {
                switch(t){
                    case TAGINFO:
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

    public Boolean isTagName(String tagname) {
        for (TagInfo tagInfo : tags.values()) {
            if (tagInfo.name.equals(tagname)) return true;
            if (tagInfo.dictionary.equals(tagname)) return true;
            if (tagInfo.dialog.equals(tagname)) return true;
            if (tagInfo.nerMap.equals(tagname)) return true;
        }
        return false;
    }

    public boolean isNERMap(String tagname) {
        for (TagInfo tagInfo : tags.values()) {
            if (tagInfo.nerMap.equals(tagname)) return true;
        }
        return false;
    }
}
