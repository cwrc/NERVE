package ca.sharcnet.nerve;

import ca.fa.utility.SQLHelper;
import ca.sharcnet.nerve.context.*;
import ca.sharcnet.nerve.docnav.DocumentNavigator;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.Schema;
import ca.sharcnet.nerve.encoder.Classifier;
import ca.sharcnet.nerve.encoder.ClassifierException;
import ca.sharcnet.nerve.encoder.Encoder;
import static ca.sharcnet.nerve.encoder.Encoder.Parameter.*;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.sql.SQLException;
import java.util.Properties;
import javax.xml.parsers.ParserConfigurationException;

public class MainEncoder {

    public static void main(String[] args) throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ClassifierException, ParserConfigurationException, Exception {
        InputStream contextStream = getInStream("./src/resources/generic.context.json");
        InputStream xmlStream = getInStream("./src/resources/demo_2.xml");
        InputStream cfgStream = getInStream("./src/resources/config.txt");

        Properties config = new Properties();
        config.load(cfgStream);
        SQLHelper sql = new SQLHelper(config);

        Classifier classifier = new Classifier(config.getProperty("classifier"));
        Context context = ContextLoader.load(contextStream);
        Encoder encoder = new Encoder(xmlStream, context, sql, classifier);
        encoder.setParameters(NER, COMMENT_META, ADD_DEBUG_ATTR, LOOKUP_TAG, ADD_ID, ENCODE_PROCESS);

        /** add the schema **/
        String schemaURL = context.getSchema();
        if (schemaURL != null && !schemaURL.isEmpty()) {
            InputStream schemaStream = new URL(schemaURL).openStream();
            Document document = DocumentNavigator.documentFromStream(schemaStream);
            Schema schema = new Schema(document);
            encoder.setSchema(schema);
        }

        encoder.encode(System.out);
    }

    public static OutputStream getOutStream(String filepath) throws FileNotFoundException {
        File file = new File(filepath);
        FileOutputStream stream = new FileOutputStream(file);
        return stream;
    }

    public static InputStream getInStream(String filepath) throws FileNotFoundException {
        File file = new File(filepath);
        FileInputStream stream = new FileInputStream(file);
        return stream;
    }
}
