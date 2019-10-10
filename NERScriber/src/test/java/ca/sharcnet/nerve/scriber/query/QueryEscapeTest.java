package ca.sharcnet.nerve.scriber.query;
import java.io.IOException;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import junit.framework.TestCase;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

public class QueryEscapeTest extends TestCase {
    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger("QuerySingleTest");
    
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

    public QueryEscapeTest(String testName) {
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

    public void test_text_tag_as_text() throws SAXException, IOException, ParserConfigurationException, TransformerConfigurationException, TransformerException {
        Query query = new Query("<ROOT></ROOT>");
        Query newElement = query.newElement("div", "this is a <p> tag");
        query.append(newElement);

        assertEquals("<div>this is a &lt;p&gt; tag</div>", newElement.toString());
    }
    
    public void test_text_lt() throws SAXException, IOException, ParserConfigurationException, TransformerConfigurationException, TransformerException {
        Query query = new Query("<ROOT></ROOT>");
        Query newElement = query.newElement("div", "<");
        query.append(newElement);

        String expected = "<div>&lt;</div>";
        String found = newElement.toString();
        
        assertEquals(expected, found);
    }    
    
    public void test_text_gt() throws SAXException, IOException, ParserConfigurationException, TransformerConfigurationException, TransformerException {
        Query query = new Query("<ROOT></ROOT>");
        Query newElement = query.newElement("div", ">");
        query.append(newElement);

        assertEquals("<div>&gt;</div>", newElement.toString());
    }        
    
    public void test_text_amp() throws SAXException, IOException, ParserConfigurationException, TransformerConfigurationException, TransformerException {
        Query query = new Query("<ROOT></ROOT>");
        Query newElement = query.newElement("div", "&");
        query.append(newElement);

        assertEquals("<div>&amp;</div>", newElement.toString());
    }     
    
    public void test_text_quot() throws SAXException, IOException, ParserConfigurationException, TransformerConfigurationException, TransformerException {
        Query query = new Query("<ROOT></ROOT>");
        Query newElement = query.newElement("div", "\"");
        query.append(newElement);

        assertEquals("<div>&quot;</div>", newElement.toString());
    }  

    public void test_text_apos() throws SAXException, IOException, ParserConfigurationException, TransformerConfigurationException, TransformerException {
        Query query = new Query("<ROOT></ROOT>");
        Query newElement = query.newElement("div", "'");
        query.append(newElement);

        assertEquals("<div>&apos;</div>", newElement.toString());
    } 
    
    public void text_attr_lt() throws SAXException, IOException, ParserConfigurationException, TransformerConfigurationException, TransformerException {
        Query query = new Query("<ROOT><div></div></ROOT>");
        Query newElement = query.select("div").attribute("attr", "<");
        assertEquals("<div attr=\"&lt;\"><div>", newElement.toString());
    }    
    
    public void text_attr_gt() throws SAXException, IOException, ParserConfigurationException, TransformerConfigurationException, TransformerException {
        Query query = new Query("<ROOT><div></div></ROOT>");
        Query newElement = query.select("div").attribute("attr", ">");
        assertEquals("<div attr=\"&gt;\"><div>", newElement.toString());
    }        
    
    public void text_attr_amp() throws SAXException, IOException, ParserConfigurationException, TransformerConfigurationException, TransformerException {
        Query query = new Query("<ROOT><div></div></ROOT>");
        Query newElement = query.select("div").attribute("attr", "&");
        assertEquals("<div attr=\"&amp;\"><div>", newElement.toString());
    }     
    
    public void text_attr_quot() throws SAXException, IOException, ParserConfigurationException, TransformerConfigurationException, TransformerException {
        Query query = new Query("<ROOT><div></div></ROOT>");
        Query newElement = query.select("div").attribute("attr", "\"");
        assertEquals("<div attr=\"&quot;\"><div>", newElement.toString());
    }  

    public void text_attr_apos() throws SAXException, IOException, ParserConfigurationException, TransformerConfigurationException, TransformerException {
        Query query = new Query("<ROOT><div></div></ROOT>");
        Query newElement = query.select("div").attribute("attr", "'");
        assertEquals("<div attr=\"&apos;\"><div>", newElement.toString());
    }     
}