package ca.sharcnet.nerve.scriber;

import ca.sharcnet.nerve.scriber.query.Query;
import ca.sharcnet.nerve.scriber.schema.RelaxNGSchema;
import ca.sharcnet.nerve.scriber.schema.RelaxNGSchemaLoader;
import ca.sharcnet.nerve.scriber.context.Context;
import ca.sharcnet.nerve.scriber.context.ContextLoader;
import ca.sharcnet.nerve.scriber.dictionary.Dictionary;
import ca.sharcnet.nerve.scriber.dictionary.EntityValues;
import ca.sharcnet.nerve.scriber.encoder.EncoderManager;
import ca.sharcnet.nerve.scriber.encoder.servicemodules.EncoderDictAll;
import ca.sharcnet.nerve.scriber.encoder.servicemodules.EncoderDictLink;
import ca.sharcnet.nerve.scriber.sql.SQL;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.SQLException;
import java.util.Properties;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import static junit.framework.Assert.assertTrue;
import junit.framework.TestCase;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

public class Integration extends TestCase {

    public Integration(String testName) {
        super(testName);
    }

    public EncoderManager makeManager(TestInformation info) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, SAXException, TransformerException {
        File documentFile = new File(info.getDocumentFilename());
        if (!documentFile.exists()) throw new RuntimeException("File not found: " + documentFile.getCanonicalPath());

        RelaxNGSchema schema;
        if (info.getSchemaFilename() != null) {
            File schemaFile = new File(info.getSchemaFilename());
            if (!schemaFile.exists()) throw new RuntimeException("File not found: " + schemaFile.getCanonicalPath());
            schema = RelaxNGSchemaLoader.schemaFromStream(new FileInputStream(schemaFile));
        } else {
            schema = RelaxNGSchemaLoader.schemaFromURL(info.getSchemaURL());
        }

        File contextFile = new File(info.getContextFilename());
        if (!contextFile.exists()) throw new RuntimeException("File not found: " + contextFile.getCanonicalPath());

        File configFile = new File(info.getConfigFilename());
        if (!configFile.exists()) throw new RuntimeException("File not found: " + configFile.getCanonicalPath());

        Properties properties = new Properties();
        properties.load(new FileInputStream(configFile));

        String dbURL = properties.getProperty("databaseURL");
        String dbPath = properties.getProperty("databasePath");
        String realPath = new File(dbPath).getAbsolutePath();
        String dbDriver = properties.getProperty("databaseDriver");

        SQL sql = new SQL(dbDriver, dbURL + realPath);
        Dictionary dictionary = new Dictionary(sql);
        dictionary.setTable("demonstration");
        dictionary.verifySQL();

        Query query = new Query(new FileInputStream(documentFile));
        Context context = ContextLoader.load(new FileInputStream(contextFile));

        EncoderManager manager = new EncoderManager();
        manager.setQuery(query);
        manager.setSchema(schema, "");
        manager.setContext(context);
        manager.addDictionary(dictionary);

        return manager;
    }

    static void output(Node node) throws TransformerConfigurationException, TransformerException {
//         Use a Transformer for output
        TransformerFactory tFactory = TransformerFactory.newInstance();
        Transformer transformer = tFactory.newTransformer();

        DOMSource source = new DOMSource(node);
        StreamResult result = new StreamResult(System.out);
        transformer.transform(source, result);
    }
}
