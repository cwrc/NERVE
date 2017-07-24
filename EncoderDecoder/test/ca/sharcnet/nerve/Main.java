package ca.sharcnet.nerve;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.decode.Decoder;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.encoder.Classifier;
import ca.sharcnet.nerve.encoder.ClassifierException;
import ca.sharcnet.nerve.encoder.Encoder;
import java.io.BufferedInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.GZIPInputStream;
import javax.xml.parsers.ParserConfigurationException;

public class Main  implements HasStreams{

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
        Document document = DocumentLoader.documentFromStream(this.getResourceStream("/doc/test2.xml"));

        Context context = ContextLoader.load(getResourceStream("contexts/test.context.json"));
        InputStream cStream = getResourceStream("english.all.3class.distsim.crf.ser.gz");
        BufferedInputStream bis = new BufferedInputStream(new GZIPInputStream(cStream));
        Classifier classifier = new Classifier(bis);
        cStream.close();

        Encoder encoder = new Encoder(document, context, null, classifier);
        Document encoded = encoder.encode();
        Console.log(encoded);

        Console.log("\n\n");

        Document decoded = Decoder.decode(encoded, this);
        Console.log(decoded);
    }
}
