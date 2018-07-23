package tests.manual;
import ca.frar.utility.console.Console;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.ProgressListener;
import ca.sharcnet.nerve.ProgressPacket;
import ca.sharcnet.nerve.decode.Decoder;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.encoder.EncodeOptions;
import ca.sharcnet.nerve.encoder.EncodeProcess;
import ca.sharcnet.nerve.encoder.EncodedDocument;
import ca.sharcnet.nerve.encoder.Encoder;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

public class Main implements HasStreams,ProgressListener {
    static String filename = "D:/nerve-temp/testFiles/minimalOrlando.xml";

    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, InstantiationException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, IllegalArgumentException, ScriptException, NoSuchMethodException {
        Main main = new Main();
        Document doc = DocumentLoader.documentFromStream(new FileInputStream(filename));
        EncodeOptions encodeOptions = new EncodeOptions();      
        encodeOptions.addProcess(EncodeProcess.NER); /* works */
        
        EncodedDocument encoded = Encoder.encode(doc, main, encodeOptions, main);
        Console.log(encoded);
        Document decoded = Decoder.decode(encoded, main, main);
        Console.log(decoded);
    }

    @Override
    public InputStream getResourceStream(String path) {
        try {
            File file = new File("./resources" + "/" + path);
            return new FileInputStream(file);
        } catch (IOException ex) {
            Logger.getLogger(Main.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }

    @Override
    public void notifyProgress(ProgressPacket packet) {
        Console.log(packet);
    }
}