package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.progress.ProgressListener;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.Properties;

@JJJ
public class NerveRoot extends JJJObject{
    private Scriber scriber;
    private ProgressListener progressMonitor;
    private Dictionary dictionary;

    NerveRoot(Properties config) throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException {
        scriber = new Scriber(config);
        this.dictionary = new Dictionary();
        this.progressMonitor = new ProgressMonitor();
        this.scriber.setProgressListener(progressMonitor);
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
