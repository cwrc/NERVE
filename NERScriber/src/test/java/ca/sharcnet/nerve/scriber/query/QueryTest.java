/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.query;

import java.io.File;
import java.io.IOException;
import java.util.function.Predicate;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.ParserConfigurationException;
import junit.framework.TestCase;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

/**
 *
 * @author edward
 */
public class QueryTest extends TestCase {

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
        assertEquals("div div span", select.print());
    }   
    
    public void test_specific_00() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select("span > span");
        assertEquals("5 11 10", select.print("id", " "));
    }  
    
    public void test_specific_01() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select("div");
        assertEquals("0 1 2 6 7 9", select.print("id", " "));
    }      
    
    public void test_specific_02() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select("[id='1'] *");
        assertEquals("2 3", select.print("id", " "));
    }    
    
    public void test_specific_03() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select("div *");
        assertEquals("2 3 7 8 9 10", select.print("id", " "));
    }        
    
    public void test_specific_04() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select("> div, > span");
        assertEquals("0 1 4", select.print("id", " "));
    }
    
    public void test_specific_05() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        Query select = query.select("> div, span > div");
        assertEquals("0 1 6 9", select.print("id", " "));
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
        assertEquals("true true true", select.print("set", " "));
    }    
    
    public void test_set_attribute_new_00() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test03.xml"));
        query.select("div").attribute("class", "a");
        query.select("span").attribute("class", "b");
        assertEquals("aaabbbaababb", query.select("*").print("class", ""));
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
        System.out.println(ancestors.print("id", " "));
    }        
    
    public void test_get_text_node() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test04.xml"));        
        Query textnode = query.select("div").children(n->n.getNodeType() == Node.TEXT_NODE);
        assertEquals(Node.TEXT_NODE, textnode.get(0).getNodeType());
        assertEquals(1, textnode.size());
    }        

    public void test_text_ancestors() throws SAXException, IOException, ParserConfigurationException {
        Query query = new Query(new File("src/test/resources/xml/test04.xml"));        
        Query textnode = query.select("div").children(n->n.getNodeType() == Node.TEXT_NODE);
        assertEquals("ROOT div", textnode.ancestors().print());
    }    
}