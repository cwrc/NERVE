package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.sharcnet.dh.progress.ProgressListener;
import ca.sharcnet.dh.scriber.dictionary.Dictionary;
import ca.sharcnet.dh.sql.SQL;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Properties;

@JJJ
public class NerveRoot extends JJJObject{
    private Scriber scriber;
    private ProgressListener progressMonitor;
    private Dictionary dictionary;

    NerveRoot(Properties config, SQL sql) throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException {
        if (config == null) throw new NullPointerException();
        if (sql == null) throw new NullPointerException();
        
        scriber = new Scriber(config);
        this.dictionary = new Dictionary(sql);
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
