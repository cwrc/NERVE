package ca.sharcnet.nerve.docnav.tests;
import ca.frar.utility.console.Console;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.IsNodeType;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.query.Query;
import java.io.IOException;
import java.io.InputStream;
import static org.junit.Assert.*;
import org.junit.Test;

/**
 *
 * @author edward
 */
public class InstructionNodeTest implements HasStreams {

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }

    @Test
    public void test_load_simple() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("instructionNodeTest/simple.xml"));
        Query query = doc.query(NodeType.INSTRUCTION);
        Console.log(query);
        assertEquals(2, query.size());
    }

    @Test
    public void test_load_document() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("instructionNodeTest/document.xml"));
        Query query = doc.query(NodeType.INSTRUCTION);
        assertEquals(2, query.size());
    }

    @Test
    public void test_inst_byname() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("instructionNodeTest/document.xml"));
        Query query = doc.query(NodeType.INSTRUCTION).filter("oxy_comment_start");
        assertEquals(1, query.size());
    }

    @Test
    public void test_inst_attr() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("instructionNodeTest/document.xml"));
        String attr = doc.query(NodeType.INSTRUCTION).filter("oxy_comment_start").attr("author");
        assertEquals("leslieallin", attr);
    }
}
