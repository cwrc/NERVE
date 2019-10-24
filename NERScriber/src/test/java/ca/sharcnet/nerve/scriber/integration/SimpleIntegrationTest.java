package ca.sharcnet.nerve.scriber.integration;

import ca.sharcnet.nerve.scriber.dictionary.Dictionary;
import ca.sharcnet.nerve.scriber.dictionary.EntityValues;
import ca.sharcnet.nerve.scriber.encoder.EncoderManager;
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
public class SimpleIntegrationTest extends Integration {

    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger("MainIntegration");

    public SimpleIntegrationTest(String testName) {
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

    // EncoderDictLink fills in information of already linked text.
    public void test_dict_link() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, SAXException, TransformerException {
        TestInformation info = new TestInformation()
                .doc("xml/int/integration00.xml")
                .context("context/default.context.json")
                .schema("context/default.rng");

        EncoderManager manager = this.makeManager(info);
        Dictionary dict = manager.getDictionaries().get(0);
        EntityValues ev = new EntityValues();

        ev.text("Toronto").lemma("Toronto Ontario").link("toronto.ca").tag("LOCATION");
        dict.addEntity(ev);

        manager.addProcess(new EncoderDictLink());
        manager.run();

        Query query = manager.getQuery();
        Query select2 = query.select("#2 > LOCATION");

        assertEquals(1, select2.size());
        assertEquals("Toronto Ontario", select2.attribute("lemma"));
        assertEquals("toronto.ca", select2.attribute("link"));

        Query select1 = query.select("#1 > LOCATION");
        assertEquals(0, select1.size());
    }

    public void test_ner() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, SAXException, TransformerException, InterruptedException{
        StandaloneNER standaloneNER = new StandaloneNER("src/test/resources/english.all.3class.distsim.crf.ser.gz", 9001);
        new Thread(standaloneNER).start();
        standaloneNER.waitForReady();

        TestInformation info = new TestInformation()
                .doc("xml/int/integration00.xml")
                .context("context/default.context.json")
                .schema("context/default.rng");

        EncoderManager manager = this.makeManager(info);

        RemoteClassifier remoteClassifier = new RemoteClassifier(9001);
        manager.addProcess(new EncoderNER(remoteClassifier));
        manager.run();
        Query result = manager.getQuery();
        standaloneNER.stop();

        result.toStream(System.out);

        Query query = manager.getQuery();
        Query select = query.select("#1 > LOCATION");

        assertEquals(1, select.size());
        assertEquals("Toronto", select.text());
    }
}
