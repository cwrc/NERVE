package ca.sharcnet.nerve.docnav.schema.relaxng;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import java.io.IOException;
import java.io.InputStream;

public class RelaxNGSchemaLoader {
    private RelaxNGSchemaLoader() {}

    public static RelaxNGSchema1 schemaFromStream(InputStream srcStream) throws IOException {
        Document doc = DocumentLoader.documentFromStream(srcStream);
        return new RelaxNGSchema1(doc);
    }

    public static RelaxNGSchema1 schemaFromString(String string) throws IOException {
        Document doc = DocumentLoader.documentFromString(string);
        return new RelaxNGSchema1(doc);
    }
}
