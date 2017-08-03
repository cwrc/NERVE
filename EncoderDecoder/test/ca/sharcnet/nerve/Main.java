package ca.sharcnet.nerve;
import ca.sharcnet.utility.Console;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.decode.Decoder;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.encoder.ClassifierException;
import ca.sharcnet.nerve.encoder.Encoder;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.parsers.ParserConfigurationException;

public class Main  implements HasStreams, IsMonitor{

    @Override
    public InputStream getResourceStream(String path) {
        InputStream resourceAsStream = this.getClass().getResourceAsStream("/resources/" + path);
        if (resourceAsStream == null) throw new NullPointerException(path + " not found");
        return resourceAsStream;
    }

    public static void main(String[] args){
        try {
            new Main().run();
        } catch (Exception ex) {
            Logger.getLogger(Main.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public void run() throws IllegalArgumentException, IOException, ClassifierException, FileNotFoundException, ClassCastException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        Document document = DocumentLoader.documentFromStream(this.getResourceStream("/doc/minimalOrlando.xml"));
        assert(document != null);
        Document encoded = Encoder.encode(document, this, this);
        assert(encoded != null);
        Console.log(encoded);
    }

    @Override
    public void phase(String phase, int i, int phaseMax) {
        Console.log("phase " + phase + " " + i + "/" + phaseMax);
    }

    @Override
    public void step(int step, int stepMax) {
        Console.log("step " + step + "/" + stepMax);
    }
}
