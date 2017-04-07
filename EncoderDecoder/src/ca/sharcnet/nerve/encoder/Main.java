package ca.sharcnet.nerve.encoder;
import ca.fa.utility.sql.SQL;
import ca.sharcnet.nerve.Constants;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.docnav.DocumentNavigator;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.Schema;
import java.io.BufferedInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.sql.SQLException;
import java.util.Properties;
import java.util.zip.GZIPInputStream;
import javax.xml.parsers.ParserConfigurationException;

public class Main {

    public static void main(String... args) throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ClassifierException {
        System.out.println(run());
//        InputStream resourceAsStream = Main.class.getResourceAsStream("/resources/minimal.orlando.xml");
//        Document document = DocumentNavigator.documentFromStream(resourceAsStream);
//        System.out.println(document);
//        System.out.println("\n ----------------------------------------------------------------------------------- \n");
//        for (Node child : document.childNodes()){
//            Node copy = child.copy();
//            copy.setName(copy.getName() + "-copy");
//            child.replaceWith(copy);
//        }
//
//        System.out.println(document);
    }

    public static String run() throws ClassifierException, IOException, FileNotFoundException, ClassCastException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        InputStream resourceAsStream = Main.class.getResourceAsStream("/resources/minimal.orlando.xml");
        Document document = DocumentNavigator.documentFromStream(resourceAsStream);
        Context context = ContextLoader.load(Main.class.getResourceAsStream("/resources/orlando.context.json"));

        Properties config = new Properties();
        InputStream cfgStream = Main.class.getResourceAsStream("/resources/config.txt");
        config.load(cfgStream);
        SQL sql = new SQL(config);

        InputStream cStream = Main.class.getResourceAsStream("/resources/english.all.3class.distsim.crf.ser.gz");
        BufferedInputStream bis = new BufferedInputStream(new GZIPInputStream(cStream));
        Encoder encoder = new Encoder(document, context, sql, new Classifier(bis));
        cStream.close();

        String schemaURL = context.schemaName;
        if (schemaURL != null && !schemaURL.isEmpty()) {
            InputStream schemaStream = new URL(schemaURL).openStream();
            Document schemaDocument = DocumentNavigator.documentFromStream(schemaStream);
            Schema schema = new Schema(schemaDocument);
            encoder.setSchema(schema);
        }

        Document encoded = encoder.encode();

        ElementNode schemaNode = new ElementNode(Constants.HTML_TAGNAME);
        schemaNode.addAttribute(Constants.CONTEXT_ATTRIBUTE, context.name);
        encoded.addChild(0, schemaNode);

        return encoded.toString();
    }
}
