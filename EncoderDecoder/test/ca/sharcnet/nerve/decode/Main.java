package ca.sharcnet.nerve.decode;
import ca.sharcnet.nerve.decode.*;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.encoder.*;
import ca.sharcnet.nerve.docnav.DocumentNavigator;
import ca.sharcnet.nerve.docnav.dom.Document;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;

public class Main implements HasStreams{

    public static void main(String ... args) throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ClassifierException {
        Main main = new Main();
        Document document = DocumentNavigator.documentFromStream(main.getInputStream());
        Document encoded = Encoder.encode(document, main);
        String asString = "<doc>\n" + encoded.toString() + "\n</doc>";
        encoded = DocumentNavigator.documentFromString(asString);
        Document decoded = Decoder.decode(encoded, main);
        System.out.println(decoded.toString());
    }

    public InputStream getInputStream() {
        return this.getClass().getResourceAsStream("/resources/orlando/orlando_no_tags.xml");
    }

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }
}
