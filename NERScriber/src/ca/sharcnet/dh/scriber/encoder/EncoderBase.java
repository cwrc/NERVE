package ca.sharcnet.dh.scriber.encoder;

import ca.sharcnet.dh.scriber.context.Context;
import ca.sharcnet.dh.scriber.context.ContextLoader;
import ca.sharcnet.dh.scriber.dictionary.Dictionary;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.schema.Schema;
import java.io.IOException;
import java.io.InputStream;

/**
 *
 * @author edward
 */
public abstract class EncoderBase implements IEncoder{

    private static String DEFAULT_FILENAME = "english.all.3class.distsim.crf.ser.gz";
    protected Document document;
    protected Context context;
    protected Schema schema;
    protected Dictionary dictionary;
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
    public void context(Context context) {
        this.context = context;
    }

    public Context context() {
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
     * Load schema.
     *
     * @param schema
     */
    public void setSchema(Schema schema) {
        this.schema = schema;
    }
    
    public Schema getSchema() {
        return this.schema;
    }    
    
    public String getSchemaUrl(){
        return this.schemaURL;
    }

    public void setSchemaUrl(String schemaURL){
        this.schemaURL = schemaURL;
    }    
    
    /**
     * Retrieve document.
     *
     * @return
     */
    public Document getDocument() {
        return this.document;
    }

    public void dictionary(Dictionary dictionary) {
        this.dictionary = dictionary;
    }

    /**
     * Retrieve dictionary
     *
     * @return
     */
    public Dictionary dictionary() {
        return this.dictionary;
    }

}
