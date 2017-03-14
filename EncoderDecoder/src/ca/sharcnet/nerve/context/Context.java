package ca.sharcnet.nerve.context;
import ca.fa.utility.collections.SimpleCollection;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import org.json.JSONArray;
import org.json.JSONObject;

public class Context implements Serializable {
    private static final long serialVersionUID = 1L;
    private final SimpleCollection<TagInfo> tags = new SimpleCollection<>();
    private final SimpleCollection<String> excludedTags = new SimpleCollection<>();
    private final HashMap<String, String> nerMap = new HashMap<>();
    private String name;
    private String tagPrefix = "";
    private String attrPrefix = "";
    private String linkAttribute = "";
    private String idAttribute = "";
    private String lemmaAttribute = "";
    private final HtmlLabels htmlLabels;
    private String schema = "";
    private final JSONObject json;
    private String writeToDictionary;
    private ArrayList<String> readFromDictionary = new ArrayList<>();
    private String dictionaryAttribute = "data-dictionary";

    public Context(JSONObject json) {
        this.json = json;
        this.name = json.getString("name");
        this.linkAttribute = json.optString("linkAttribute", "");
        this.idAttribute = json.optString("idAttribute", "");
        this.lemmaAttribute = json.optString("lemmaAttribute", "");

        if (json.has("dictionaryAttribute")) {
            this.dictionaryAttribute = json.getString("dictionaryAttribute");
        }

        if (json.has("tagNameRules")) {
            JSONObject tagNameRules = json.getJSONObject("tagNameRules");
            if (tagNameRules.has("prefix")) {
                this.tagPrefix = tagNameRules.getString("prefix");
            }
            if (tagNameRules.has("attribute")) {
                this.attrPrefix = tagNameRules.getString("attribute");
            }
        }

        if (json.has("tags")) {
            JSONArray tagArray = json.getJSONArray("tags");
            for (int i = 0; i < tagArray.length(); i++) {
                TagInfo tagInfo = new TagInfo(tagArray.getJSONObject(i), this.linkAttribute, this.idAttribute, this.lemmaAttribute);
                tags.add(tagInfo);
            }
        }

        if (json.has("excludedTags")) {
            JSONArray exclArray = json.getJSONArray("excludedTags");
            for (int i = 0; i < exclArray.length(); i++) {
                String exclTag = exclArray.getString(i);
                excludedTags.add(exclTag);
            }
        }

        if (json.has("nerMap")) {
            JSONObject jsonNerMap = json.getJSONObject("nerMap");
            for (String key : jsonNerMap.keySet()) {
                nerMap.put(key, jsonNerMap.getString(key));
            }
        }

        if (json.has("schema")) {
            this.schema = json.getString("schema");
        }

        if (json.has("writeToDictionary")) {
            this.writeToDictionary = json.getString("writeToDictionary");
        }

        if (json.has("readFromDictionary")) {
            JSONArray rfdArray = json.getJSONArray("readFromDictionary");
            for (int i = 0; i < rfdArray.length(); i++) {
                this.readFromDictionary.add(rfdArray.getString(i));
            }
        }

        htmlLabels = new HtmlLabels(json);
    }

    public Iterable<TagInfo> tags(){
        return this.tags;
    }

    public String getDictionaryAttribute(){
        return dictionaryAttribute;
    }

    public String getWriteToDictionary() {
        return writeToDictionary;
    }

    public String translateNERToken(String key) {
        return nerMap.get(key);
    }

    public HtmlLabels htmlLables() {
        return this.htmlLabels;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSchema() {
        return this.schema;
    }

    /* deprectated chair or statements from the three methods below */
    @Deprecated
    public boolean isRecognizedTagName(String tagName) {
        for (TagInfo tagInfo : this.tags){
            if (tagInfo.isName(tagName) || tagInfo.isNerMap(tagName) || tagInfo.isDictionaryMap(tagName)){
                return true;
            }
        }
        return false;
    }

    public boolean isTagName(String tagName) {
        for (TagInfo tagInfo : this.tags){
            if (tagInfo.isName(tagName)){
                return true;
            }
        }
        return false;
    }

    public boolean isNERMapTagName(String tagName) {
        for (TagInfo tagInfo : this.tags){
            if (tagInfo.isNerMap(tagName)){
                return true;
            }
        }
        return false;
    }

    public boolean isDictionaryTagName(String tagName) {
        for (TagInfo tagInfo : this.tags){
            if (tagInfo.isDictionaryMap(tagName)){
                return true;
            }
        }
        return false;
    }

    public TagInfo getTagInfo(String tagName) {
        for (TagInfo tagInfo : this.tags){
            if (tagInfo.isName(tagName) || tagInfo.isNerMap(tagName) || tagInfo.isDictionaryMap(tagName)){
                return tagInfo;
            }
        }
        throw new NullPointerException();
    }

    public String getTagPrefix() {
        return tagPrefix;
    }

    public String getAttrPrefix() {
        return attrPrefix;
    }

    public void setLinkAttribute(String linkAttribute) {
        this.linkAttribute = linkAttribute;
    }

    public void setIdAttribute(String idAttribute) {
        this.idAttribute = idAttribute;
    }

    public SimpleCollection<TagInfo> getTags() {
        return new SimpleCollection<>(tags);
    }

    public void addTag(TagInfo tag) {
        tags.add(tag);
    }

    public void removeTag(TagInfo tag) {
        tags.remove(tag);
    }

    @Deprecated
    public SimpleCollection<String> getExcludedTags() {
        return new SimpleCollection<>(excludedTags);
    }

    @Deprecated
    public void addExcludedTag(String tag) {
        excludedTags.add(tag);
    }

    @Deprecated
    public void removeExcludedTag(String tag) {
        excludedTags.remove(tag);
    }

    @Override
    public String toString() {
        return json.toString(3);
    }

    public String readFromDictionarySQLString() {
        if (readFromDictionary.isEmpty()) return "";
        StringBuilder builder = new StringBuilder();
        builder.append(" collection=\"");
        builder.append(this.readFromDictionary.get(0));
        builder.append("\"");

        for (int i = 1; i < this.readFromDictionary.size(); i++) {
            builder.append(" OR ");
            builder.append("collection=\"");
            builder.append(this.readFromDictionary.get(i));
            builder.append("\"");
        }

        return builder.toString();
    }
}
