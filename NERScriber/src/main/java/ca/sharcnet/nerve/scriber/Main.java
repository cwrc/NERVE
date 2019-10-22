package ca.sharcnet.nerve.scriber;
import ca.sharcnet.nerve.scriber.context.*;
import ca.sharcnet.nerve.scriber.dictionary.Dictionary;
import ca.sharcnet.nerve.scriber.encoder.EncoderManager;
import ca.sharcnet.nerve.scriber.encoder.servicemodules.EncoderNER;
import ca.sharcnet.nerve.scriber.ner.RemoteClassifier;
import ca.sharcnet.nerve.scriber.ner.StandaloneNER;
import ca.sharcnet.nerve.scriber.query.Query;
import ca.sharcnet.nerve.scriber.schema.*;
import ca.sharcnet.nerve.scriber.sql.SQL;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;
import org.xml.sax.SAXException;

public class Main {
    static String documentFilename = "src/test/resources/xml/int/orlando_biography_template.xml";
    static String configFilename = "config.properties";
    static String contextFilename = "";
    
    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, SAXException, TransformerException, InterruptedException {
        if (!readArgs(args)){
            printHelp();
            return;
        }

        /* Load properties/configuration file */
        File configFile = new File(configFilename);
        if (!configFile.exists()) throw new RuntimeException("File not found: " + configFile.getCanonicalPath());
        Properties properties = new Properties();
        properties.load(new FileInputStream(configFile));

        /* Start NER server */
        int port = Integer.parseInt(properties.getProperty("ner.port"));
        String classifierPath = properties.getProperty("classifier");
        StandaloneNER standaloneNER = new StandaloneNER(classifierPath, port);

        Runnable nerServer = new Runnable() {
            public void run() {
                try {
                    standaloneNER.start();
                } catch (IOException | ClassCastException | ClassNotFoundException ex) {
                    Logger.getLogger(Main.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        };
        new Thread(nerServer).start();
        Thread.sleep(3000); // give the server time to start

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
        if (!documentFile.exists()) throw new RuntimeException("File not found: " + documentFile.getCanonicalPath());
        Query document = new Query(new FileInputStream(documentFile));

        /* Load the context */
        File contextFile = new File(contextFilename);
        if (!contextFile.exists()) throw new RuntimeException("File not found: " + contextFile.getCanonicalPath());
        Context context = ContextLoader.load(new FileInputStream(contextFile));

        /* Load the remote schema */
        Query xmlModelInstruction = document.select(":inst").filter("xml-model");
        RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromURL(xmlModelInstruction.attribute("href"));

        /* Setup the manager */
        EncoderManager manager = new EncoderManager();
        manager.setDocument(document);
        manager.setSchema(schema, "");
        manager.setContext(context);
        manager.addDictionary(dictionary);

        /* Add process to manager */
        RemoteClassifier remoteClassifier = new RemoteClassifier(port);
        manager.addProcess(new EncoderNER(remoteClassifier));
        
        /* Execute the process */
        manager.run();
        Query result = manager.getQuery();
        standaloneNER.stop();
        result.toStream(System.out);
    }

    /**
     * Convert arguments from command line.
     * @param args
     * @return true if arguments valid
     */
    private static boolean readArgs(String[] args) {
        int i = 0;
        for (i = 0; i < args.length; i++){
            String arg = args[i];
            switch (arg){
                case "-h":           
                case "--help":
                    printHelp();
                    break;
                case "-c":           
                    if (i == args.length - 1) return false;
                    configFilename = args[++i];
                break;
                case "-x":           
                    if (i == args.length - 1) return false;
                    contextFilename = args[++i];
                break;  
                default:
                if (i == args.length - 1) return false;
                documentFilename = args[args.length - 1];  
            }
        }
        
        return !documentFilename.isBlank();
    }
    
    private static void printHelp(){
        System.out.println("NERScriber usage:");
        System.out.println("nerscriber [-c config_file] [-x context_file] input_file");
        System.out.println("-c\nspecify the configuration file, if not provided will look for config.properties in the current directory.");
        System.out.println("-x\nspecify the context file, if not provided will auto-detect context and look for the file in the context.path directory as specfied in the config file.");
        System.out.println("input_file\nthe file to process.");
    }
}
