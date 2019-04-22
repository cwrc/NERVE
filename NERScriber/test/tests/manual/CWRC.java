package tests.manual;
import ca.sharcnet.dh.scriber.encoder.EncoderBase;
import ca.sharcnet.dh.scriber.encoder.EncoderDictionary;
import ca.sharcnet.dh.scriber.encoder.EncoderManager;
import ca.sharcnet.dh.scriber.encoder.EncoderNER;
import ca.sharcnet.dh.scriber.encoder.IEncoder;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

public class CWRC {
    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, InstantiationException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, IllegalArgumentException, ScriptException, NoSuchMethodException {
    try {
            File file = new File("./test/tests/documents/cwrc.xml");
            FileInputStream fileInputStream = new FileInputStream(file);
            Document document = DocumentLoader.documentFromStream(fileInputStream);
            
            EncoderManager manager = new EncoderManager();
            manager.document(document);
            manager.schema("cwrc_entry.rng");
            manager.context("cwrc.context.json");
            manager.classifier();
            manager.addProcess(new EncoderNER());            
//            manager.setup(new EncoderDictionary());            
            manager.run();
            
            System.out.print(document);
            
        } catch (IOException ex) {
            Logger.getLogger(CWRC.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}