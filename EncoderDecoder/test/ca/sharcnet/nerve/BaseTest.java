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
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.zip.GZIPInputStream;
import javax.xml.parsers.ParserConfigurationException;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author edward
 */
public class BaseTest implements HasStreams{

    @Override
    public InputStream getResourceStream(String path) {
        InputStream resourceAsStream = this.getClass().getResourceAsStream("/resources/" + path);
        if (resourceAsStream == null) throw new NullPointerException(path + " not found");
        return resourceAsStream;
    }

//    @Test
//    public void load_empty() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ClassifierException, ParserConfigurationException{
//        Document document = DocumentLoader.documentFromStream(this.getResourceStream("/doc/test0.xml"));
//        Encoder.encode(document, this);
//    }

//    @Test
//    public void load_test_document_noSQL_noNER() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ClassifierException, ParserConfigurationException{
//        Document document = DocumentLoader.documentFromStream(this.getResourceStream("/doc/test1.xml"));
//        Context context = ContextLoader.load(getResourceStream("contexts/test.context.json"));
//        Encoder encoder = new Encoder(document, context, null, null);
//        Document encoded = encoder.encode();
//        Console.log(encoded);
//    }

    @Test
    public void load_test_document_noNER() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ClassifierException, ParserConfigurationException{
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