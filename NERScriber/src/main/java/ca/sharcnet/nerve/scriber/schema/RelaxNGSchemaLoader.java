package ca.sharcnet.nerve.scriber.schema;
import ca.sharcnet.nerve.scriber.query.Query;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import javax.xml.parsers.ParserConfigurationException;
import org.xml.sax.SAXException;

public class RelaxNGSchemaLoader {
    private RelaxNGSchemaLoader() {}

    public static RelaxNGSchema schemaFromStream(InputStream srcStream) throws IOException, ParserConfigurationException, SAXException {
        return new RelaxNGSchema(new Query(srcStream));
    }

    public static RelaxNGSchema schemaFromString(String string) throws IOException, ParserConfigurationException, SAXException {
        return new RelaxNGSchema(new Query(string));
    }
    
    public static RelaxNGSchema schemaFromFile(File file) throws IOException, ParserConfigurationException, SAXException {
        return new RelaxNGSchema(new Query(file));
    }    
}
