package ca.sharcnet.nerve.scriber.encoder;

import ca.sharcnet.nerve.scriber.context.Context;
import ca.sharcnet.nerve.scriber.context.ContextLoader;
import ca.sharcnet.nerve.scriber.context.TagInfo;
import ca.sharcnet.nerve.scriber.dictionary.Dictionary;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.schema.Schema;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

/**
 *
 * @author edward
 */
public abstract class ServiceModuleBase implements IEncoder{
    private static String DEFAULT_FILENAME = "english.all.3class.distsim.crf.ser.gz";
    protected Document document;
    protected Context context;
    protected Schema schema;
    protected ArrayList<Dictionary> dictionaries = new ArrayList<>();;
    private String schemaURL;

    public void document(Document document) {
        this.document = document;
    }

    public Document document() {
        return this.document;
    }

    /**
     * Load context.
     *
     * @param context
     */
    public void setContext(Context context) {
        this.context = context;
    }

    public Context getContext() {
        return this.context;
    }    
    
    /**
     * Load context from jar.
     *
     * @param path
     * @throws IllegalArgumentException
     * @throws IOException
     */
    public void context(String path) throws IllegalArgumentException, IOException {
        try (final InputStream resourceAsStream = ClassLoader.getSystemResourceAsStream(path)) {
            this.context = ContextLoader.load(resourceAsStream);
        }
    }

    /**
     * Load schema.The schema gets loaded by the service creating the manager.  
     * The service can decide where it gets the schema from, the document or the
     * context.  The schema URL should be set so that other services can retrieve the
     * same schema.
     * @param schema
     * @param schemaURL
     */
    public void setSchema(Schema schema, String schemaURL) {
        this.schema = schema;
        this.schemaURL = schemaURL;
    }
    
    public Schema getSchema() {
        return this.schema;
    }    
    
    public String getSchemaUrl(){
        return this.schemaURL;
    }
    
    /**
     * Retrieve document.
     *
     * @return
     */
    public Document getDocument() {
        return this.document;
    }

    public void addDictionary(Dictionary dictionary) {
        this.dictionaries.add(dictionary);
    }

    public void setDictionaries(Iterable<Dictionary> itDictionary) {
        this.dictionaries.clear();
        for (Dictionary dictionary : itDictionary) this.dictionaries.add(dictionary);
    }    
    
    /**
     * Retrieve dictionary
     *
     * @return
     */
    public Iterable<Dictionary> getDictionaries() {
        Dictionary[] rvalue = new Dictionary[this.dictionaries.size()];
        this.dictionaries.toArray(rvalue);
        return Arrays.asList(rvalue);
    }

    protected void setDefaultAttributes(Node nerNode){
        String standardTag = context.getStandardTag(nerNode.name());
        TagInfo tagInfo = context.getTagInfo(standardTag);
        HashMap<String, String> defaults = tagInfo.defaults();
        for (String key : defaults.keySet()){
            nerNode.attr(key, defaults.get(key));
        }
    }        
    
}
