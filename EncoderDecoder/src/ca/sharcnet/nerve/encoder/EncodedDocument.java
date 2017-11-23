package ca.sharcnet.nerve.encoder;

import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.docnav.dom.Document;

public class EncodedDocument extends Document{
    private final Context context;

    EncodedDocument(Document document, Context context) {
        super(document);
        this.context = context;
    }

    public Context getContext() {
        return context;
    }
}

