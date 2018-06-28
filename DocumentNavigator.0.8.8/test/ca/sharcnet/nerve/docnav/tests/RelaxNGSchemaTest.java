/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.docnav.tests;

import ca.frar.utility.console.Console;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.schema.Schema;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchema;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchemaLoader;
import java.io.IOException;
import java.io.InputStream;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author edward
 */
public class RelaxNGSchemaTest implements HasStreams{

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }

    /**
     * The orlando_biography_v2.xml file is a valid schema/xml file.
     * @throws java.io.IOException
    */
    @Test
    public void load_as_document() throws IOException{
        DocumentLoader.documentFromStream(getResourceStream("orlando_biography_v2.xml"));
    }

    @Test
    public void load_as_schema() throws IOException{
        RelaxNGSchemaLoader.schemaFromStream(getResourceStream("orlando_biography_v2.xml"));
    }

    /* document.xml is vald to orlando_biography_v2 */
    @Test
    public void load_check_doc_0() throws IOException{
        Schema schema = RelaxNGSchemaLoader.schemaFromStream(getResourceStream("orlando_biography_v2.xml"));
        Document doc = DocumentLoader.documentFromStream(getResourceStream("document.xml"));

        doc.query("BIRTHNAME").forEach(node->{
            assertTrue(schema.isValid(node));
        });
    }

    /* document.xml is vald to orlando_biography_v2 */
    @Test
    public void load_check_doc_1() throws IOException{
        Schema schema = RelaxNGSchemaLoader.schemaFromStream(getResourceStream("orlando_biography_v2.xml"));
        Document doc = DocumentLoader.documentFromStream(getResourceStream("document.xml"));

        doc.query("*").forEach(node->{
            assertTrue(schema.isValid(node));
        });
    }

}
