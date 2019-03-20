package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.sharcnet.dh.progress.ProgressListener;
import java.io.IOException;
import java.sql.SQLException;

@JJJ
public class NerveRoot extends JJJObject{
    private Scriber scriber = new Scriber();
    private ProgressListener progressMonitor;
    private Dictionary dictionary;

    NerveRoot() throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException {
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
