package tests.manual;

import ca.frar.utility.console.Console;
import static ca.sharcnet.dh.scriber.Constants.SCHEMA_NODE_ATTR;
import static ca.sharcnet.dh.scriber.Constants.SCHEMA_NODE_NAME;
import ca.sharcnet.dh.scriber.context.Context;
import ca.sharcnet.dh.scriber.context.ContextLoader;
import ca.sharcnet.dh.scriber.dictionary.Dictionary;
import ca.sharcnet.dh.scriber.encoder.ServiceModuleBase;
import ca.sharcnet.dh.scriber.encoder.servicemodules.EncoderDictAll;
import ca.sharcnet.dh.scriber.encoder.EncoderManager;
import ca.sharcnet.dh.scriber.encoder.servicemodules.EncoderNER;
import ca.sharcnet.dh.scriber.encoder.IEncoder;
import ca.sharcnet.dh.sql.SQL;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.query.Query;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchema;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchemaLoader;
import edu.stanford.nlp.ie.crf.CRFClassifier;
import edu.stanford.nlp.ling.CoreLabel;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.GZIPInputStream;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.logging.log4j.LogManager;

public class MinimalOrlando {
    final static org.apache.logging.log4j.Logger LOGGER = LogManager.getLogger(MinimalOrlando.class);
    public final static String PATH = "english.all.3class.distsim.crf.ser.gz";
    static Dictionary dictionary = null;
    static CRFClassifier<CoreLabel> classifier = null;
    
    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, InstantiationException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, IllegalArgumentException, ScriptException, NoSuchMethodException, DocumentParseException {
        MinimalOrlando minimalOrlando = new MinimalOrlando();
        minimalOrlando.initClassifier();
        minimalOrlando.initDictionary();
        minimalOrlando.run();
    }

    public void run(){
        try {           
            File file = new File("./test/tests/documents/minimalOrlando.xml");
            FileInputStream fileInputStream = new FileInputStream(file);
            Document document = DocumentLoader.documentFromStream(fileInputStream);
            EncoderManager manager = this.createManager(document);
            manager.document(document);
            manager.addProcess(new EncoderNER(MinimalOrlando.classifier));
            
            manager.run();
        } catch (IOException | DocumentParseException | ClassNotFoundException | InstantiationException | IllegalAccessException | SQLException | ParserConfigurationException ex) {
            Logger.getLogger(MinimalOrlando.class.getName()).log(Level.SEVERE, null, ex);
        }        
    }
    
    EncoderManager createManager(Document document) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, DocumentParseException {
        EncoderManager manager = new EncoderManager();
        manager.document(document);
        manager.dictionary(MinimalOrlando.dictionary);
        Context context = this.getContext(document);
        manager.context(context);

        Query model = document.query(NodeType.INSTRUCTION).filter(SCHEMA_NODE_NAME);
        String schemaAttrValue = model.attr(SCHEMA_NODE_ATTR);

        Console.log(schemaAttrValue);
        manager.setSchemaUrl(schemaAttrValue);
        
        URL url = new URL(schemaAttrValue);
            
        try (final InputStream resourceAsStream = url.openStream()) {
            RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromStream(resourceAsStream);
            if (resourceAsStream == null){
                LOGGER.error("Can not resolve: " + schemaAttrValue);
            }
            manager.setSchema(schema);
        }

        return manager;
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
                path = "/orlando.context.json";
                break;
            case "/cwrc_entry.rng":
                path = "/cwrc.context.json";
                break;
            case "/cwrc_tei_lite.rng":
                path = "/tei.context.json";
                break;
            default:
                path = "/default.context.json";
                break;
        }

        InputStream resourceAsStream = this.getClass().getResourceAsStream(path);
        return ContextLoader.load(resourceAsStream);
    }

    void initClassifier() throws IOException, ClassCastException, ClassNotFoundException {
        if (MinimalOrlando.classifier != null) {
            return;
        }
        LOGGER.info("loading classifier ...");
        String classifierPath = "/english.all.3class.distsim.crf.ser.gz";
        InputStream in = this.getClass().getResourceAsStream(classifierPath);
        GZIPInputStream gzip = new GZIPInputStream(in);
        MinimalOrlando.classifier = CRFClassifier.getClassifier(gzip);
        in.close();
        LOGGER.info("classifier loaded");
    }

    void initDictionary() throws FileNotFoundException, IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException {
        if (MinimalOrlando.dictionary != null) {
            return;
        }

        InputStream configStream = this.getClass().getResourceAsStream("/config.properties");

        LOGGER.info("loading configuration ...");
        Properties config = new Properties();
        config.load(configStream);
        configStream.close();
        LOGGER.info("configuration loaded");

        LOGGER.info("loading sql ...");
        SQL sql = new SQL(config);
        LOGGER.info("SQL loaded");

        LOGGER.info("loading dictionary ...");
        MinimalOrlando.dictionary = new Dictionary(sql);
        LOGGER.info("dictionary loaded");

        LOGGER.info("verifying dictionary ...");
        MinimalOrlando.dictionary.verifySQL();
        LOGGER.info("dictionary verified");
    }
}
