package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.socket.JJJSocket;
import ca.frar.jjjrmi.socket.observer.JJJObserver;
import ca.frar.jjjrmi.socket.observer.events.JJJOpenEvent;
import java.io.IOException;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletContext;
import org.apache.logging.log4j.LogManager;

public class NerveSocket extends JJJSocket<NerveRoot> implements JJJObserver {
    final static org.apache.logging.log4j.Logger LOGGER = LogManager.getLogger(NerveSocket.class);
    private NerveRoot nerveRoot = null;

    public NerveSocket() throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException {
        this.addObserver(this);
    }

    @Override
    public NerveRoot retrieveRoot() {
        return this.nerveRoot;
    }

    @Override
    public void socketOpen(JJJOpenEvent event) {
        try {
            ServletContext context = this.getContext();
            if (context == null) {
                throw new NullPointerException("Context is NULL");
            }
            if (this.nerveRoot == null){
                this.nerveRoot = new NerveRoot(context);
            }
        } catch (IOException | ClassNotFoundException | IllegalAccessException | SQLException | InstantiationException ex) {
            Logger.getLogger(NerveSocket.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}
