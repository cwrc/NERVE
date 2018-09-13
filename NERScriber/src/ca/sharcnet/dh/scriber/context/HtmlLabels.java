package ca.sharcnet.dh.scriber.context;
import org.json.JSONObject;

public class HtmlLabels {
    protected String entity = "entity";
    protected String tagged = "tagged";
    protected String tagName = "tagName";
    protected String lemma = "lemma";
    protected String link = "taglink";

    public HtmlLabels(JSONObject json){
        if (json.has("htmlLabels")){
            JSONObject htmlLabelsJson = json.getJSONObject("htmlLabels");
            if (htmlLabelsJson.has("tagged")){
                tagged = htmlLabelsJson.getString("tagged");
            }
            if (htmlLabelsJson.has("tagName")){
                tagName = htmlLabelsJson.getString("tagName");
            }
            if (htmlLabelsJson.has("lemma")){
                lemma = htmlLabelsJson.getString("lemma");
            }
            if (htmlLabelsJson.has("link")){
                link = htmlLabelsJson.getString("link");
            }
            if (htmlLabelsJson.has("entity")){
                entity = htmlLabelsJson.getString("entity");
            }
        }
    }

    public String tagged() {
        return tagged;
    }

    public String tagName() {
        return tagName;
    }

    public String lemma() {
        return lemma;
    }

    public String entity() {
        return entity;
    }

    public String link(){
        return link;
    }
}
