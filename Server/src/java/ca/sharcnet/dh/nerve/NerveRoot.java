package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.jjjrmi.annotations.Transient;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.sharcnet.dh.scriber.dictionary.Dictionary;
import ca.sharcnet.dh.sql.SQL;
import edu.stanford.nlp.ie.crf.CRFClassifier;
import edu.stanford.nlp.ling.CoreLabel;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.Properties;
import java.util.zip.GZIPInputStream;
import javax.servlet.ServletContext;
import org.apache.logging.log4j.LogManager;

@JJJ
public class NerveRoot extends JJJObject{
    @Transient final static org.apache.logging.log4j.Logger LOGGER = LogManager.getLogger(NerveRoot.class);
    private Scriber scriber;
    private Dictionary dictionary;

    NerveRoot(ServletContext servletContext) throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException {
        LOGGER.info("NerveRoot() ... ");
        try {            
            if (servletContext == null) {
                throw new NullPointerException("Context is NULL");
            }
            
            String configPath = "/WEB-INF/config.properties";
            InputStream configStream = servletContext.getResourceAsStream(configPath);
            if (configStream == null) {
                throw new FileNotFoundException(servletContext.getRealPath(configPath));
            }            

            LOGGER.info("loading configuration ...");
            Properties config = new Properties();
            config.load(configStream);
            configStream.close();
            LOGGER.info("configuration loaded");
            
            LOGGER.info("loading sql ...");
            SQL sql = new SQL(config);       
            LOGGER.info("SQL loaded");
            
            LOGGER.info("loading dictionary ...");
            this.dictionary = new Dictionary(sql);
            LOGGER.info("dictionary loaded");
            
            LOGGER.info("verifying dictionary ...");
            this.dictionary.verifySQL();
            LOGGER.info("dictionary verified");
                        
            LOGGER.info("loading classifier ...");
            String classifierPath = "/WEB-INF/english.all.3class.distsim.crf.ser.gz";
            InputStream in = servletContext.getResourceAsStream(classifierPath);
            GZIPInputStream gzip = new GZIPInputStream(in);
            CRFClassifier<CoreLabel> classifier = CRFClassifier.getClassifier(gzip);
            LOGGER.info("classifier loaded");
            
            LOGGER.info("loading scriber ...");
            this.scriber = new Scriber(config, dictionary, classifier, servletContext);
             LOGGER.info("scriber loaded");        
            LOGGER.info("exiting NerveRoot()");        
        } catch (Exception ex) {
            LOGGER.catching(ex);
            if (ex.getCause() != null){
                LOGGER.error("cause");
                LOGGER.catching(ex.getCause());
            }
            else {
                LOGGER.error("no cause");
            }
        }  
    }
    
    /**
     * @return the scriber
     */
    @NativeJS
    public Scriber getScriber() {
        return scriber;
    }

    /**
     * @return the dictionary
     */
    @NativeJS
    public Dictionary getDictionary() {
        return dictionary;
    }    
}
