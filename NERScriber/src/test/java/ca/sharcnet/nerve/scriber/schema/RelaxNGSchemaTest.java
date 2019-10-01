/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.schema;

import java.io.File;
import java.io.IOException;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.core.config.Configurator;
import org.apache.logging.log4j.spi.LoggerContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

/**
 *
 * @author edward
 */
public class RelaxNGSchemaTest {
    
    public RelaxNGSchemaTest() {
    }
    
    @BeforeAll
    public static void setUpClass() {
    }
    
    @AfterAll
    public static void tearDownClass() {
    }
    
    @BeforeEach
    public void setUp() {
    }
    
    @AfterEach
    public void tearDown() {
    }

    /**
     * Test of isValid method, of class RelaxNGSchema.
     */
    @Test
    public void testLoad() throws IOException, ParserConfigurationException, SAXException {
        String schemaFilename = "src/test/resources/default.rng";
        RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromFile(new File(schemaFilename));
        assertTrue(schema != null);
    }
    
    /**
     * Test of isValid method, of class RelaxNGSchema.
     * The 'any' tag is recursively all inclusive.
     */
    @Test
    public void testIsValid_00() throws IOException, ParserConfigurationException, SAXException {
        String schemaFilename = "src/test/resources/default.rng";
        RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromFile(new File(schemaFilename));
        
        boolean result = schema.isValid("doc", "any", "div");        
        assertTrue(result);
    }
    
    /**
     * Test of isValid method, of class RelaxNGSchema.
     * Div is only permitted to have text as a child.
     */
//    @Test
//    public void testNotValid_00() throws IOException, ParserConfigurationException, SAXException {
//        String schemaFilename = "src/test/resources/default.rng";
//        RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromFile(new File(schemaFilename));
//        
//        boolean result = schema.isValid("doc", "div", "div");        
//        assertFalse(result);
//    }        
    
    /**
     * Recursive must has recursive as child until end is reached.
     * @throws IOException
     * @throws ParserConfigurationException
     * @throws SAXException 
     */
    @Test
    public void testRecursive_00() throws IOException, ParserConfigurationException, SAXException {
        String schemaFilename = "src/test/resources/default.rng";
        RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromFile(new File(schemaFilename));
        
        boolean result = schema.isValid("doc", "recursive", "recursive", "end");        
        assertTrue(result);
    }        
    
//    @Test
//    public void testRecursive_01() throws IOException, ParserConfigurationException, SAXException {
//        String schemaFilename = "src/test/resources/default.rng";
//        RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromFile(new File(schemaFilename));
//        
//        boolean result = schema.isValid("doc", "recursive", "recursive");        
//        assertFalse(result);
//    }            
    
    /**
     * Rule paths must be terminated by text or empty.  Text can be empty.
     * @throws IOException
     * @throws ParserConfigurationException
     * @throws SAXException 
     */
//    @Test
//    public void testText_00() throws IOException, ParserConfigurationException, SAXException {
//        String schemaFilename = "src/test/resources/text-empty.rng";
//        RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromFile(new File(schemaFilename));
//        
//        boolean result = schema.isValid("div", "div");        
//        assertFalse(result);
//    }     
//    @Test
//    public void testText_01() throws IOException, ParserConfigurationException, SAXException {
//        Configurator.setLevel(LogManager.getLogger("RelaxNGSchema").getName(), Level.TRACE);
//        
//        String schemaFilename = "src/test/resources/text-empty.rng";
//        RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromFile(new File(schemaFilename));
//        
//        boolean result = schema.isValid("div", "div", "text");        
//        assertTrue(result);
//        Configurator.setLevel(LogManager.getLogger("RelaxNGSchema").getName(), Level.INFO);
//    }       
//    @Test
//    public void testEmpty_00() throws IOException, ParserConfigurationException, SAXException {
//        String schemaFilename = "src/test/resources/text-empty.rng";
//        RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromFile(new File(schemaFilename));
//        
//        boolean result = schema.isValid("div", "div", "text");        
//        assertTrue(result);
//    }              
//
//    /**
//     * Test of isValid method, of class RelaxNGSchema.
//     */
//    @Test
//    public void testIsValid_Node() {
//        System.out.println("isValid");
//        Node element = null;
//        RelaxNGSchema instance = null;
//        boolean expResult = false;
//        boolean result = instance.isValid(element);
//        assertEquals(expResult, result);
//        // TODO review the generated test code and remove the default call to fail.
//        fail("The test case is a prototype.");
//    }
//
//    /**
//     * Test of isValid method, of class RelaxNGSchema.
//     */
//    @Test
//    public void testIsValid_StringArr() {
//        System.out.println("isValid");
//        String[] tagNames = null;
//        RelaxNGSchema instance = null;
//        boolean expResult = false;
//        boolean result = instance.isValid(tagNames);
//        assertEquals(expResult, result);
//        // TODO review the generated test code and remove the default call to fail.
//        fail("The test case is a prototype.");
//    }
    
}
