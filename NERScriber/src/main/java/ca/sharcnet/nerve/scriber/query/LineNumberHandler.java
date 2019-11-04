/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.query;

import java.util.Stack;
import org.w3c.dom.Comment;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.ProcessingInstruction;
import org.xml.sax.Attributes;
import org.xml.sax.Locator;
import org.xml.sax.SAXException;
import org.xml.sax.ext.DefaultHandler2;
import org.xml.sax.ext.LexicalHandler;

/**
 * see:
 * https://stackoverflow.com/questions/4915422/get-line-number-from-xml-node-java
 *
 * @author edward
 */
public class LineNumberHandler extends DefaultHandler2 implements LexicalHandler {
    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger("LineNumberHandler");
    
    final Stack<Element> elementStack = new Stack<>();
    final StringBuilder textBuffer = new StringBuilder();
    final static String START_LINE_NUMBER_KEY_NAME = "sln";
    final static String START_COLUMN_NUMBER_KEY_NAME = "scn";
    final static String END_LINE_NUMBER_KEY_NAME = "eln";
    final static String END_COLUMN_NUMBER_KEY_NAME = "ecn";
    private Locator locator;
    Document doc;

    int lastLine = 0;
    int lastCol = 0;

    LineNumberHandler(Document doc) {
        this.doc = doc;
    }

    private void setPositions(Node node) {
        node.setUserData(START_LINE_NUMBER_KEY_NAME, String.valueOf(lastLine), null);
        node.setUserData(START_COLUMN_NUMBER_KEY_NAME, String.valueOf(lastCol), null);
        node.setUserData(END_LINE_NUMBER_KEY_NAME, String.valueOf(this.locator.getLineNumber()), null);
        node.setUserData(END_COLUMN_NUMBER_KEY_NAME, String.valueOf(this.locator.getColumnNumber()), null);
        lastLine = this.locator.getLineNumber();
        lastCol = this.locator.getLineNumber();
    }
    
    @Override
    public void comment(char[] ch, int start, int length) throws SAXException {
        addTextIfNeeded();
        Comment el = doc.createComment(new String(ch));
        LOGGER.trace("COMMENT '" + new String(ch) + "' " + this.locator.getLineNumber() + ":" + this.locator.getColumnNumber());
        
        if (elementStack.isEmpty()){
            doc.appendChild(el);
        } else {
            elementStack.peek().appendChild(el);
        }
    }

    @Override
    public void setDocumentLocator(final Locator locator) {
        LOGGER.trace(locator.getClass());
        this.locator = locator; // Save the locator, so that it can be used later for line tracking when traversing nodes.
    }

    public void processingInstruction(String target, String data) throws SAXException {
        LOGGER.trace("processingInstruction " + target + " " + data);
        LOGGER.trace(" " + this.locator.getLineNumber() + ":" + this.locator.getColumnNumber());

        ProcessingInstruction el = doc.createProcessingInstruction(target, data);
        setPositions(el);
        doc.appendChild(el);
    }

    @Override
    public void startElement(final String uri, final String localName, final String qName, final Attributes attributes) throws SAXException {
        LOGGER.trace("START " + qName + " " + this.locator.getLineNumber() + ":" + this.locator.getColumnNumber());
        addTextIfNeeded();

        final Element el = doc.createElement(qName);
        for (int i = 0; i < attributes.getLength(); i++) {
            el.setAttribute(attributes.getQName(i), attributes.getValue(i));
        }
        el.setUserData(START_LINE_NUMBER_KEY_NAME, String.valueOf(this.locator.getLineNumber()), null);
        el.setUserData(START_COLUMN_NUMBER_KEY_NAME, String.valueOf(this.locator.getColumnNumber()), null);
        lastLine = this.locator.getLineNumber();
        lastCol = this.locator.getLineNumber();
        elementStack.push(el);
    }

    @Override
    public void endElement(final String uri, final String localName, final String qName) {
        LOGGER.trace("END " + qName + " " + this.locator.getLineNumber() + ":" + this.locator.getColumnNumber());
        addTextIfNeeded();
        final Element el = elementStack.pop();

        el.setUserData(END_LINE_NUMBER_KEY_NAME, String.valueOf(this.locator.getLineNumber()), null);
        el.setUserData(END_COLUMN_NUMBER_KEY_NAME, String.valueOf(this.locator.getColumnNumber()), null);
        lastLine = this.locator.getLineNumber();
        lastCol = this.locator.getLineNumber();

        if (elementStack.isEmpty()) { // Is this the root element?
            doc.appendChild(el);
        } else {
            final Element parentEl = elementStack.peek();
            parentEl.appendChild(el);
        }
    }

    @Override
    public void ignorableWhitespace(char ch[], int start, int length) throws SAXException {
        /* no op */
    }

    public void notationDecl(String name, String publicId, String systemId) throws SAXException {
        /* no op */
    }

    @Override
    public void characters(final char ch[], final int start, final int length) throws SAXException {
        textBuffer.append(ch, start, length);        
        LOGGER.trace("TEXT '" + new String(ch, start, length).replace("\n", "\\n") + "'");
    }

    // Outputs text accumulated under the current node
    private void addTextIfNeeded() {
        if (textBuffer.length() > 0) {
            final Element el = elementStack.peek();
            final Node textNode = doc.createTextNode(textBuffer.toString());
            el.appendChild(textNode);
            textBuffer.delete(0, textBuffer.length());
        }
    }

    @Override
    public void startDTD(String name, String publicId, String systemId) throws SAXException {
        /* no op */
    }

    @Override
    public void endDTD() throws SAXException {
        /* no op */
    }

    @Override
    public void startEntity(String name) throws SAXException {
        /* no op */
    }

    @Override
    public void endEntity(String name) throws SAXException {
        /* no op */
    }

    @Override
    public void startCDATA() throws SAXException {
        /* no op */
    }

    @Override
    public void endCDATA() throws SAXException {
        /* no op */
    }
};
