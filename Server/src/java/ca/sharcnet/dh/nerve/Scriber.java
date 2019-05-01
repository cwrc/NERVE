package ca.sharcnet.dh.nerve;

import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.JSPrequel;
import ca.frar.jjjrmi.annotations.ServerSide;
import ca.frar.jjjrmi.annotations.Transient;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.frar.utility.console.Console;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import static ca.sharcnet.dh.scriber.Constants.SCHEMA_NODE_ATTR;
import static ca.sharcnet.dh.scriber.Constants.SCHEMA_NODE_NAME;
import ca.sharcnet.dh.scriber.dictionary.Dictionary;
import ca.sharcnet.dh.scriber.encoder.EncoderLink;
import ca.sharcnet.dh.scriber.encoder.EncoderManager;
import ca.sharcnet.dh.scriber.context.Context;
import ca.sharcnet.dh.scriber.context.ContextLoader;
import ca.sharcnet.dh.scriber.encoder.EncoderDictionary;
import ca.sharcnet.dh.scriber.encoder.EncoderHTML;
import ca.sharcnet.dh.scriber.encoder.EncoderNER;
import ca.sharcnet.dh.scriber.encoder.EncoderXML;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.query.Query;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchema;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchemaLoader;
import edu.stanford.nlp.ie.crf.CRFClassifier;
import edu.stanford.nlp.ling.CoreLabel;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.sql.SQLException;
import java.util.Properties;
import javax.servlet.ServletContext;
import javax.xml.parsers.ParserConfigurationException;

@JJJ()
@JSPrequel("const ArrayList = require ('jjjrmi').ArrayList;")
public class Scriber extends JJJObject {

    private ProgressListener progressListener;
    @Transient
    private Properties config = null;
    @Transient
    private Dictionary dictionary;
    @Transient
    private CRFClassifier<CoreLabel> classifier;
    @Transient
    private ServletContext servletContext;
    @Transient
    private final String CONTEXT_PATH = "/WEB-INF/";
    @Transient
    private final String DEFAULT_SCHEMA = CONTEXT_PATH + "default.rng";

    Scriber(Properties config, Dictionary dictionary, CRFClassifier<CoreLabel> classifier, ServletContext servletContext) {
        this.config = config;
        this.dictionary = dictionary;
        this.classifier = classifier;
        this.servletContext = servletContext;
    }

    public void setProgressListener(ProgressListener progressListener) {
        this.progressListener = progressListener;
    }

    private Scriber() {
    }

    private class ManagerTuple{
        Context context;
        EncoderManager manager;
        String schemaURL;
        
        ManagerTuple(EncoderManager manager, Context context, String schemaURL){
            this.context = context;
            this.manager = manager;
            this.schemaURL = schemaURL;
        }              
    }
    
    private ManagerTuple createManager(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        EncoderManager manager = new EncoderManager();
        Document document = DocumentLoader.documentFromString(source);
        manager.document(document);
        manager.dictionary(this.dictionary);
        Context context = this.getContext(document);
        manager.context(context);

        Query model = document.query(NodeType.INSTRUCTION).filter(SCHEMA_NODE_NAME);
        String schemaAttrValue = model.attr(SCHEMA_NODE_ATTR);

        if (schemaAttrValue.isEmpty()) {
            InputStream resourceAsStream = this.servletContext.getResourceAsStream(DEFAULT_SCHEMA);
            RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromStream(resourceAsStream);
            manager.schema(schema);
        } else {
            try{
                Console.log("************************************************");
                Console.log(schemaAttrValue);
                Console.log("************************************************");
                manager.schema(new URL(schemaAttrValue));
            } catch (javax.net.ssl.SSLHandshakeException ex){
                Console.log(ex.getMessage() + " " + schemaAttrValue);
                throw ex;
            }
        }

        return new ManagerTuple(manager, context, schemaAttrValue);
    }

    public Context getContext(Document document) throws IllegalArgumentException, IOException {
        /* retrieve the schema url to set the context */
        Query model = document.query(NodeType.INSTRUCTION).filter(SCHEMA_NODE_NAME);
        String schemaAttrValue = model.attr(SCHEMA_NODE_ATTR);

        if (!schemaAttrValue.isEmpty()) {
            int index = schemaAttrValue.lastIndexOf('/');
            schemaAttrValue = schemaAttrValue.substring(index);
        }

        /* Choose the context based on the schema delcared in the xml document */
        String path;
        switch (schemaAttrValue) {
            case "/orlando_biography_v2.rng":
                path = CONTEXT_PATH + "orlando.context.json";
                break;
            case "/cwrc_entry.rng":
                path = CONTEXT_PATH + "cwrc.context.json";
                break;
            case "/cwrc_tei_lite.rng":
                path = CONTEXT_PATH + "tei.context.json";
                break;
            default:
                path = CONTEXT_PATH + "default.context.json";
                break;
        }

        InputStream resourceAsStream = this.servletContext.getResourceAsStream(path);
        return ContextLoader.load(resourceAsStream);
    }

    @ServerSide
    public EncodeResponse ner(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        ManagerTuple createManager = this.createManager(source);        
        createManager.manager.addProcess(new EncoderNER(this.classifier));
        createManager.manager.run();
        
        return new EncodeResponse(
            createManager.manager.getDocument().toString(), 
            createManager.context.getSourceString(), 
            createManager.schemaURL
        );
    }


    @ServerSide
    public EncodeResponse link(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        ManagerTuple createManager = this.createManager(source);        
        createManager.manager.addProcess(new EncoderLink());
        createManager.manager.run();
        
        return new EncodeResponse(
            createManager.manager.getDocument().toString(), 
            createManager.context.getSourceString(), 
            createManager.schemaURL
        );
    }
    
    @ServerSide
    public EncodeResponse dictionary(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        ManagerTuple createManager = this.createManager(source);        
        createManager.manager.addProcess(new EncoderDictionary());
        createManager.manager.run();
        
        return new EncodeResponse(
            createManager.manager.getDocument().toString(), 
            createManager.context.getSourceString(), 
            createManager.schemaURL
        );
    }
    
    @ServerSide
    public EncodeResponse html(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        ManagerTuple createManager = this.createManager(source);        
        createManager.manager.addProcess(new EncoderHTML());
        createManager.manager.run();
        
        return new EncodeResponse(
            createManager.manager.getDocument().toString(), 
            createManager.context.getSourceString(), 
            createManager.schemaURL
        );
    }    
    
    @ServerSide
    public EncodeResponse decode(String source, String contextString) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        EncoderManager manager = new EncoderManager();
        Document document = DocumentLoader.documentFromString(source);
        manager.document(document);
        manager.dictionary(this.dictionary);
        Context context = ContextLoader.load(contextString);
        manager.context(context);        
        
        manager.addProcess(new EncoderXML());
        manager.run();
        
        return new EncodeResponse(
            manager.getDocument().toString(), 
            context.getSourceString(), 
            null
        );
    }
}