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
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.ProcessingInstruction;
import org.xml.sax.SAXException;

/**
 *
 * @author edward
 */
public class QueryMain {

    public static void main(String... args) throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query("<ROOT></ROOT>");
        Query newElement = query.newElement("div", "this is a <p> tag");
        query.append(newElement);
        System.out.println(newElement.toString());
    }
}
