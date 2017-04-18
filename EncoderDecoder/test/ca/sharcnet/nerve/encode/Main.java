package ca.sharcnet.nerve.encode;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.encoder.ClassifierException;
import ca.sharcnet.nerve.encoder.Encoder;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;

public class Main implements HasStreams{

    public static void main(String... args) throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ClassifierException {
        Main main = new Main();
        Document document = DocumentLoader.documentFromStream(main.getInputStream());
        Document encoded = Encoder.encode(document, main);
        System.out.println(encoded);
    }

    public InputStream getInputStream() {
//        return this.getClass().getResourceAsStream("/resources/orlando/tei_no_tags.xml");
//        return this.getClass().getResourceAsStream("/resources/orlando/orlando_no_tags.xml");
//        return this.getClass().getResourceAsStream("/resources/orlando/minimal.orlando.xml");
        return this.getClass().getResourceAsStream("/resources/orlando/minimal.tei.xml");
    }

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }
}
