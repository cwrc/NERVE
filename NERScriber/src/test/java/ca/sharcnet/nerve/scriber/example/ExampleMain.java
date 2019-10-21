package ca.sharcnet.nerve.scriber.example;

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
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

public class ExampleMain {
    static String documentFilename = "src/test/resources/xml/int/orlando_biography_template.xml";
    static String schemaFilename = "src/test/resources/default.rng";
    static String contextFilename = "src/test/resources/default.context.json";
    static String configFilename = "src/test/resources/config.properties";

    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, SAXException, TransformerException, InterruptedException {

        /* Load properties/configuration file */
        File configFile = new File(configFilename);
        if (!configFile.exists()) throw new RuntimeException("File not found: " + configFile.getCanonicalPath());
        Properties properties = new Properties();
        properties.load(new FileInputStream(configFile));

        /* Start NER server */
        int port = Integer.parseInt(properties.getProperty("ner.port"));
        StandaloneNER standaloneNER = new StandaloneNER(properties.getProperty("classifier"));

        Runnable nerServer = new Runnable() {
            public void run() {
                try {
                    standaloneNER.start(port);
                } catch (IOException | ClassCastException | ClassNotFoundException ex) {
                    Logger.getLogger(ExampleMain.class.getName()).log(Level.SEVERE, null, ex);
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

    static void output(Node node) throws TransformerConfigurationException, TransformerException {
//         Use a Transformer for output
        TransformerFactory tFactory = TransformerFactory.newInstance();
        Transformer transformer = tFactory.newTransformer();

        DOMSource source = new DOMSource(node);
        StreamResult result = new StreamResult(System.out);
        transformer.transform(source, result);
    }
}
