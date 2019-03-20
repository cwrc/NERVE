package ca.sharcnet.nerve.docnav.tests;
import ca.frar.utility.console.Console;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.query.Query;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchema;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchemaLoader;
import java.io.IOException;
import java.io.InputStream;
import org.junit.Test;
import static org.junit.Assert.*;

public class TestSchemaRuleAll implements HasStreams {

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }

    @Test
    /**
     * Just make sure we don't fail the load
     */
    public void hello() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromStream(getResourceStream("schemas/default.rng"));
        assertTrue(true);
    }
    
    @Test
    /**
     * Just make sure we don't fail the load
     */
    public void validate_all() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromStream(getResourceStream("schemas/default.rng"));
        
        Query query = doc.query("*");
        query.forEach(n->{
            boolean valid = schema.isValid(n);
            assertTrue(valid);
        });
    }    
}
