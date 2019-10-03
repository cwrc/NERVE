/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.query;

import static ca.sharcnet.nerve.scriber.query.Query.LOGGER;
import java.io.File;
import java.io.IOException;
import javax.xml.parsers.ParserConfigurationException;
import static junit.framework.Assert.assertEquals;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/**
 *
 * @author edward
 */
public class QueryMain {

    public static void main(String... args) throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test06.xml"));
        Query select = query.select("[id='1']");
        select.unwrap();
        query.toStream(System.out);
        
        
//        String expected = "Hello World!";
//        Query newText = query.newText(expected);
//        System.out.println(query.select(":root").tagName() + " '" + expected + "', '" + newText.text() + "'");
//        query.select(":root").append(newText);
//        String found = query.select(":root").get(0).getTextContent();
//        System.out.println(query.select(":root").tagName() + " '" + expected + "', '" + found + "'");
//        assertEquals(expected, found);
    }
}
