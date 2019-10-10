/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.schema;

import static ca.sharcnet.nerve.scriber.Constants.SCHEMA_NODE_ATTR;
import static ca.sharcnet.nerve.scriber.Constants.SCHEMA_NODE_NAME;
import ca.sharcnet.nerve.scriber.query.Query;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import javax.xml.parsers.ParserConfigurationException;
import junit.framework.TestCase;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.xml.sax.SAXException;

/**
 * This test is dependent on the remote schema not changing.
 * @author edward
 */
public class RelaxNGSchemaLoaderTest extends TestCase {
    
    public RelaxNGSchemaLoaderTest(String testName) {
        super(testName);
    }
    
    /**
     * Test of schemaFromURL method, of class RelaxNGSchemaLoader.     
     */
    public void test_raw_url() throws Exception {
        String schemaURL = "https://cwrc.ca/schemas/orlando_biography_v2.rng";
        RelaxNGSchema expResult = null;
        RelaxNGSchema result = RelaxNGSchemaLoader.schemaFromURL(schemaURL);
        Query query = result.getQuery();
        String expected = "http://relaxng.org/ns/structure/1.0";
        String found = query.select(":root").attribute("xmlns");
        assertEquals(expected, found);
    }
    
    /**
     * HTTPS changed to HTTP
     * @throws Exception 
     */
    public void test_redirect_url() throws Exception {
        String schemaURL = "http://cwrc.ca/schemas/orlando_biography_v2.rng";
        RelaxNGSchema expResult = null;
        RelaxNGSchema result = RelaxNGSchemaLoader.schemaFromURL(schemaURL);
        Query query = result.getQuery();
        String expected = "http://relaxng.org/ns/structure/1.0";
        String found = query.select(":root").attribute("xmlns");
        assertEquals(expected, found);
    }    
    
    /**
     * HTTPS changed to HTTP
     * @throws Exception 
     */
    public void test_invalid() throws Exception {
        String schemaURL = "http://cwrc.ca/schemas/not_a_schema.rng";        
        assertThrows(FileNotFoundException.class, () -> RelaxNGSchemaLoader.schemaFromURL(schemaURL));
    }        
    
    /**
     * Load from <?xml-model href="http://cwrc.ca/schemas/orlando_biography_v2.rng"
     */
    
    public void test_from_xml_instr() throws SAXException, IOException, ParserConfigurationException{       
        Query query = new Query(new File("src/test/resources/xml/orlando.xml"));
        query.select(":inst").filter(SCHEMA_NODE_NAME).toStream(System.out);
        
        String url = query.select(":inst").filter(SCHEMA_NODE_NAME).attribute(SCHEMA_NODE_ATTR);
        RelaxNGSchema result = RelaxNGSchemaLoader.schemaFromURL(url);
        
        String expected = "http://relaxng.org/ns/structure/1.0";
        String found = result.getQuery().select(":root").attribute("xmlns");
        assertEquals(expected, found);
    }
}
