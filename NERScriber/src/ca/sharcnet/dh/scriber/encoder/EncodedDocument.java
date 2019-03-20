package ca.sharcnet.dh.scriber.encoder;

import ca.sharcnet.dh.scriber.context.Context;
import ca.sharcnet.nerve.docnav.dom.Document;

public class EncodedDocument extends Document{
    private final Context context;
    private String schemaURL;

    EncodedDocument(Document document, Context context) {
        super(document);
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
}

