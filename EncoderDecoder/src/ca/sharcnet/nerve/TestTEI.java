package ca.sharcnet.nerve;
import ca.fa.utility.SQLHelper;
import static ca.sharcnet.nerve.MainEncoder.getInStream;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.docnav.DocumentNavigator;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.Schema;
import ca.sharcnet.nerve.encoder.AutoTagger;
import ca.sharcnet.nerve.encoder.Classifier;
import ca.sharcnet.nerve.encoder.ClassifierException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.sql.SQLException;
import java.util.Properties;
import javax.xml.parsers.ParserConfigurationException;

public class TestTEI {
public static void main(String[] args) throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ClassifierException, ParserConfigurationException, Exception {
        InputStream contextStream = getInStream("./src/resources/tei.context.json");
        InputStream xmlStream = getInStream("./src/resources/minimal.orlando.xml");
        InputStream cfgStream = getInStream("./src/resources/config.txt");

        Properties config = new Properties();
        config.load(cfgStream);
        SQLHelper sql = new SQLHelper(config);

        Classifier classifier = new Classifier(config.getProperty("classifier"));
        Context context = ContextLoader.load(contextStream);
        AutoTagger autoTagger = new AutoTagger(xmlStream, System.out, context, sql, classifier);

        /** add the schema **/
        String schemaURL = context.getSchema();
        if (schemaURL != null && !schemaURL.isEmpty()) {
            InputStream schemaStream = new URL(schemaURL).openStream();
            Document document = DocumentNavigator.documentFromStream(schemaStream);
            Schema schema = new Schema(document);
            autoTagger.setSchema(schema);
            System.out.println(schema);
        } else {
            throw new RuntimeException("Schema not found");
        }

//        autoTagger.run();
    }
}
