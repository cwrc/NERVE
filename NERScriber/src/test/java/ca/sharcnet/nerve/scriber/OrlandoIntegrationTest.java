package ca.sharcnet.nerve.scriber;

import ca.sharcnet.nerve.scriber.dictionary.Dictionary;
import ca.sharcnet.nerve.scriber.dictionary.EntityValues;
import ca.sharcnet.nerve.scriber.encoder.EncoderManager;
import ca.sharcnet.nerve.scriber.encoder.servicemodules.EncoderDictAll;
import ca.sharcnet.nerve.scriber.encoder.servicemodules.EncoderDictLink;
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
import static junit.framework.Assert.assertEquals;
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

    /*
     * EncoderDictAll will look for new entities in the text.  These will get 
     * tagged and have the lemma and link information filled in from the database. 
     */
    public void dict_all() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, SAXException, TransformerException {
        TestInformation info = new TestInformation()
                .doc("xml/int/orlando_biography_template.xml")
                .context("orlando.context.json")
                .schemaURL("http://cwrc.ca/schemas/orlando_biography_v2.rng");

        EncoderManager manager = this.makeManager(info);
        manager.addProcess(new EncoderDictAll());
        manager.run();

        manager.getQuery().toStream(System.out);
    }

    public void test_ner() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, SAXException, TransformerException {
        int portNumber = 9001;
        StandaloneNER standaloneNER = new StandaloneNER();

        TestInformation info = new TestInformation()
                .doc("xml/int/orlando_biography_template.xml")
                .context("orlando.context.json")
                .schemaURL("http://cwrc.ca/schemas/orlando_biography_v2.rng");

        EncoderManager manager = this.makeManager(info);

        Runnable runnable = new Runnable() {
            public void run() {
                try {
                    RemoteClassifier remoteClassifier = new RemoteClassifier(portNumber);
                    manager.addProcess(new EncoderNER(remoteClassifier));
                    manager.run();
                    Query result = manager.getQuery();
                    standaloneNER.stop();
                    result.toStream(System.out);
                } catch (IOException | ClassNotFoundException | InstantiationException | IllegalAccessException | SQLException | ParserConfigurationException ex) {
                    Logger.getLogger(NERMain.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        };

        standaloneNER.start(portNumber, () -> new Thread(runnable).start());
    }
}
