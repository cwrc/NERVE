package ca.sharcnet.nerve.encoder;

import ca.fa.utility.sql.SQL;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.docnav.DocumentNavigator;
import ca.sharcnet.nerve.docnav.dom.Attribute;
import ca.sharcnet.nerve.docnav.dom.AttributeNode;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.InstructionNode;
import ca.sharcnet.nerve.docnav.dom.NodeType;
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
        Document doc = new Main().run();
        System.out.println(doc);
    }

    public Document run() throws ClassifierException, IOException, FileNotFoundException, ClassCastException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        /* translate incoming document */
        InputStream resourceAsStream = this.getClass().getResourceAsStream("/resources/orlando/orlando_no_tags.xml");
        Document document = DocumentNavigator.documentFromStream(resourceAsStream);

        /* connect to SQL */
        Properties config = new Properties();
        InputStream cfgStream = Main.class.getResourceAsStream("/resources/config.txt");
        config.load(cfgStream);
        SQL sql = new SQL(config);

        /* build classifier */
        InputStream cStream = Main.class.getResourceAsStream("/resources/english.all.3class.distsim.crf.ser.gz");
        BufferedInputStream bis = new BufferedInputStream(new GZIPInputStream(cStream));
        Classifier classifier = new Classifier(bis);
        cStream.close();

        /* check document for schema to set the context */
        InstructionNode iNode = document.getInstructionNode("xml-model");

        Context context = null;
        if (iNode.getType() == NodeType.INSTRUCTION) {
            AttributeNode aNode = iNode;
            if (aNode.hasAttribute("href")) {
                Attribute attr = aNode.getAttribute("href");
                String value = attr.getValue();

                if (value.contains("orlando_biography_v2.rng")) {
                    context = ContextLoader.load(this.getClass().getResourceAsStream("/resources/orlando.context.json"));
                } else if (value.contains("cwrc_entry.rng")) {
                    context = ContextLoader.load(this.getClass().getResourceAsStream("/resources/cwrc.context.json"));
                } else if (value.contains("cwrc_tei_lite.rng")) {
                    context = ContextLoader.load(this.getClass().getResourceAsStream("/resources/tei.context.json"));
                }
            }
        }

        System.out.println(document);
        Encoder encoder = new Encoder(document, context, sql, classifier);

        /** add the schema **/
        String schemaURL = context.schemaName;
        if (schemaURL != null && !schemaURL.isEmpty()) {
            InputStream schemaStream = new URL(schemaURL).openStream();
            Document schemaDocument = DocumentNavigator.documentFromStream(schemaStream);
            Schema schema = new Schema(schemaDocument);
            encoder.setSchema(schema);
        }

        Document encoded = encoder.encode();
        return encoded;
    }
}
