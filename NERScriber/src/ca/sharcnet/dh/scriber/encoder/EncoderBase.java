package ca.sharcnet.dh.scriber.encoder;

import ca.sharcnet.dh.scriber.context.Context;
import ca.sharcnet.dh.scriber.context.ContextLoader;
import ca.sharcnet.dh.scriber.dictionary.IDictionary;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.schema.Schema;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchemaLoader;
import java.io.BufferedInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.zip.GZIPInputStream;

/**
 *
 * @author edward
 */
public abstract class EncoderBase implements IEncoder{

    private static String DEFAULT_FILENAME = "english.all.3class.distsim.crf.ser.gz";
    protected Document document;
    protected Context context;
    protected Schema schema;
    protected IDictionary dictionary;

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
    public void schema(Schema schema) {
        this.schema = schema;
    }

    /**
     * Load schema from jar.
     *
     * @param path
     * @throws IllegalArgumentException
     * @throws IOException
     */
    public void schema(String path) throws IllegalArgumentException, IOException {
        try (final InputStream resourceAsStream = ClassLoader.getSystemResourceAsStream(path)) {
            this.schema = RelaxNGSchemaLoader.schemaFromStream(resourceAsStream);
        }
    }

    /**
     * Load schema from url.
     *
     * @param url
     * @throws IOException
     */
    public void schema(URL url) throws IOException {
        try (final InputStream urlStream = url.openStream()) {
            this.schema = RelaxNGSchemaLoader.schemaFromStream(urlStream);
        }
    }

    /**
     * Retrieve document.
     *
     * @return
     */
    public Document getDocument() {
        return this.document;
    }

    public void dictionary(IDictionary dictionary) {
        this.dictionary = dictionary;
    }

    /**
     * Retrieve dictionary
     *
     * @return
     */
    public IDictionary dictionary() {
        return this.dictionary;
    }

}
