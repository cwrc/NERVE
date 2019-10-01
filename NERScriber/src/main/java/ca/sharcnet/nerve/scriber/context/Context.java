package ca.sharcnet.nerve.scriber.context;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;

public class Context implements Serializable {
    private String name;
    private String schemaName = "";
    private String scriptFilename;
    private String tagSourceAttribute;
    private String style = "";
    private final String sourceString;
    private ArrayList<TagInfo> tagList = new ArrayList<>();
    private final JSONObject json;

    public Context(JSONObject json) {
        this.sourceString = json.toString();
        this.json = json;
        this.setup();
    }

    public Context(String jsonString) {
        this.sourceString = jsonString;
        JSONTokener jst = new JSONTokener(jsonString);
        this.json = new JSONObject(jst);
        this.setup();
    }

    private void setup() {
        this.name = json.getString("name");

        if (!json.has("schemaName")) {
            this.schemaName = "";
        } else {
            this.schemaName = json.getString("schemaName");
        }

        if (!json.has("scriptFile")) {
            this.scriptFilename = "";
        } else {
            this.scriptFilename = json.getString("scriptFile");
        }

        if (!json.has("tagSourceAttribute")) {
            this.tagSourceAttribute = "";
        } else {
            this.tagSourceAttribute = json.getString("tagSourceAttribute");
        }

        if (!json.has("style")) {
            this.style = "";
        } else {
            this.style = json.getString("style");
        }

        JSONObject jsonTags = json.getJSONObject("tags");
        for (String key : jsonTags.keySet()) {
            JSONObject tagInfoJSON = jsonTags.getJSONObject(key);
            tagList.add(new TagInfo(key, tagInfoJSON));
        }
    }

    public String getSourceString() {
        return this.sourceString;
    }

    public boolean hasTagSourceAttribute() {
        return (!tagSourceAttribute.isEmpty());
    }

    public String getTagSourceAttribute() {
        return tagSourceAttribute;
    }

    public boolean hasScriptFilename() {
        return (!scriptFilename.isEmpty());
    }

    public String getScriptFilename() {
        return scriptFilename;
    }

    public String getName() {
        return name;
    }

    public boolean hasSchemaName() {
        return (!schemaName.isEmpty());
    }    
    
    public String getSchemaName() {
        return schemaName;
    }

    public String getStyle() {
        return style;
    }

    public List<TagInfo> tags() {
        return tagList;
    }

    /*
    Return the tagInfo for the matching 'standard' tag name.
     */
    public TagInfo getTagInfo(String standardTagName) {
        for (TagInfo tagInfo : tagList) {
            if (tagInfo.getStandard().equals(standardTagName)) {
                return tagInfo;
            }
        }

        String exMsg = "in context '" + this.getName() + "' standard tag name '" + standardTagName + "' not found."
                     + "Accepted standard tags are: " + Arrays.toString(this.getStandardTags().toArray());
        throw new ContextException(exMsg, this);
    }

    public String getStandardTag(String schemaTagName) {
        for (TagInfo tagInfo : tagList) {
            if (tagInfo.getName().equals(schemaTagName)) {
                return tagInfo.getStandard();
            }
        }
        String exMsg = "in context '" + this.getName() + "' schema tag name '" + schemaTagName + "' not found.";
        throw new ContextException(exMsg, this);
    }

    public Set<String> getStandardTags(){
        JSONObject tags = this.json.getJSONObject("tags");
        return tags.keySet();
    }
    
    /**
     * Determine if 'string' is a valid tag name in the schema.  As opposed to 
     * a valid standard tag name.
     * @param string
     * @return 
     */
    public boolean isTagName(String string) {
        for (TagInfo tagInfo : tagList) {
            if (tagInfo.getName().equals(string)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Determine if 'string' is a valid standard tag name.  The standard tag 
     * names are: ORGANIZATION, LOCATION, PERSON, TITLE. These represent the 
     * object names in the context.tags object.
     * @param string
     * @return 
     */    
    public boolean isStandardTag(String string) {
        for (TagInfo tagInfo : tagList) {
            if (tagInfo.getStandard().equals(string)) {
                return true;
            }
        }
        return false;
    }

    public List<String> getDictionaries() {
        ArrayList<String> rvalue = new ArrayList<>();

        if (!this.json.has("dictionaries")) {
            return rvalue;
        }
        JSONArray jsonArray = this.json.getJSONArray("dictionaries");
        for (int i = 0; i < jsonArray.length(); i++) {
            rvalue.add(jsonArray.getString(i));
        }
        return rvalue;
    }
}
