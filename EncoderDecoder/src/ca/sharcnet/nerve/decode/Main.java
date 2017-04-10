package ca.sharcnet.nerve.decode;

import ca.sharcnet.nerve.Constants;
import ca.sharcnet.nerve.encoder.*;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.docnav.DocumentNavigator;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Schema;
import ca.sharcnet.nerve.docnav.selector.Select;
import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.sql.SQLException;
import java.util.zip.GZIPInputStream;
import javax.xml.parsers.ParserConfigurationException;

public class Main {

    public static void main(String... args) throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ClassifierException {
        String run = new ca.sharcnet.nerve.encoder.Main().run().toString();
        run = "<doc>\n" + run + "\n</doc>";
        Document encoded = DocumentNavigator.documentFromString(run);

        Select selected = encoded.select().attribute(Constants.CONTEXT_ATTRIBUTE);
        if (selected.isEmpty()) throw new RuntimeException("Context element not found.");
        ElementNode contextNode = (ElementNode) selected.get(0);
        encoded.removeChild(contextNode);
        System.out.println(encoded.toString());

        String contextPath = String.format("/resources/%s.context.json", contextNode.getAttributeValue(Constants.CONTEXT_ATTRIBUTE));
        Context context = ContextLoader.load(ca.sharcnet.nerve.encoder.Main.class.getResourceAsStream(contextPath));
        Document decoded = new Decoder().decode(encoded, context);

        System.out.println(decoded.toString());
    }

    public static String run() throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ClassifierException {
        InputStream resourceAsStream = Main.class.getResourceAsStream("/resources/newXMLDocument.xml");
        Document document = DocumentNavigator.documentFromStream(resourceAsStream);
        Context context = ContextLoader.load(Main.class.getResourceAsStream("/resources/orlando.context.json"));

        InputStream cStream = Main.class.getResourceAsStream("/resources/english.all.3class.distsim.crf.ser.gz");
        BufferedInputStream bis = new BufferedInputStream(new GZIPInputStream(cStream));
        Encoder encoder = new Encoder(document, context, null, new Classifier(bis));
        cStream.close();

        String schemaURL = context.schemaName;
        if (schemaURL != null && !schemaURL.isEmpty()) {
            InputStream schemaStream = new URL(schemaURL).openStream();
            Document schemaDocument = DocumentNavigator.documentFromStream(schemaStream);
            Schema schema = new Schema(schemaDocument);
            encoder.setSchema(schema);
        }

        Document encoded = encoder.encode();
        String s = encoded.toString();

        s = "<doc>" + s + "</doc>";

        System.out.println(s);
        return s;
    }
}
