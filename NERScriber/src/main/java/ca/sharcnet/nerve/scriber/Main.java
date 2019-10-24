package ca.sharcnet.nerve.scriber;

import ca.sharcnet.nerve.scriber.context.*;
import ca.sharcnet.nerve.scriber.dictionary.Dictionary;
import ca.sharcnet.nerve.scriber.encoder.EncoderManager;
import ca.sharcnet.nerve.scriber.encoder.servicemodules.EncoderDictLink;
import ca.sharcnet.nerve.scriber.encoder.servicemodules.EncoderNER;
import ca.sharcnet.nerve.scriber.ner.RemoteClassifier;
import ca.sharcnet.nerve.scriber.ner.StandaloneNER;
import ca.sharcnet.nerve.scriber.query.Query;
import ca.sharcnet.nerve.scriber.schema.*;
import ca.sharcnet.nerve.scriber.sql.SQL;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Properties;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;
import org.xml.sax.SAXException;

public class Main {

    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger("Main");
    static String documentFilename = "";
    static String configFilename = "config.properties";
    static String contextFilename = "";
    static boolean link = false;
    static boolean ner = false;
    
    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, SAXException, TransformerException, InterruptedException {
        if (!readArgs(args)) {
            printHelp();
            return;
        }

        LOGGER.debug("document: " + new File(documentFilename).getAbsolutePath());
        LOGGER.debug("configuration: " + new File(configFilename).getAbsolutePath());
        LOGGER.debug("context: " + new File(contextFilename).getAbsolutePath());

        /* Load properties/configuration file */
        File configFile = new File(configFilename);
        if (!configFile.exists()) throw new RuntimeException("File not found: " + configFile.getCanonicalPath());
        Properties properties = new Properties();
        properties.load(new FileInputStream(configFile));

        /* Start NER server */
        int port = Integer.parseInt(properties.getProperty("ner.port"));
        String classifierPath = properties.getProperty("classifier");
        StandaloneNER standaloneNER = new StandaloneNER(classifierPath, port);
        Thread nerThread = new Thread(standaloneNER);
        nerThread.start();
        standaloneNER.waitForReady();

        try {
            run(properties);
        } catch (FileNotFoundException ex) {
            System.out.println(ex.getMessage());
        } finally {
            standaloneNER.stop();
        }

    }

    private static void run(Properties properties) throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException, SAXException, ParserConfigurationException {
        /* Create dictionary */
        String dbURL = properties.getProperty("databaseURL");
        String dbPath = properties.getProperty("databasePath");
        String realPath = new File(dbPath).getAbsolutePath();
        String dbDriver = properties.getProperty("databaseDriver");

        SQL sql = new SQL(dbDriver, dbURL + realPath);
        Dictionary dictionary = new Dictionary(sql);
        dictionary.setTable("demonstration");
        dictionary.verifySQL();

        /* Load the document */
        File documentFile = new File(documentFilename);
        if (!documentFile.exists()) throw new FileNotFoundException("File not found: " + documentFile.getCanonicalPath());
        Query document = new Query(new FileInputStream(documentFile));

        /* Discover context file (if not specified) */
        String contextPath = properties.getProperty("context.path") + "/";
        if (contextFilename.isBlank()) {                        
            contextFilename = contextPath + "default.context.json";
            Query instrNodes = document.select(":inst").filter("xml-model");
            
            if (!instrNodes.isEmpty()) {
                String hrefAttr = document.select(":inst").attribute("href");
                if (hrefAttr.contains("cwrc.ca/schemas/orlando_biography_v2.rng")) {
                    contextFilename = contextPath + "orlando.context.json";
                } else if (hrefAttr.contains("cwrc.ca/schemas/cwrc_tei_lite.rng")) {
                    contextFilename = contextPath + "tei.context.json";
                } else if (hrefAttr.contains("cwrc.ca/schemas/cwrc_entry.rng")) {
                    contextFilename = contextPath + "cwrc.context.json";
                }
            }
        }

        /* Load the context */
        File contextFile = new File(contextFilename);
        if (!contextFile.exists()) throw new FileNotFoundException("File not found: " + contextFile.getCanonicalPath());
        Context context = ContextLoader.load(new FileInputStream(contextFile));

        /* Load the remote schema (use default.rng from context directory if none found) */
        Query xmlModelInstruction = document.select(":inst").filter("xml-model");
        RelaxNGSchema schema = null;
        Query instrNodes = document.select(":inst").filter("xml-model");            
        if (!instrNodes.isEmpty()) schema = RelaxNGSchemaLoader.schemaFromURL(xmlModelInstruction.attribute("href"));
        else schema = RelaxNGSchemaLoader.schemaFromFile(new File(contextPath + "default.rng"));

        /* Setup the manager */
        EncoderManager manager = new EncoderManager();
        manager.setDocument(document);
        manager.setSchema(schema, "");
        manager.setContext(context);
        manager.addDictionary(dictionary);

        /* Add ner process to manager */
        if (ner){
            int port = Integer.parseInt(properties.getProperty("ner.port"));
            RemoteClassifier remoteClassifier = new RemoteClassifier(port);
            manager.addProcess(new EncoderNER(remoteClassifier));
        }
        
        /* Add link process to manager */
        if (link){
            manager.addProcess(new EncoderDictLink());
        }

        /* Execute the process */
        manager.run();
        Query result = manager.getQuery();
        result.toStream(System.out);
    }

    /**
     * Convert arguments from command line.
     *
     * @param args
     * @return true if arguments valid
     */
    private static boolean readArgs(String[] args) {
        int i = 0;
        for (i = 0; i < args.length; i++) {
            String arg = args[i];
            switch (arg) {
                case "-h":
                case "--help":
                    return false;
                case "-c":
                    if (i == args.length - 1) return false;
                    configFilename = args[++i];
                    break;
                case "-x":
                    if (i == args.length - 1) return false;
                    contextFilename = args[++i];
                    break;
                case "--ner":
                    ner = true;
                    break;                    
                case "--link":
                    link = true;
                    break;                                        
                default:
                    if (i != args.length - 1) return false;
                    documentFilename = args[args.length - 1];
            }

            LOGGER.debug(arg + " " + contextFilename);
        }

        return !documentFilename.isBlank();
    }

    private static void printHelp() {
        System.out.println("usage: nerscriber [-c config_file] [-x context_file] input_file");
        System.out.println("");
        System.out.println("Options:");
        System.out.println("-c\t\tspecify the configuration file (default: ./config.properties)");
        System.out.println("-x\t\tspecify the context file, (default: auto-detect from 'context.path' in config)");
    }
}
