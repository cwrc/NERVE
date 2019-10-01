package ca.sharcnet.nerve.scriber.encoder;
import ca.sharcnet.nerve.scriber.context.Context;
import org.w3c.dom.Document;

public class EncodedDocument {
    private final Context context;
    private String schemaURL;
    private final Document document;

    EncodedDocument(Document document, Context context) {
        this.document = document;
        this.context = context;
    }

    public Context getContext() {
        return context;
    }

    public String getSchema() {
        return schemaURL;
    }

    void setSchema(String schemaURL) {
        this.schemaURL = schemaURL;
    }

    public Document getDocument(){
        return this.document;
    }
}

