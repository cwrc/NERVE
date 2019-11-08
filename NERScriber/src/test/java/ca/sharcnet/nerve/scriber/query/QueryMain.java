/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.query;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.stream.XMLStreamException;
import static junit.framework.Assert.assertEquals;
import org.xml.sax.SAXException;

/**
 *
 * @author edward
 */
public class QueryMain {

    public static void main(String... args) throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        new QueryMain().test_new_from_stream();
    }

    // New queries are empty.
    public void test_bare() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/bare.xml"));
    }

    public void test_new_from_stream() throws SAXException, IOException, ParserConfigurationException {
        String source = "<ROOT><div></div></ROOT>";
        ByteArrayInputStream is = new ByteArrayInputStream(source.getBytes());
        Query query = new Query(is);
        assertEquals(1, query.select("div").size());
    }
}
