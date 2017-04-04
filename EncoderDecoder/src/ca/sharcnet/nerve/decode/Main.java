package ca.sharcnet.nerve.decode;

import ca.sharcnet.nerve.encoder.*;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.docnav.DocumentNavigator;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.Schema;
import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.sql.SQLException;
import java.util.zip.GZIPInputStream;
import javax.xml.parsers.ParserConfigurationException;

public class Main {

    public static void main(String... args) throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ClassifierException {
        String run = ca.sharcnet.nerve.encoder.Main.run();
        run = "<doc>\n" + run + "\n</doc>";
        Document doc = DocumentNavigator.documentFromString(run);
        Decoder decoder = new Decoder();
        decoder.decode(doc, System.out);

//            InputStream stream = Main.class.getResourceAsStream("/resources/newXMLDocument.xml");
//            Document doc = DocumentNavigator.documentFromStream(stream);
//            System.out.println(doc);
    }

    public static String run() throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ClassifierException {
        InputStream resourceAsStream = Main.class.getResourceAsStream("/resources/newXMLDocument.xml");
        Document document = DocumentNavigator.documentFromStream(resourceAsStream);
        Context context = ContextLoader.load(Main.class.getResourceAsStream("/resources/orlando.context.json"));

        InputStream cStream = Main.class.getResourceAsStream("/resources/english.all.3class.distsim.crf.ser.gz");
        BufferedInputStream bis = new BufferedInputStream(new GZIPInputStream(cStream));
        Encoder encoder = new Encoder(document, context, new Classifier(bis));
        cStream.close();

        String schemaURL = context.getSchema();
        if (schemaURL != null && !schemaURL.isEmpty()) {
            InputStream schemaStream = new URL(schemaURL).openStream();
            Document schemaDocument = DocumentNavigator.documentFromStream(schemaStream);
            Schema schema = new Schema(schemaDocument);
            encoder.setSchema(schema);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        encoder.encode(baos);
        String s = baos.toString();

        s = "<doc>" + s + "</doc>";

        System.out.println(s);
        Document d = DocumentNavigator.documentFromString(s);
        return "";
    }
}
