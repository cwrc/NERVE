package ca.sharcnet.nerve;
import ca.fa.utility.Console;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.encoder.Encoder;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.parsers.ParserConfigurationException;

public class Main implements HasStreams, IsMonitor{

    public static void main(String[] args){
        try {
            new Main().run();
        } catch (Exception ex) {
            Logger.getLogger(Main.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @Override
    public InputStream getResourceStream(String path) {
        InputStream resourceAsStream = this.getClass().getResourceAsStream("/resources/" + path);
        if (resourceAsStream == null) throw new NullPointerException(path + " not found");
        return resourceAsStream;
    }

    public void run() throws IllegalArgumentException, IOException, FileNotFoundException, ClassCastException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        Document d2 = DocumentLoader.documentFromStream(this.getResourceStream("/doc/TEI.xml"));
//        Document d2 = DocumentLoader.documentFromStream(this.getResourceStream("/doc/minimalOrlando.xml"));
        Document encoded = Encoder.encode(d2, this, null);
        Console.log(encoded.toString());
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
