package ca.sharcnet.nerve.docnav.tests;

import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import java.io.IOException;
import java.io.InputStream;
import org.junit.Test;

/**
 * run the tostring methds to (1)prevent them from reporting as un-covered and (2) ensure they don't throw an
 * exception.  The actual output is not checked here.
 * @author edward
*/
public class ToStringTest implements HasStreams {

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }

    @Test
    public void test0() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("document.xml"));
        doc.toString();
        doc.toString(true);
        doc.toString(false);
        doc.toString(0);
        doc.toString(1);
    }

    @Test
    public void test1() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.toString();
        doc.toString(true);
        doc.toString(false);
        doc.toString(0);
        doc.toString(1);
    }
}