/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.query;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import javax.xml.parsers.ParserConfigurationException;
import junit.framework.TestCase;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

/**
 *
 * @author edward
 */
public class QueryPositionTest extends TestCase {

    /**
     * Return a string representation of node names in this query. The names
     * will be returned in order (depth first search is used) on one line.
     *
     * @return
     */
    String print(Query query) {
        return print(query, " ");
    }

    String print(Query query, String delim) {
        StringBuilder builder = new StringBuilder();
        for (Node n : query) {
            builder.append(n.getNodeName());
            if (n != query.last()) builder.append(delim);
        }
        return builder.toString();
    }

    String print(Query query, String attribute, String delim) {
        StringBuilder builder = new StringBuilder();
        for (Node n : query) {
            Element e = (Element) n;
            builder.append(e.getAttribute(attribute));
            if (n != query.last()) builder.append(delim);
        }
        return builder.toString();
    }

    public QueryPositionTest(String testName) {
        super(testName);
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();
    }

    @Override
    protected void tearDown() throws Exception {
        super.tearDown();
    }

    // New queries are empty.
    public void test_root_start() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test00.xml"));
        Query root = query.select(":root");
        assertEquals(3, root.startAt().line);
    }    
    
//    // New queries are empty.
//    public void test_root_end() throws SAXException, IOException, ParserConfigurationException {
//        Query query = new Query(new File("src/test/resources/xml/test00.xml"));
//        Query root = query.select(":root");
//        assertEquals(3, root.endAt().line);
//    }      
}
