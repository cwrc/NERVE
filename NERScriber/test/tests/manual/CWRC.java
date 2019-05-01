package tests.manual;
import ca.sharcnet.dh.scriber.encoder.EncoderBase;
import ca.sharcnet.dh.scriber.encoder.EncoderDictAll;
import ca.sharcnet.dh.scriber.encoder.EncoderManager;
import ca.sharcnet.dh.scriber.encoder.EncoderNER;
import ca.sharcnet.dh.scriber.encoder.IEncoder;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchema;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchemaLoader;
import edu.stanford.nlp.ie.crf.CRFClassifier;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

public class CWRC {
    public final static String PATH = "english.all.3class.distsim.crf.ser.gz";
    
    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, InstantiationException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, IllegalArgumentException, ScriptException, NoSuchMethodException, DocumentParseException {
    try {
            File file = new File("./test/tests/documents/cwrc.xml");
            FileInputStream fileInputStream = new FileInputStream(file);
            Document document = DocumentLoader.documentFromStream(fileInputStream);
            
            EncoderManager manager = new EncoderManager();
            manager.document(document);
            try (final InputStream resourceAsStream = ClassLoader.getSystemResourceAsStream("cwrc_entry.rng")) {
                RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromStream(resourceAsStream);
                manager.setSchema(schema);
            }                    
            manager.context("cwrc.context.json");            
                        
            EncoderNER encoderNER = new EncoderNER(CRFClassifier.getClassifier(PATH));
            
            manager.addProcess(encoderNER);            
            manager.run();
            
            System.out.print(document);
            
        } catch (IOException ex) {
            Logger.getLogger(CWRC.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}