package tests.manual;

import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.dictionary.Dictionary;
import ca.sharcnet.dh.scriber.encoder.ServiceModuleBase;
import ca.sharcnet.dh.scriber.encoder.servicemodules.EncoderXML;
import ca.sharcnet.dh.scriber.encoder.servicemodules.EncoderDictAll;
import ca.sharcnet.dh.scriber.encoder.servicemodules.EncoderHTML;
import ca.sharcnet.dh.scriber.encoder.servicemodules.EncoderDictLink;
import ca.sharcnet.dh.scriber.encoder.EncoderManager;
import ca.sharcnet.dh.scriber.encoder.servicemodules.EncoderNER;
import ca.sharcnet.dh.scriber.encoder.IEncoder;
import ca.sharcnet.dh.sql.SQL;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchema;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchemaLoader;
import edu.stanford.nlp.ie.crf.CRFClassifier;
import edu.stanford.nlp.ling.CoreLabel;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.logging.log4j.LogManager;

public class Bare {
    public final static String PATH = "english.all.3class.distsim.crf.ser.gz";
    final static org.apache.logging.log4j.Logger LOGGER = LogManager.getLogger(Bare.class);

    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, InstantiationException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, IllegalArgumentException, ScriptException, NoSuchMethodException, DocumentParseException {
        try {
            InputStream configStream = ClassLoader.getSystemResourceAsStream("config.txt");
            Properties configProperties = new Properties();
            configProperties.load(configStream);
            SQL sql = new SQL(configProperties);
            Dictionary dictionary = new Dictionary(sql);
            dictionary.verifySQL();

            File file = new File("./test/tests/documents/bare.xml");
            FileInputStream fileInputStream = new FileInputStream(file);
            Document document = DocumentLoader.documentFromStream(fileInputStream);

            EncoderManager manager = new EncoderManager();
            manager.document(document);
            
            try (final InputStream resourceAsStream = ClassLoader.getSystemResourceAsStream("default.rng")) {
                RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromStream(resourceAsStream);
                manager.setSchema(schema);
            }            
                       
            manager.context("default.context.json");
            manager.dictionary(dictionary);
            
//            CRFClassifier<CoreLabel> classifier = CRFClassifier.getClassifier(PATH);
//            manager.classifier(classifier);
//            manager.setup(new EncoderNER());            
//            manager.setup(new EncoderDictionary());
            manager.addProcess(new EncoderHTML());
            
             manager.addProcess(new ServiceModuleBase() {
                @Override
                public void run() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
                    System.out.println("here");
                    System.out.print(this.document);
                }
            });
            
            manager.addProcess(new EncoderXML());
            manager.run();
            
            System.out.print(document);

        } catch (IOException ex) {
            Logger.getLogger(Bare.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}
