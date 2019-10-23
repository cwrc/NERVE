package ca.sharcnet.nerve.scriber.integration;
import ca.sharcnet.nerve.scriber.encoder.EncoderManager;
import ca.sharcnet.nerve.scriber.encoder.servicemodules.EncoderNER;
import ca.sharcnet.nerve.scriber.encoder.servicemodules.NERMain;
import ca.sharcnet.nerve.scriber.ner.RemoteClassifier;
import ca.sharcnet.nerve.scriber.ner.StandaloneNER;
import ca.sharcnet.nerve.scriber.query.Query;
import java.io.IOException;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;
import org.xml.sax.SAXException;

/**
 * Simple integration tests to ensure the encoders actually run.
 *
 * @author edward
 */
public class OrlandoIntegrationTest extends Integration {

    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger("MainIntegration");

    public OrlandoIntegrationTest(String testName) {
        super(testName);
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();
    }

    @Override
    protected void tearDown() throws Exception {
        super.tearDown();
    }

    public void test_ner() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, SAXException, TransformerException {
        StandaloneNER standaloneNER = new StandaloneNER("src/test/resources/english.all.3class.distsim.crf.ser.gz", 9001);

        TestInformation info = new TestInformation()
                .doc("xml/int/orlando_biography_template.xml")
                .context("context/orlando.context.json")
                .schemaURL("http://cwrc.ca/schemas/orlando_biography_v2.rng");

        EncoderManager manager = this.makeManager(info);

        Runnable runnable = new Runnable() {
            public void run() {
                try {
                    RemoteClassifier remoteClassifier = new RemoteClassifier(9001);
                    manager.addProcess(new EncoderNER(remoteClassifier));
                    manager.run();
                    Query result = manager.getQuery();
                    standaloneNER.stop();
//                    result.toStream(System.out);
                } catch (IOException | ClassNotFoundException | InstantiationException | IllegalAccessException | SQLException | ParserConfigurationException ex) {
                    Logger.getLogger(NERMain.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        };

        standaloneNER.start(() -> new Thread(runnable).start());
    }
}
