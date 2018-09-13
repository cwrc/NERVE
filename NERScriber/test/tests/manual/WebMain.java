package tests.manual;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.HasStreams;
import ca.sharcnet.dh.scriber.ProgressListener;
import ca.sharcnet.dh.scriber.ProgressPacket;
import ca.sharcnet.dh.scriber.decode.Decoder;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

public class WebMain implements HasStreams,ProgressListener {
    static String filename = "documents/webDoc.xml";

    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, InstantiationException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, IllegalArgumentException, ScriptException, NoSuchMethodException {
        WebMain main = new WebMain();
        Document doc = DocumentLoader.documentFromStream(main.getResourceStream(filename));
//        EncodeOptions encodeOptions = new EncodeOptions();        
//        encodeOptions.addProcess(EncodeProcess.NER);
        
//        EncodedDocument encoded = Encoder.encode(doc, main, encodeOptions, main);
//        Console.log(encoded);

        Console.log(doc);
        Document decoded = Decoder.decode(doc, main, main);
        Console.log(decoded);
    }

    @Override
    public InputStream getResourceStream(String path) {
        try {
            File file = new File("./resources" + "/" + path);
            return new FileInputStream(file);
        } catch (IOException ex) {
            Logger.getLogger(WebMain.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }

    @Override
    public void notifyProgress(ProgressPacket packet) {
        Console.log(packet);
    }
}