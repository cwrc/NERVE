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
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.query.Query;
import java.io.IOException;
import java.io.InputStream;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 * Test that documents with multiple root nodes will still be ready.  Note this
 * is an ill-formatted xml/html document, but this package is not meant to adhere
 * to the spec.
 * @author edward
 */
public class MultiRoot implements HasStreams {

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }

    @Test
    public void load_mult() throws IOException {
        Document doc = DocumentLoader.documentFromStream(this.getResourceStream("multi_root/file01.xml"));
        System.out.println(doc);
    }
    
    @Test
    public void load_mult_has_three_nodes() throws IOException {
        Document doc = DocumentLoader.documentFromStream(this.getResourceStream("multi_root/file01.xml"));
        assertEquals(3, doc.childCount());
        NodeList childNodes = doc.childNodes();
        for (Node node : childNodes) Console.log(node);
    }

    @Test
    public void load_mult_get_root() throws IOException {
        Document doc = DocumentLoader.documentFromStream(this.getResourceStream("multi_root/file01.xml"));
        assertEquals(3, doc.query("root").size());
    }

    @Test
    public void load_mult_query1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(this.getResourceStream("multi_root/file02.xml"));
        assertEquals(3, doc.query("root").size());
    }
    
}
