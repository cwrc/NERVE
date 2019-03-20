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
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.query.Query;
import java.io.IOException;
import java.io.InputStream;
import org.junit.Test;

/**
 *
 * @author edward
 */
public class Isolated implements HasStreams {

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }

    @Test
    public void instruction_node() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("fromEncoder.xml"));
        Console.log("\n" + ", " + doc + ", " + "\n");

        {
            Query rContext = doc.query(NodeType.INSTRUCTION).filter("context");
            Console.log(rContext.getSelectString() + ", " + rContext.toString("name"));

            Query sContext = doc.query(NodeType.INSTRUCTION).filter("context[name]");
            Console.log(sContext.getSelectString() + ", " + sContext.toString("name"));
        }

        {
            Query rContext = doc.query(NodeType.INSTRUCTION).filter("context");
            Console.log(rContext.getSelectString() + ", " + rContext.toString("name"));

            Query sContext = doc.query(NodeType.INSTRUCTION).filter("context[name]");
            Console.log(sContext.getSelectString() + ", " + sContext.toString("name"));
        }

    }

}
