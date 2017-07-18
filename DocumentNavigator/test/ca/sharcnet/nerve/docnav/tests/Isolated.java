/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.docnav.tests;

import ca.sharcnet.nerve.Console;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.query.Query;
import java.io.IOException;
import java.io.InputStream;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author edward
 */
public class Isolated implements HasStreams{

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }

    @Test
    public void test_doctype() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        assertEquals(0, doc.query("").size());
    }

}
