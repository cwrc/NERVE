package ca.sharcnet.nerve;
import static ca.sharcnet.nerve.MainEncoder.getInStream;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.docnav.DocumentNavigator;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.Schema;
import ca.sharcnet.nerve.encoder.ClassifierException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;

public class TestSchemaTEI {

    public static void main(String[] args) throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ClassifierException, ParserConfigurationException, Exception {
        InputStream contextStream = getInStream("./src/resources/tei.context.json");

        Context context = ContextLoader.load(contextStream);

        String schemaURL = context.getSchema();
        InputStream schemaStream = new URL(schemaURL).openStream();
        Document document = DocumentNavigator.documentFromStream(schemaStream);
        Schema schema = new Schema(document);
        System.out.println(schema);
        String[] path1 = {"TEI", "text", "body", "div"}; // valid
        String[] path2 = {"BIOGRAPHY", "DIV0", "DIV1", "PERSONNAME", "DIV2", "DATASTRUCT", "DATAITEM", "BIRTHNAME", "GIVEN", "NAME"}; // invalid
        boolean isValid = schema.isValidPath(path1);
        System.out.println(isValid);
    }
}
