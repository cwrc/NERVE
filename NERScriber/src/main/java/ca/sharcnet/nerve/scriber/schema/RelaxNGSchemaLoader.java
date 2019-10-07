package ca.sharcnet.nerve.scriber.schema;

import static ca.sharcnet.nerve.scriber.Constants.LOG_NAME;
import ca.sharcnet.nerve.scriber.query.Query;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import javax.xml.parsers.ParserConfigurationException;
import org.xml.sax.SAXException;

public class RelaxNGSchemaLoader {

    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger(LOG_NAME);

    private RelaxNGSchemaLoader() {
    }

    public static RelaxNGSchema schemaFromStream(InputStream srcStream) throws IOException, ParserConfigurationException, SAXException {
        return new RelaxNGSchema(new Query(srcStream));
    }

    public static RelaxNGSchema schemaFromString(String string) throws IOException, ParserConfigurationException, SAXException {
        return new RelaxNGSchema(new Query(string));
    }

    public static RelaxNGSchema schemaFromFile(File file) throws IOException, ParserConfigurationException, SAXException {
        return new RelaxNGSchema(new Query(file));
    }

    public static RelaxNGSchema schemaFromURL(String schemaURL) throws MalformedURLException, IOException, ParserConfigurationException, SAXException {
        LOGGER.trace(String.format("schemaFromURL(%s)", schemaURL));
        URL url = new URL(schemaURL);
        RelaxNGSchema schema = null;

        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        if (connection.getResponseCode() == 302) {
            String locationField = connection.getHeaderField("Location");
            schema = schemaFromURL(locationField);
        } else {
            try (final InputStream resourceAsStream = url.openStream()) {
                if (resourceAsStream == null) {
                    throw new MalformedSchemaURL(schemaURL, connection.getResponseCode());
                }
                schema = RelaxNGSchemaLoader.schemaFromStream(resourceAsStream);
            }
        }
        return schema;
    }
}