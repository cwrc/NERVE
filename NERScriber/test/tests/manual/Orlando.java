package tests.manual;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.context.Context;
import ca.sharcnet.dh.scriber.context.ContextException;
import ca.sharcnet.dh.scriber.context.TagInfo;
import ca.sharcnet.dh.scriber.encoder.EncodeProcess;
import ca.sharcnet.dh.scriber.encoder.EncodedDocument;
import ca.sharcnet.dh.scriber.encoder.EncoderNER;
import ca.sharcnet.docnav.StartNodeException;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URL;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

public class Orlando {
    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, InstantiationException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, IllegalArgumentException, ScriptException, NoSuchMethodException {
        try {
            File file = new File("./test/tests/documents/minimalOrlando.xml");
            FileInputStream fileInputStream = new FileInputStream(file);
            Document document = DocumentLoader.documentFromStream(fileInputStream);
            EncoderNER encoderNER = new EncoderNER();
            encoderNER.document(document);
            
            encoderNER.schema(new URL("https://cwrc.ca/schemas/orlando_biography_v2.rng"));
            encoderNER.context("orlando.context.json");
            encoderNER.classifier();
            encoderNER.run();
            
            System.out.print(document);
            
        } catch (IOException ex) {
            Logger.getLogger(Orlando.class.getName()).log(Level.SEVERE, null, ex);
        }

    }
}