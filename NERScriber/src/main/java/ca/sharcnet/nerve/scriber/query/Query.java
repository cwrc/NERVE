package ca.sharcnet.nerve.scriber.query;

import static ca.sharcnet.nerve.scriber.Constants.LOG_NAME;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.ProcessingInstruction;
import org.w3c.dom.Text;
import org.xml.sax.SAXException;

/**
 * A helper class to facilitate manipulating an XML DOM.
 *
 * @author edward
 */
public class Query extends ArrayList<Node> {
    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger(LOG_NAME);
    private final DocumentBuilder builder;
    private final Document document;
    private String encoding = null;

    public String getEncoding(){
        return this.encoding;
    }
    
    private Query(DocumentBuilder builder, Document document, String encoding) {
        super();
        this.builder = builder;
        this.document = document;
        this.encoding = encoding;
    }

    public Query(File file) throws SAXException, IOException, ParserConfigurationException {
        super();

        SAXParserFactory saxFactory = SAXParserFactory.newInstance();
        SAXParser parser = saxFactory.newSAXParser();

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        builder = factory.newDocumentBuilder();
        document = builder.newDocument();

        LineNumberHandler lineNumberHandler = new LineNumberHandler(document);
        parser.setProperty("http://xml.org/sax/properties/lexical-handler", lineNumberHandler);

        /* This is a hacky way of determining the declared xml encoding */
        try {
            final XMLStreamReader xmlStreamReader;
            xmlStreamReader = XMLInputFactory.newInstance().createXMLStreamReader(new FileReader(file));
            this.encoding = xmlStreamReader.getCharacterEncodingScheme();
        } catch (XMLStreamException ex) {
            Logger.getLogger(Query.class.getName()).log(Level.SEVERE, null, ex);
            throw new SAXException(ex);
        }
        /* --- */

        FileInputStream fis = new FileInputStream(file);
        parser.parse(fis, lineNumberHandler);

        this.add(document.getDocumentElement());
    }

    public Query(String string) throws SAXException {
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            builder = dbf.newDocumentBuilder();
            InputStream inputStream = new ByteArrayInputStream(string.getBytes(Charset.forName("UTF-8")));
            document = builder.parse(inputStream);
            this.add(document.getDocumentElement());
        } catch (ParserConfigurationException | IOException ex) {
            /* should never happen */
            throw new RuntimeException(ex);
        }
    }

    public Query(InputStream inputStream, String encoding) throws SAXException, IOException, ParserConfigurationException {
        super();

        SAXParserFactory saxFactory = SAXParserFactory.newInstance();
        SAXParser parser = saxFactory.newSAXParser();

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        builder = factory.newDocumentBuilder();
        document = builder.newDocument();

        LineNumberHandler lineNumberHandler = new LineNumberHandler(document);
        parser.setProperty("http://xml.org/sax/properties/lexical-handler", lineNumberHandler);

        this.encoding = encoding;

        parser.parse(inputStream, lineNumberHandler);

        this.add(document.getDocumentElement());
    }        
    
    // TODO detect document type from input, currently hard coded to UTF-8
    public Query(InputStream inputStream) throws SAXException, IOException, ParserConfigurationException {
        this(inputStream, "UTF-8");
    }
    
//    public Query(InputStream inputStream) throws SAXException, IOException, ParserConfigurationException {
//        super();
//
//        SAXParserFactory saxFactory = SAXParserFactory.newInstance();
//        SAXParser parser = saxFactory.newSAXParser();
//
//        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
//        builder = factory.newDocumentBuilder();
//        document = builder.newDocument();
//
//        LineNumberHandler lineNumberHandler = new LineNumberHandler(document);
//        parser.setProperty("http://xml.org/sax/properties/lexical-handler", lineNumberHandler);
//
//        /* This is a hacky way of determining the declared xml encoding */
//        try {
//            final XMLStreamReader xmlStreamReader;
//            xmlStreamReader = XMLInputFactory.newInstance().createXMLStreamReader(inputStream);
//            this.encoding = xmlStreamReader.getCharacterEncodingScheme();
//        } catch (XMLStreamException ex) {
//            Logger.getLogger(Query.class.getName()).log(Level.SEVERE, null, ex);
//            throw new SAXException(ex);
//        }
//        /* --- */
//
//        inputStream.reset();
//        parser.parse(inputStream, lineNumberHandler);
//
//        this.add(document.getDocumentElement());
//    }    
    
    public Query(Query query) {
        super();
        this.builder = query.getBuilder();
        this.document = query.getDocument();
        this.encoding = query.encoding;
        query.forEach(n -> this.add(n));
    }

    public Document getDocument() {
        return this.document;
    }

    public DocumentBuilder getBuilder() {
        return this.builder;
    }

    public Query add(Query query) {
        for (Node n : query) this.add(n);
        return this;
    }

    public Query newQuery() {
        Query query = new Query(this.builder, this.document, this.encoding);
        return query;
    }

    public Query newQuery(Node... nodes) {
        Query query = this.newQuery();
        for (Node n : nodes) query.add(n);
        return query;
    }

    /**
     * Retrieve all child element nodes for all nodes in Query, may include
     * duplicates. This method will traverse down a single level of the selected
     * elements and return all child elements.
     *
     * @return
     */
    public Query children() {
        return children(n -> n.getNodeType() == Node.ELEMENT_NODE);
    }

    /**
     * Retrieve all child nodes for all nodes in Query, may include duplicates.
     * Will only select nodes of a type included in nodeTypes This method will
     * traverse down a single level of the selected elements and return all
     * child elements.
     *
     * @param nodeTypes
     * @param filter
     * @return
     */
    public Query children(Predicate<Node> filter) {
        Query query = new Query(builder, document, encoding);
        this.forEach(n -> {
            NodeList childNodes = n.getChildNodes();
            for (int i = 0; i < childNodes.getLength(); i++) {
                Node child = childNodes.item(i);
                if (filter == null || filter.test(child)) {
                    query.add(child);
                }
            }
        });
        return query;
    }

    /**
     * Retrieve all child element nodes for all nodes in Query recursivly, may
     * include duplicates. This method will traverse down a single level of the
     * selected elements and return all child elements.
     *
     * @return
     */
    public Query allChildren() {
        return allChildren(n -> n.getNodeType() == Node.ELEMENT_NODE);
    }

    /**
     * Retrieve all child element nodes for all nodes in Query recursively, may
     * include duplicates. This method will traverse down a single level of the
     * selected elements and return all child elements.
     *
     * @return
     */
    public Query allChildren(Predicate<Node> filter) {
        Query query = new Query(builder, document, encoding);
        this.forEach(n -> {
            allChildrenRecurse(n, query, filter);
        });
        return query;
    }

    private void allChildrenRecurse(Node node, Query appendTo, Predicate<Node> filter) {
        NodeList childNodes = node.getChildNodes();

        for (int i = 0; i < childNodes.getLength(); i++) {
            Node child = childNodes.item(i);
            if (filter == null || filter.test(child)) {
                appendTo.add(child);
            }
            allChildrenRecurse(child, appendTo, filter);
        }
    }

    /**
     * Retrieve all ancestor nodes for all nodes in Query. May include
     * duplicates , will be in reverse order from Query to root. Does not
     * include nodes in this query.
     *
     * @return
     */
    public Query ancestors() {
        Query query = new Query(builder, document, encoding);
        this.forEach(n -> {
            Node parent = n.getParentNode();
            while (parent != this.document && parent != null) {
                Element p = (Element) parent;
                query.add(this.size() - 1, parent);
                parent = parent.getParentNode();
            }
        });
        return query;
    }

    public Query filter(Predicate<Node> filter) {
        Query query = new Query(builder, document, encoding);
        this.forEach(n -> {
            if (filter.test(n)) {
                query.add(n);
            }
        });
        return query;
    }

    /**
     * Reduce the set of matched elements to those that match the selector. This
     * is only a single level selector that checks name, attr, and/or
     * attr-value. It doens't verify ancestry.
     *
     * @param selector
     * @return
     */
    public Query filter(String selectorString) {
        Selector selector = new Selector(selectorString);

        Query query = new Query(builder, document, encoding);
        this.split().forEach(q -> {
            if (selector.test(q)) {
                query.add(q);
            }
        });
        return query;
    }

    /**
     * Return a new query containing only the 'index' element.
     *
     * @param index
     * @return
     */
    public Query select(int index) {
        return newQuery(this.get(index));
    }

    /**
     * Return all child entities by node name.<br>
     * '*' selects all.<br>
     * '>' select only from next level.<br>
     * ' ' space selects from all children.<br>
     * ',' comma chains multiple selects additively.<br>
     *
     * @param selector
     * @return
     */
    public Query select(String selector) {
        Query query = new Query(builder, document, encoding);

        String[] split = selector.split(",+");

        for (int i = 0; i < split.length; i++) {
            Query selected = this.selectSpaceDelim(split[i].trim());
            query.add(selected);
        }

        return query;
    }

    private Query selectSpaceDelim(String selector) {
        String withDeliminator = "((?<=%1$s)|(?=%1$s))";
        String regex = "[ ]+|>";
        String[] split = selector.split(String.format(withDeliminator, regex));
        ArrayList<String> asList = new ArrayList<String>();

        for (int i = 0; i < split.length; i++) {
            String s = split[i].trim();
            if (s.isBlank()) continue;
            asList.add(s);
        }

        Query current = new Query(this);
        for (int i = 0; i < asList.size(); i++) {
            String s = asList.get(i);

            switch (s) {
                case ":instruction":
                case ":inst":
                    current = this.select(":doc").children(n -> n.getNodeType() == Node.PROCESSING_INSTRUCTION_NODE);
                    break;
                case ":document":
                case ":doc":
                    current = new Query(this.builder, this.document, this.encoding);
                    current.add(document);
                    break;
                case ":root":
                    current = new Query(this.builder, this.document, this.encoding);
                    current.add(document.getDocumentElement());
                    break;
                case "*":
                    current = current.allChildren();
                    break;
                case ">":
                    s = asList.get(++i);
                    current = current.SelectorNextLevel(s);
                    break;
                default:
                    current = current.selectorAll(s);
                    break;
            }
        }

        return current;
    }

    /**
     * Select the all elements matching the selector.
     *
     * @param selector
     * @return
     */
    Query selectorAll(String string) {
        Query query = new Query(builder, document, encoding);
        Selector selector = new Selector(string);

        for (Node node : this) {
            this.select(node).allChildren().split().forEach((q) -> {
                if (selector.test(q)) query.add(q);
            });
        }

        return query;
    }

    /**
     * Select the all elements matching the selector.
     *
     * @param selector
     * @return
     */
    Query SelectorNextLevel(String string) {
        Query query = new Query(builder, document, encoding);
        Selector selector = new Selector(string);

        for (Node node : this) {
            this.select(node).children().split().forEach((q) -> {
                if (selector.test(q)) query.add(q);
            });
        }

        return query;
    }

    /**
     * Return all immediate parent nodes as a new query.
     *
     * @return
     */
    public Query parent() {
        Query query = new Query(this.builder, this.document, this.encoding);
        for (Node n : this) {
            if (n.getParentNode() != null && n.getParentNode() != this.document) {
                query.add(n.getParentNode());
            }
        }
        return query;
    }

    public Query attribute(String key, String value) {
        this.forEach(n -> {
            switch (n.getNodeType()) {
                case Node.ELEMENT_NODE:
                    ((Element) n).setAttribute(key, value);
                    break;
            }
        });
        return this;
    }

    public boolean hasAttribute(String key) {
        Node n = this.get(0);
        switch (n.getNodeType()) {
            case Node.ELEMENT_NODE:
                return ((Element) n).hasAttribute(key);
            case Node.PROCESSING_INSTRUCTION_NODE:
                return hasAttribute((ProcessingInstruction) n, key);
            default:
                return false;
        }
    }

    public String attribute(String key) {
        if (this.isEmpty()) throw new EmptyQueryException();
        Node n = this.get(0);
        switch (n.getNodeType()) {
            case Node.ELEMENT_NODE:
                return ((Element) n).getAttribute(key);
            case Node.PROCESSING_INSTRUCTION_NODE:
                return attribute((ProcessingInstruction) n, key);
            default:
                return "";
        }
    }

    private boolean hasAttribute(ProcessingInstruction node, String key) {
        String text = node.getTextContent();
        int index = text.indexOf(key);
        if (index == -1) return false;
        index = text.indexOf("=", index);
        if (index == -1) return false;
        index = text.indexOf("\"", index);
        if (index == -1) return false;

        int end = text.indexOf("\"", index + 1);
        if (end == -1) return false;

        return true;
    }

    private String attribute(ProcessingInstruction node, String key) {
        String text = node.getTextContent();
        int index = text.indexOf(key);
        if (index == -1) return "";
        index = text.indexOf("=", index);
        if (index == -1) return "";
        index = text.indexOf("\"", index);
        if (index == -1) return "";

        int end = text.indexOf("\"", index + 1);
        if (end == -1) return "";

        return text.substring(index + 1, end);
    }

    /**
     * Create a new element with tagName and textContents. This element can be
     * attached to elements from the original query.
     *
     * @param tagName
     * @param textContents
     * @return a query containing the new element
     */
    public Query newElement(String tagName, String textContents) {
        Element element = document.createElement(tagName);
        element.setTextContent(textContents);
        return newQuery(element);
    }

    public Query newText(String textContents) {
        Text textNode = document.createTextNode(textContents);
        return newQuery(textNode);
    }

    public Query newElement(String string) throws SAXException {
        InputStream inputStream = new ByteArrayInputStream(string.getBytes(Charset.forName("UTF-8")));
        Document parse;

        try {
            parse = builder.parse(inputStream);
        } catch (IOException ex) {
            /* should never happen */
            throw new RuntimeException(ex);
        }

        Node importNode = document.importNode(parse.getDocumentElement(), true);
        return newQuery(importNode);
    }

    public Query append(Query query) {
        Node n = this.get(0);
        if (n.getNodeType() != Node.ELEMENT_NODE) throw new NodeTypeException();
        Element e = (Element) n;

        for (Node m : query) {
            e.appendChild(m);
        }

        return this;
    }

    /**
     * Retrieve the tagName of the first element.
     *
     * @return
     */
    public String tagName() {
        return this.get(0).getNodeName();
    }

    public Query tagName(String newName) {
        for (Node n : this) {
            this.document.renameNode(n, null, newName);
        }
        return this;
    }

    public Query clone() {
        Query query = new Query(this.builder, this.document, this.encoding);
        for (Node n : this) {
            query.add(n.cloneNode(true));
        }
        return query;
    }

    /**
     * Replace first element in this with all elements in 'that'.
     *
     * @param that
     */
    public void replaceWith(Query that) {
        Node parentNode = this.get(0).getParentNode();
        Node nextSibling = this.get(0).getNextSibling();
        for (Node n : that) {
            parentNode.insertBefore(n, nextSibling);
        }
        parentNode.removeChild(this.get(0));
    }

    /**
     * Get the first element's text content.
     *
     * @return
     */
    public String text() {
        return this.get(0).getTextContent();
    }

    /**
     * Set the first element's text content.
     *
     * @return
     */
    public Query text(String text) {
        this.get(0).setTextContent(text);
        return this;
    }

    public Query select(Node node) {
        return newQuery(node);
    }

    public Node last() {
        return this.get(this.size() - 1);
    }

    public List<String> attributes() {
        ArrayList<String> list = new ArrayList<>();

        Node node = this.get(0);
        if (node.getNodeType() != Node.ELEMENT_NODE) return list;
        Element element = (Element) node;
        NamedNodeMap attributes = element.getAttributes();
        for (int i = 0; i < attributes.getLength(); i++) {
            list.add(attributes.item(i).getNodeName());
        }

        return list;
    }

    public void unwrap() {
        for (Node node : this) {
            Query children = this.select(node).clone().children(n -> true);
            this.select(node).replaceWith(children);
        }
    }

    /**
     * Return contents as individual queries.
     *
     * @return
     */
    public List<Query> split() {
        ArrayList<Query> list = new ArrayList<>();
        for (Node n : this) list.add(this.select(n));
        return list;
    }

    public int nodeType() {
        return this.get(0).getNodeType();
    }

    public Position startAt() {
        Object userDataLine = this.get(0).getUserData(LineNumberHandler.START_LINE_NUMBER_KEY_NAME);
        Object userDataCol = this.get(0).getUserData(LineNumberHandler.START_COLUMN_NUMBER_KEY_NAME);
        
        int line = 0;
        int col = 0;
        
        if (userDataLine != null) line = (int) userDataLine;
        if (userDataCol != null) col = (int) userDataCol;
        
        return new Position(line, col);
    }

    public Position endAt() {
        int line = (int) this.get(0).getUserData(LineNumberHandler.END_LINE_NUMBER_KEY_NAME);
        int col = (int) this.get(0).getUserData(LineNumberHandler.END_COLUMN_NUMBER_KEY_NAME);
        return new Position(line, col);
    }

    Query prevSibling() {
        Query query = new Query(this.builder, this.document, this.encoding);
        Node prev = this.get(0).getPreviousSibling();
        if (prev != null) query.add(prev);
        return query;
    }

    Query nextSibling() {
        Query query = new Query(this.builder, this.document, this.encoding);
        Node prev = this.get(0).getNextSibling();
        if (prev != null) query.add(prev);
        return query;
    }
    
    public void toStream(OutputStream outputStream) throws IOException {
        new QueryPrinter(this).toStream(outputStream);
    }
    
    @Override
    public String toString(){
        return new QueryPrinter(this).toString();
    }    
}
