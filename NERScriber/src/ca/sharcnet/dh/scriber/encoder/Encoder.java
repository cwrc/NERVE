package ca.sharcnet.dh.scriber.encoder;

import ca.sharcnet.dh.scriber.context.ContextLoader;
import ca.sharcnet.dh.scriber.context.Context;
import ca.sharcnet.dh.scriber.context.TagInfo;
import ca.sharcnet.dh.scriber.ProgressStage;
import ca.sharcnet.dh.scriber.ProgressPacket;
import ca.sharcnet.dh.progress.ProgressListener;
import ca.frar.utility.SQL.SQL;
import ca.frar.utility.SQL.SQLRecord;
import ca.frar.utility.SQL.SQLResult;
import static ca.sharcnet.dh.scriber.Constants.*;
import ca.sharcnet.nerve.docnav.*;
import ca.sharcnet.nerve.docnav.dom.*;
import java.io.IOException;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;
import ca.sharcnet.dh.scriber.HasStreams;
import ca.sharcnet.nerve.docnav.query.Query;
import ca.sharcnet.nerve.docnav.schema.Schema;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchemaLoader;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.encoder.exceptions.NullSchemaPathException;
import ca.sharcnet.dh.scriber.encoder.exceptions.NullSchemaStreamException;
import ca.sharcnet.dh.scriber.encoder.exceptions.UnknownSchemaException;
import java.io.BufferedInputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Properties;
import java.util.zip.GZIPInputStream;
import org.json.JSONObject;

public class Encoder extends ProgressListenerList {

    private final Context context;
    private final SQL sql;
    private final Classifier classifier;
    private Schema schema = null;
    private EncodedDocument document = null;
    private EncodeOptions options;

    /**
     * Encode a document. The hasStreams object must have the config.txt & classification file in root and contexts in /contexts. The options (EncodedOptions)
     * will control which actions to perform. Output will be written to listener (ProgressListener).
     *
     * @param document The loaded document.
     * @param hasStreams
     * @param options
     * @param listener
     * @return
     * @throws IOException
     * @throws ClassNotFoundException
     * @throws InstantiationException
     * @throws IllegalAccessException
     * @throws SQLException
     * @throws ParserConfigurationException
     */
    public static EncodedDocument encode(Document document, HasStreams hasStreams, EncodeOptions options, ProgressListener listener) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        if (document == null) throw new NullPointerException();
        if (hasStreams == null) throw new NullPointerException();

        ProgressPacket progressPacket = new ProgressPacket();
        progressPacket.message("Encoding Document").stage(ProgressStage.START);
        if (listener != null) listener.start("Encoding Document");

        /* connect to SQL */
        SQL sql = null;
        if (options.hasProcess(EncodeProcess.DICTIONARY)){
            if (listener != null) listener.updateMessage("Connecting to SQL database");
            Properties config = new Properties();
            InputStream cfgStream = hasStreams.getResourceStream("config.txt");
            config.load(cfgStream);
            sql = new SQL(config);
        }

        /* build classifier */
        Classifier classifier = null;
        if (options.hasProcess(EncodeProcess.NER)){
            if (listener != null) listener.updateMessage("Building Classifier");
            InputStream cStream = hasStreams.getResourceStream("english.all.3class.distsim.crf.ser.gz");
            BufferedInputStream bis = new BufferedInputStream(new GZIPInputStream(cStream));
            classifier = new Classifier(bis);
            cStream.close();
        }

        /* retrieve the schema url to set the context */
        Context context = null;
        Query model = document.query(NodeType.INSTRUCTION).filter(SCHEMA_NODE_NAME);
        String schemaURL = model.attr(SCHEMA_NODE_ATTR);

        if (listener != null) listener.updateMessage("Determining Context");

        String schemaAttrValue = model.attr(SCHEMA_NODE_ATTR);
        
        if (!schemaAttrValue.isEmpty()){
            int index = schemaAttrValue.lastIndexOf('/');
            schemaAttrValue = schemaAttrValue.substring(index);
        }

        /* Choose the context based on the schema delcared in the xml document */
        switch (schemaAttrValue) {
            case "/orlando_biography_v2.rng":
                context = ContextLoader.load(hasStreams.getResourceStream(CONTEXT_PATH + "/orlando.context.json"));
                break;
            case "/cwrc_entry.rng":
                context = ContextLoader.load(hasStreams.getResourceStream(CONTEXT_PATH + "/cwrc.context.json"));
                break;
            case "/cwrc_tei_lite.rng":
                context = ContextLoader.load(hasStreams.getResourceStream(CONTEXT_PATH + "/tei.context.json"));
                break;
            default:
                context = ContextLoader.load(hasStreams.getResourceStream(CONTEXT_PATH + "/default.context.json"));
                break;
        }
        
        if (context == null) throw new UnknownSchemaException(context, schemaAttrValue);
        Encoder encoder = new Encoder(document, context, sql, classifier, options);        
        if (listener != null) encoder.add(listener);

        String schemaFileName = context.getSchemaName();
        if (schemaFileName == null) throw new NullSchemaPathException(context);
        String schemaFilePath = SCHEMA_PATH + "/" + schemaFileName;
        InputStream schemaStream = hasStreams.getResourceStream(schemaFilePath);
        if (schemaStream == null) throw new NullSchemaStreamException(context, schemaFilePath);
        Schema schemaFromStream = RelaxNGSchemaLoader.schemaFromStream(schemaStream);
        encoder.setSchema(schemaFromStream);

        EncodedDocument encoded = encoder.encode();
        encoded.setSchema(schemaURL);

        if (listener != null) listener.end();
        return encoded;
    }

    private Encoder(Document document, Context context, SQL sql, Classifier classifier, EncodeOptions options) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {
        if (document == null) throw new NullPointerException();
        if (context == null) throw new NullPointerException();
        if (options.hasProcess(EncodeProcess.NER) && classifier == null) throw new NullPointerException();
        if (options.hasProcess(EncodeProcess.DICTIONARY) && sql == null) throw new NullPointerException();
        
        this.options = options;
        this.sql = sql;
        this.context = context;
        this.document = new EncodedDocument(document, context);
        this.classifier = classifier;
    }

    private EncodedDocument encode() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        for (EncodeProcess process : options.getProcesses()) {
            switch (process) {
                case NER:
                    this.forEach(lst -> lst.updateMessage("Processing NER"));
                    processNER(document);
                    break;
                case DICTIONARY:
                    this.forEach(lst -> lst.updateMessage("Linking Entities"));
                    lookupTag();
                    break;
            }
        }

        this.forEach(lst -> lst.updateMessage("Converting Tags"));
        wrapNode(document);

        return document;
    }

    private void setSchema(Schema schema) {
        this.schema = schema;
    }

    private String buildDictionaryQuery() throws SQLException {
        /* first check context for dictionary list */
        List<String> dictList = this.context.getDictionaries();

        if (dictList.isEmpty()){
            SQLResult dictionaries = sql.query("select * from dictionaries");
            for (SQLRecord sqlRecord : dictionaries) {
                dictList.add(sqlRecord.getEntry("name").getValue());
            }
        }

        StringBuilder builder = new StringBuilder();
        if (dictList.isEmpty()) return "";
        builder.append("select * from ");
        builder.append(dictList.get(0));
        
        for (int i = 1; i < dictList.size(); i++){
            builder.append(" union select * from ");
            builder.append(dictList.get(i));            
        }
        
        String query = builder.toString();
        return query;
    }

    private String buildDictionaryQuery(String entityText) throws SQLException {
        Console.log("buildDictionaryQuery(\"" + entityText + "\")");
        SQLResult dictionaries = sql.query("select * from dictionaries");
        StringBuilder builder = new StringBuilder();
        int i = 0;

        for (SQLRecord sqlRecord : dictionaries) {
            String dictionary = sqlRecord.getEntry("name").getValue();
            if (i != 0) builder.append(" union ");
            builder.append("select * from ");
            builder.append(dictionary);
            builder.append(" where entity = '");
            builder.append(entityText.replaceAll("'", "\\\\'"));
            builder.append("'");
            i++;
        }

        String query = builder.toString();
        return query;
    }

    private void lookupTag() throws SQLException {
        StringMatch knownEntities = new StringMatch();
        String dictionaryQuery = buildDictionaryQuery();            
        if (dictionaryQuery.isEmpty()) return;        
        
        SQLResult sqlResult = sql.query(dictionaryQuery);
        
        for (int i = 0; i < sqlResult.size(); i++) {
            SQLRecord row = sqlResult.get(i);
            knownEntities.addCandidate(row.getEntry("entity").getValue(), row);
        }

        lookupTag(document, knownEntities);
    }

    private void lookupTag(Document doc, StringMatch knownEntities) throws SQLException {
        Query textNodes = doc.query(NodeType.TEXT);

        double n = 0;
        double N = textNodes.size();

        for (Node node : textNodes) {
            if (context.isTagName(node.getParent().name())) lookupTaggedNode(node.getParent());
            else lookupTag((TextNode) node, knownEntities);
            for (ProgressListener lst : this) lst.updateProgress((int)(++n / N * 100));
        }
    }

    private void lookupTaggedNode(Node node) throws SQLException {
        String standardTag = context.getStandardTag(node.name());
        TagInfo tagInfo = context.getTagInfo(standardTag);
        String linkAttribute = tagInfo.getLinkAttribute();
        String lemmaAttribute = tagInfo.getLemmaAttribute();

        if (linkAttribute.isEmpty() || node.hasAttribute(linkAttribute)) return;

        String text = node.text().replaceAll("\"", "\\\\\"");
        String query = buildDictionaryQuery(text);

        try {
            SQLResult sqlResult = sql.query(query);
            if (sqlResult.size() == 0) return;
            SQLRecord row = sqlResult.get(0);

            node.attr(lemmaAttribute, row.getEntry("lemma").getValue());
            node.attr(linkAttribute, row.getEntry("link").getValue());
        } catch (SQLException ex) {
            Console.warn(query);
            throw ex;
        }
    }

    private void lookupTag(TextNode child, StringMatch knownEntities) {
        String innerText = child.getText();
        final NodeList newNodes = new NodeList();
//        String tagSourceAttr = context.getTagSourceAttribute();

        /* choose the largest matching known entity */
        OnAccept onAccept = (string, row) -> {
            String standardTag = row.getEntry("tag").getValue();
            TagInfo tagInfo = context.getTagInfo(standardTag);
            String schemaTag = tagInfo.getName();
            String linkAttribute = tagInfo.getLinkAttribute();
            String lemmaAttribute = tagInfo.getLemmaAttribute();
            
            if (!schema.isValid(child.getParent(), schemaTag)) {
                newNodes.add(new TextNode(string));
            } else {
                Node elementNode = new ElementNode(schemaTag, string);
                if (!lemmaAttribute.isEmpty()) elementNode.attr(lemmaAttribute, row.getEntry("lemma").getValue());
                if (!linkAttribute.isEmpty()) elementNode.attr(linkAttribute, row.getEntry("link").getValue());
                newNodes.add(elementNode);
//                elementNode.attr(tagSourceAttr, Constants.TAG_SRC_VAL_DICT);
            }
        };

        OnReject onReject = (string) -> {
            newNodes.add(new TextNode(string));
        };

        knownEntities.seekLine(innerText, onAccept, onReject);
        child.replaceWith(newNodes);
    }

    /**
     * Convert an xml node into an html node
     * @param node the node to wrap
     * @param allowEntities if false wrap all child tags as if they are non-entity tags
     * @throws ClassNotFoundException
     * @throws InstantiationException
     * @throws IllegalAccessException
     * @throws IOException
     * @throws SQLException
     */
    private void wrapNode(Node node) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {
        if (node.isType(NodeType.DOCTYPE)) {
            Node eNode = new ElementNode(HTML_TAGNAME);
            eNode.attr("class", HTML_DOCTYPE);
            DoctypeNode dNode = (DoctypeNode) node;
            eNode.attr(new Attribute(DOCTYPE_INNERTEXT, dNode.toString()));
            node.replaceWith(eNode);
            return;
        }

        JSONObject jsonObj = new JSONObject();
        for (Attribute attr : node.getAttributes()) {
            jsonObj.put(attr.getKey(), attr.getValue());
        }

        Node eNode = node;
        String schemaTag = node.name();        
        
        /* if the node is a tagged entity, copy the lemma / link attributes   */
        /* to the html node as data attributes. These are removed from the    */
        /* attribute object.  All remaining attributes are then removed from  */
        /* the node                                                           */
        if (context.isTagName(schemaTag)) {
            String standardTag = context.getStandardTag(schemaTag);
            TagInfo tagInfo = context.getTagInfo(standardTag);
            String lemmaAttribute = tagInfo.getLemmaAttribute();
            String linkAttribute = tagInfo.getLinkAttribute();            
            String lemmaValue = node.attr(lemmaAttribute);
            String linkValue = node.attr(linkAttribute);
            node.clearAttributes();
            node.attr(DATA_LEMMA, lemmaValue);
            node.attr(DATA_LINK, linkValue);
            jsonObj.remove(lemmaAttribute);
            jsonObj.remove(linkAttribute);
        } else {
            node.clearAttributes();
        }              

        if (node.isType(NodeType.INSTRUCTION)) {
            eNode = new ElementNode(HTML_TAGNAME);
            node.replaceWith(eNode);
            eNode.attr("class", HTML_PROLOG);
        } else if (context.isTagName(schemaTag)) {
            node.attr("class", HTML_ENTITY);
            for (Node child : eNode.childNodes()) {
                wrapNode(child);
            }
        } else {
            node.attr("class", HTML_NONENTITY);
            for (Node child : eNode.childNodes()) {
                wrapNode(child);
            }
        }

        /* save the xml tagname, either as the standard name if it's a tagged */ 
        /* entity, else as the declared name of the xml node                  */
        if (context.isTagName(schemaTag)) {
            String standardTag = context.getStandardTag(schemaTag);
            eNode.attr(ORG_TAGNAME, standardTag);
        } else {
            eNode.attr(ORG_TAGNAME, node.name());   
        }
        
        eNode.attr(XML_ATTR_LIST, jsonObj.toString());        
        eNode.name(HTML_TAGNAME);
    }

    private void processNER(Document doc) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        Query textNodes = doc.query(NodeType.TEXT);

        for (Node node : textNodes) {
            if (node.text().trim().isEmpty()) continue;
            
            /* skip nodes that are already tagged */
            NodeList ancestorNodes = node.ancestorNodes(NodeType.ELEMENT);
            if (ancestorNodes.testAny(nd -> {
                String nodeName = nd.name();
                return context.isTagName(nodeName);
            })) continue;

            NodeList nerList = applyNamedEntityRecognizer(node.text());
            
            /* for each element node in the list ensure the path is valid, otherwise convert it to a text node */
            for (int i = 0; i < nerList.size(); i++) {
                Node nerNode = nerList.get(i);
                if (!nerNode.isType(NodeType.ELEMENT)) continue;

                /* change the node name from standard to schema */
                TagInfo tagInfo = context.getTagInfo(nerNode.name());
                nerNode.name(tagInfo.getName());
                                
                if (!schema.isValid(node.getParent(), nerNode.name())) {
                    /* if the node isn't valid in the schema, remove markup */
                    TextNode textNode = new TextNode(nerNode.text());
                    nerList.set(i, textNode);                    
                } else {
                    /* if it is valid, set default lemma */
                    nerNode.attr(tagInfo.getLemmaAttribute(), nerNode.text());
                }
            }

            /* replace the current node with the node list */
            if (nerList.size() > 0) node.replaceWith(nerList);
        };
    }

    private NodeList applyNamedEntityRecognizer(String text) throws ParserConfigurationException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException {
        /* at least one alphabet character upper or lower case */
        String matchRegex = "([^a-zA-z]*[a-zA-z]+[^a-zA-z]*)+";

        /* if there is not at least one alphabet character, retuern an empty list */
        if (text == null || text.isEmpty() || !text.matches(matchRegex)) return new NodeList();

        /* classify the text and put it in a fragment tag */
        text = classifier.classify("<fragment>" + text + "</fragment>");
        if (text.isEmpty()) return new NodeList();

        /* create a document out of the text */
        Document localDoc = DocumentLoader.documentFromString(text);
//        NodeList nodes = localDoc.query("*");

        /* for each node in the document (from above) if it's an NER node     *
         * change it's tagname to a valid tag name occording to the context   *
         * and set it's lemma if it doesn't already have one.                 *
         * Ensure that the node has the default attributes, and note the tag  *
         * source.                                                            */
//        String tagSourceAttr = context.getTagSourceAttribute();
//        for (Node node : nodes) {
            /* if node name is an NER tag name */
            
//            if (context.isTagName(node.name(), NERMAP)) {
//                TagInfo tagInfo = context.getTagInfo(node.name(), NERMAP);
//                node.name(tagInfo.getName(NAME));
////                node.attr(tagSourceAttr, Constants.TAG_SRC_VAL_NER);
//                if (!tagInfo.getLemmaAttribute().isEmpty()) {
//                    Node eNode = (Node) node;
//                    eNode.attr(new Attribute(tagInfo.getLemmaAttribute(), eNode.text()));
//                }
//            }
//        }

        Node eNode = localDoc.childNodes().get(0);
        NodeList childNodes = eNode.childNodes();
        return childNodes;
    }
}
