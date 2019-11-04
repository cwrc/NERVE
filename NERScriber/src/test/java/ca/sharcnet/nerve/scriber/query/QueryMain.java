/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.query;

import java.io.File;
import java.io.IOException;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.stream.XMLStreamException;
import org.xml.sax.SAXException;

/**
 *
 * @author edward
 */
public class QueryMain {

    public static void main(String... args) throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        Query doc = new Query(new File("src/test/resources/xml/test00_1.xml"));
        doc.select(":doc").toStream(System.out);
    }
}
