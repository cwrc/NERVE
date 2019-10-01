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
import org.xml.sax.SAXException;

/**
 *
 * @author edward
 */
public class QueryMain {
    public static void main(String ... args) throws SAXException, IOException, ParserConfigurationException{
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select(":root");
        LOGGER.debug(select.get(0).getParentNode());
        LOGGER.debug(select.parent().get(0));
    }
}
