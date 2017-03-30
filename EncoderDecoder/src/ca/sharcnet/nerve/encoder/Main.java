package ca.sharcnet.nerve.encoder;

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
        Context context;

        InputStream resourceAsStream = Main.class.getResourceAsStream("/resources/minimal.orlando.xml");


        Document document = DocumentNavigator.documentFromStream(resourceAsStream);

context = ContextLoader.load(Main.class.getResourceAsStream("/resources/orlando.context.json"));

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
        encoder.encode(System.out);
    }
}
