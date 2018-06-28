package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.JJJOptions;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.frar.utility.SQL.SQLRecord;

/**
Values set to NULL are explicitly unset, those set to "" are blank.  During copies all null should be ignored.
@author edward
*/

@JJJ()
@JJJOptions(retain = false)
public class EntityValues extends JJJObject{

    private String entityValue = null;
    private String lemmaValue = null;
    private String linkValue = null;
    private String tagValue = null;
    private String collectionValue = null;

    private EntityValues() {}

    @NativeJS
    public EntityValues(String entity, String lemma, String link, String tag, String collection) {
        this.entityValue = entity;
        this.lemmaValue = lemma;
        this.linkValue = link;
        this.tagValue = tag;
        this.collectionValue = collection;
    }

    public EntityValues(SQLRecord record) {
        this.entityValue = record.getEntry("entity").getValue();
        this.lemmaValue = record.getEntry("lemma").getValue();
        this.linkValue = record.getEntry("link").getValue();
        this.tagValue = record.getEntry("tag").getValue();
        this.collectionValue = record.getEntry("collection").getValue();
    }

    @NativeJS
    public static void extract(Object entity) {
        /*JS{
            let text = $(entity).text();
            let lemma = $(entity).lemma();
            let link = $(entity).link();
            let tag = $(entity).tag();
            let collection = $(entity).attr("data-collection");
            if (!collection) collection = "";
            return new EntityValues(text, lemma, link, tag, collection);
        }*/
    }

    @NativeJS
    public EntityValues copyTo(Object dest){
        /*JS{
            if (this.text() !== null) dest.text(this.text());
            if (this.lemma() !== null) dest.lemma(this.lemma());
            if (this.link() !== null) dest.link(this.link());
            if (this.tag() !== null) dest.tag(this.tag());
            if (this.collection() !== null) dest.collection(this.text());
        }*/
        return this;
    }

    @NativeJS
    public EntityValues copy(){
        return new EntityValues(this.text(), this.lemma(), this.link(), this.tag(), this.collection());
    }

    public String text() {
        return this.entityValue;
    }

    @NativeJS
    public String text(String value) {
        /*JS{
            if (typeof value === "undefined") return this.entityValue;
        }*/
        this.entityValue = value;
        return this.entityValue;
    }

    public String lemma() {
        return this.lemmaValue;
    }

    @NativeJS
    public String lemma(String value) {
        /*JS{
            if (typeof value === "undefined") return this.lemmaValue;
        }*/
        this.lemmaValue = value;
        return this.lemmaValue;
    }

    public String link() {
        return this.linkValue;
    }

    @NativeJS
    public String link(String value) {
        /*JS{
            if (typeof value === "undefined") return this.linkValue;
        }*/
        this.linkValue = value;
        return this.linkValue;
    }

    public String tag() {
        return this.tagValue;
    }

    @NativeJS
    public String tag(String value) {
        /*JS{
            if (typeof value === "undefined") return this.tagValue;
        }*/
        this.tagValue = value;
        return this.tagValue;
    }

    public String collection() {
        return this.collectionValue;
    }

    @NativeJS
    public String collection(String value) {
        /*JS{
            if (typeof value === "undefined") return this.collectionValue;
        }*/
        this.collectionValue = value;
        return this.collectionValue;
    }

    /**
     * @return the entity
     */
    @Deprecated()
    public String getEntity() {
        return entityValue;
    }

    /**
     * @return the lemma
     */
    @Deprecated()
    public String getLemma() {
        return lemmaValue;
    }

    /**
     * @return the link
     */
    @Deprecated()
    public String getLink() {
        return linkValue;
    }

    /**
     * @return the tagName
     */
    @Deprecated()
    public String getTagName() {
        return tagValue;
    }

    /**
     * @return the collection
     */
    @Deprecated()
    public String getCollection() {
        return collectionValue;
    }
}
