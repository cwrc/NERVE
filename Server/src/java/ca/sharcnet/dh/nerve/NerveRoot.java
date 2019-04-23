package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.jjjrmi.annotations.Transient;
import ca.frar.jjjrmi.socket.JJJObject;
import static ca.sharcnet.dh.nerve.NerveSocket.LOGGER;
import ca.sharcnet.dh.progress.ProgressListener;
import ca.sharcnet.dh.scriber.dictionary.Dictionary;
import ca.sharcnet.dh.scriber.encoder.Classifier;
import ca.sharcnet.dh.scriber.encoder.UnsetDictionaryException;
import ca.sharcnet.dh.sql.SQL;
import java.io.BufferedInputStream;
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
    private ProgressListener progressMonitor;
    private Dictionary dictionary;

    NerveRoot(ServletContext servletContext) throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException {
        LOGGER.debug("NerveRoot()");
        try {            
            if (servletContext == null) {
                throw new NullPointerException("Context is NULL");
            }
            
            String configPath = "/WEB-INF/config.properties";
            InputStream configStream = servletContext.getResourceAsStream(configPath);
            if (configStream == null) {
                throw new FileNotFoundException(servletContext.getRealPath(configPath));
            }            

            Properties config = new Properties();
            config.load(configStream);
            configStream.close();
            LOGGER.info("configuration loaded");
            
            SQL sql = new SQL(config);       
            LOGGER.info("SQL loaded");
            
            this.dictionary = new Dictionary(sql);
            LOGGER.info("dictionary loaded");
            
            this.dictionary.verifySQL();
            LOGGER.info("dictionary verified");
            
            String classifierPath = "/WEB-INF/english.all.3class.distsim.crf.ser.gz";
            InputStream classifierStream = servletContext.getResourceAsStream(classifierPath);
            if (classifierStream == null) throw new FileNotFoundException(servletContext.getRealPath(classifierPath));                            
            GZIPInputStream gzipInputStream = new GZIPInputStream(classifierStream);
            BufferedInputStream bis = new BufferedInputStream(gzipInputStream);
            Classifier classifier = new Classifier(bis);            
            classifierStream.close();
            LOGGER.info("classifier loaded");
            
            this.scriber = new Scriber(config, dictionary, classifier, servletContext);
            LOGGER.info("root created");        
            LOGGER.info("exiting");        
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
    
    /**
     * @return the dictionary
     */
    @NativeJS
    public ProgressListener getProgressMonitor() {
        return progressMonitor;
    }        
}
