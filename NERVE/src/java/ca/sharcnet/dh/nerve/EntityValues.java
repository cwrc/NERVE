package ca.sharcnet.dh.nerve;
import ca.fa.SQL.SQLRecord;
import ca.fa.jjjrmi.annotations.NativeJS;

@NativeJS(trans = true, processAll=false)
public class EntityValues {
    private String entity = "";
    private String lemma = "";
    private String link = "";
    private String tagName = "";
    private String collection = "";

    private EntityValues(){}
    
    @NativeJS
    public EntityValues(String entity, String lemma, String link, String tag, String collection){
        this.entity = entity;
        this.lemma = lemma;
        this.link = link;
        this.tagName = tag;
        this.collection = collection;
    }

    public EntityValues(SQLRecord record){
        this.entity = record.getEntry("entity").getValue();
        this.lemma = record.getEntry("lemma").getValue();
        this.link = record.getEntry("link").getValue();
        this.tagName = record.getEntry("tag").getValue();
        this.collection = record.getEntry("collection").getValue();
    }
    
    @NativeJS
    public static void extract(Object entity){
        /*JS{
            let text = $(entity).text();
            let lemma = $(entity).lemma();
            let link = $(entity).link();
            let tag = $(entity).entityTag();
            let collection = $(entity).attr("data-collection");
            if (!collection) collection = "";
            return new EntityValues(text, lemma, link, tag, collection);
        }*/
    }
    
    /**
     * @return the entity
     */
    public String getEntity() {
        return entity;
    }

    /**
     * @return the lemma
     */
    public String getLemma() {
        return lemma;
    }

    /**
     * @return the link
     */
    public String getLink() {
        return link;
    }

    /**
     * @return the tagName
     */
    public String getTagName() {
        return tagName;
    }

    /**
     * @return the collection
     */
    public String getCollection() {
        return collection;
    }    
}
