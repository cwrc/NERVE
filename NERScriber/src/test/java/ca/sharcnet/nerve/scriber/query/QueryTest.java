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
public class QueryTest extends TestCase {

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

    public QueryTest(String testName) {
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
    public void test_new_from_string() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query("<ROOT><div></div></ROOT>");
        assertEquals(1, query.select("div").size());
    }
    
    public void test_new_from_stream() throws SAXException, IOException, ParserConfigurationException {
        InputStream is = new InputStream() {
            int i = 0;
            byte[] s = "<ROOT><div></div></ROOT>".getBytes();
            
            @Override
            public int read() throws IOException {
                if (i < s.length){
                    return s[i++];                
                } else {
                    return -1;
                }
            }
        };
        
        Query query = new Query(is);
        assertEquals(1, query.select("div").size());
    }    
    
    // New queries are empty.
    public void test_new_query_document() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test00.xml"));
        assertEquals(query.getDocument().getDocumentElement(), query.get(0));
    }

    // Can't select root element by name directly //
    public void test_select_root_element_by_name() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test00.xml"));
        Query select = query.select("ROOT");
        assertEquals(0, select.size());
    }

    public void test_select_root_element() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test00.xml"));
        Query select = query.select(":root");
        assertEquals(1, select.size());
    }

    // a new query has no element, and thus no 'all children'.
    public void test_all_children_is_empty() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test00.xml"));
        Query select = query.allChildren();
        assertEquals(0, select.size());
    }

    public void test_all_children_from_root() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test01.xml"));
        Query select = query.select(":root").allChildren();
        assertEquals(3, select.size());
    }

    public void test_select_by_has_attribute() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test01.xml"));
        Query select = query.select("[id]");
        assertEquals(3, select.size());
    }

    public void test_select_by_attribute_value() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test01.xml"));
        Query select = query.select("[id='1']");
        assertEquals(1, select.size());
    }

    public void test_select_by_has_attribute_none() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test01.xml"));
        Query select = query.select("[class]");
        assertEquals(0, select.size());
    }

    public void test_select_by_attribute_value_none() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test01.xml"));
        Query select = query.select("[id='3']");
        assertEquals(0, select.size());
    }

    public void test_select_by_attribute_value_multiple() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test02.xml"));
        Query select = query.select("[id='1']");
        assertEquals(2, select.size());
    }

    public void test_select_by_name_attribute() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test02.xml"));
        Query select = query.select("div[id='0']");
        assertEquals(1, select.size());
    }

    public void test_select_by_name_attribute_none_1() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test02.xml"));
        Query select = query.select("div[id='3']");
        assertEquals(0, select.size());
    }

    public void test_select_by_name_attribute_none_2() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test02.xml"));
        Query select = query.select("sub[id='3']");
        assertEquals(0, select.size());
    }

    public void test_select_by_name_only() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test02.xml"));
        Query select = query.select("div");
        assertEquals(3, select.size());
    }

    public void test_select_next() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test02.xml"));
        Query select = query.select("> div");
        assertEquals(2, select.size());
    }

    public void test_root_by_select() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test02.xml"));
        Query select = query.select(":root");
        assertEquals(1, select.size());
    }

    public void test_all_children() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test02.xml"));
        Query select = query.allChildren();
        assertEquals(5, select.size());
    }

    public void test_children() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test02.xml"));
        Query select = query.children();
        assertEquals(3, select.size());
    }

    public void test_last() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test02.xml"));
        Query select = query.children();
        assertEquals("span", select.last().getNodeName());
    }

    public void test_children_as_string() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test02.xml"));
        Query select = query.children();
        assertEquals("div div span", print(select));
    }

    public void test_specific_00() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select("span > span");
        assertEquals("5 11 10", print(select, "id", " "));
    }

    public void test_specific_01() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select("div");
        assertEquals("0 1 2 6 7 9", print(select, "id", " "));
    }

    public void test_specific_02() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select("[id='1'] *");
        assertEquals("2 3", print(select, "id", " "));
    }

    public void test_specific_03() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select("div *");
        assertEquals("2 3 7 8 9 10", print(select, "id", " "));
    }

    public void test_specific_04() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select("> div, > span");
        assertEquals("0 1 4", print(select, "id", " "));
    }

    public void test_specific_05() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select("> div, span > div");
        assertEquals("0 1 6 9", print(select, "id", " "));
    }

    public void test_parent_00() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select("[id='1']").parent();
        assertEquals(query.select(":root").get(0), select.get(0));
    }

    // root has no parent
    public void test_root_parent() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select(":root").parent();
        assertEquals(0, select.size());
    }

    public void test_set_attribute_new() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test02.xml"));
        Query select = query.select("div").attribute("set", "true");
        assertEquals("true true true", print(select, "set", " "));
    }

    public void test_set_attribute_new_00() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        query.select("div").attribute("class", "a");
        query.select("span").attribute("class", "b");
        assertEquals("aaabbbaababb", print(query.select("*"), "class", ""));
    }

    public void test_new_element_00() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test00.xml"));
        Query newElement = query.newElement("div", "i am a new div");
        query.select(":root").append(newElement);
        assertEquals(1, query.select("*").size());
    }

    public void test_new_element_01() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test00.xml"));
        Query newElement = query.newElement("<div></div>");
        query.select(":root").append(newElement);
        assertEquals(1, query.select("*").size());
    }

    public void test_ancestor() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query ancestors = query.select("[id='10']").ancestors();
        assertEquals("-1 4 6 8", print(ancestors, "id", " "));
    }

    public void test_get_text_node() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test04.xml"));
        Query textnode = query.select("div").children(n -> n.getNodeType() == Node.TEXT_NODE);
        assertEquals(Node.TEXT_NODE, textnode.get(0).getNodeType());
        assertEquals(2, textnode.size());
    }

    public void test_text_ancestors() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test04.xml"));
        Query textnode = query.select("div").children(n -> n.getNodeType() == Node.TEXT_NODE);
        assertEquals("ROOT div", print(textnode.select(0).ancestors()));
    }

    public void test_new_text_node() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test00.xml"));
        String expected = "Hello World!";
        Query newText = query.newText(expected);
        query.select(":root").append(newText);
        String found = query.select(":root").get(0).getTextContent();
        assertEquals(expected, found);
    }

    public void test_get_text() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test04.xml"));
        String found = query.select("div").select(1).text();
        String expected = "second";
        assertEquals(expected, found);
    }
    
    public void test_set_text() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test04.xml"));
        query.select("div").select(1).text("third");
        String found = query.select("div").select(1).text();
        String expected = "third";
        assertEquals(expected, found);
    }   
    
    public void test_select_doc() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test04.xml"));
        assertEquals(query.getDocument(), query.select(":doc").get(0));
    }        
    
    public void test_to_stream() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test04.xml"));
        Query root = query.select(":doc");        
        
        FileInputStream fis = new FileInputStream(new File("src/test/resources/xml/test04.xml"));
        OutputStream outputStream = new OutputStream() {
            
        // NOTE: the parser puts attributes out in alphabetical order, this is 
        // not part of the spec, it just happens to do it this way.  Changing the
        // sax parser could break this test.
            
            public void write(int b) throws IOException {                
                int read = fis.read();
                assertEquals(read, b);
            }
        };
        
        root.toStream(outputStream);
    }
    
    public void test_node_to_stream() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test04.xml"));
        Query root = query.select("div").select(1);        
        
        OutputStream outputStream = new OutputStream() {            
            byte[] expected = "<div>second</div>".getBytes();
            int i = 0;
            
            public void write(int b) throws IOException {                
                assertEquals(expected[i++], b);
            }
        };
        
        root.toStream(outputStream);
    }    
    
    public void test_attributes() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test04.xml"));
        List<String> attributes = query.select("div").select(0).attributes();
        assertTrue(attributes.contains("id"));
        assertTrue(attributes.contains("class"));
        assertTrue(attributes.contains("link"));
        assertFalse(attributes.contains("not"));
    }
    
    public void test_filter() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test05.xml"));
        Query select = query.select("div");
        Query filter = select.filter(n->n.getTextContent().startsWith("a"));
        assertEquals(2, filter.size());
    }    
    
    public void test_replace() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test05.xml"));
        Query select = query.select("div").select(2);
        Query newElement = query.newElement("<div><div id=\"0\"></div></div>");
        select.replaceWith(newElement);
               
        assertEquals(1, query.select("[id='0']").size());
        assertEquals(0, query.select("[id='3']").size());
    }      
    
    public void test_clone() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test05.xml"));
        Query select = query.select("[id='4')");
        Query clone = select.clone();
        
        assertEquals(select.tagName(), clone.tagName());
        assertEquals(select.attribute("id"), clone.attribute("id"));
        assertEquals(select.text(), clone.text());
    }    
    
    public void test_rename() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test05.xml"));
        Query select = query.select("div").tagName("span");
        assertEquals(4, query.select("span").size());
    }       
    
    public void test_unwrap() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test06.xml"));
        Query select = query.select("[id='1']");
        select.unwrap();
        
        assertEquals(0, query.select("[id='1']").size());
        assertEquals(1, query.select("[id='2']").size());
    }       
    
    public void test_get_all_text_nodes() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test07.xml"));
        Query textNodes = query.allChildren(n->n.getNodeType() == Node.TEXT_NODE);

        assertEquals(5, textNodes.size());        
        assertEquals("a", textNodes.select(0).text());
        assertEquals("b", textNodes.select(1).text());
        assertEquals("c", textNodes.select(2).text());
        assertEquals("d", textNodes.select(3).text());
        assertEquals("e", textNodes.select(4).text());        
    }      

    public void test_get_current_level_text_nodes() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test07.xml"));
        Query textNodes = query.children(n->n.getNodeType() == Node.TEXT_NODE);

        assertEquals(2, textNodes.size());        
        assertEquals("a", textNodes.select(0).text());
        assertEquals("e", textNodes.select(1).text());        
    }  
    
    // Passing in null will give all children of all node types.
    public void test_children_pass_in_null() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test07.xml"));
        Query textNodes = query.children(null);

        assertEquals(3, textNodes.size());        
        assertEquals("a", textNodes.select(0).text());
        assertEquals(Node.ELEMENT_NODE, textNodes.get(1).getNodeType());
        assertEquals("e", textNodes.select(2).text());        
    }   
    
    // Passing in null will give all children of all node types.
    public void test_all_children_pass_in_null() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test07.xml"));
        Query textNodes = query.allChildren(null);
        assertEquals(7, textNodes.size());        
    }     
    
    // Passing in null will give all children of all node types.
    public void test_split() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test07.xml"));
        Query nodes = query.allChildren(null);
        List<Query> split = nodes.split();
        assertEquals(7, split.size());   
        for (Query q : split) assertEquals(1, q.size());
    }         
    
    
    public void test_instruction_nodes() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test00.xml"));
        Query nodes = query.select(":inst");
        assertEquals(2, nodes.size());
        assertEquals(Node.PROCESSING_INSTRUCTION_NODE, nodes.select(0).nodeType());
        assertEquals(Node.PROCESSING_INSTRUCTION_NODE, nodes.select(1).nodeType());
    }      
    
    public void test_instruction_node_attr() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test00.xml"));
        Query nodes = query.select(":inst");
        assertEquals("http://cwrc.ca/schemas/orlando_biography_v2.rng", nodes.select(0).attribute("href"));
    }
}
