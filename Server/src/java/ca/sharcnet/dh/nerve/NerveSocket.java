package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.socket.JJJSocket;
import ca.frar.jjjrmi.socket.observer.JJJObserver;
import ca.frar.jjjrmi.socket.observer.events.JJJExceptionEvent;
import ca.frar.jjjrmi.socket.observer.events.JJJOpenEvent;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.sql.SQL;
import ca.sharcnet.dh.sql.SQLEntry;
import ca.sharcnet.dh.sql.SQLRecord;
import ca.sharcnet.dh.sql.SQLResult;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletContext;

public class NerveSocket extends JJJSocket<NerveRoot> implements JJJObserver {
    private NerveRoot nerveRoot;
    private SQL sql;

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

            String path = "/WEB-INF/config.properties";
            InputStream configStream = context.getResourceAsStream(path);
            String realpath = context.getRealPath(path);
            Console.log("Config.properties real path = '" + realpath + "'");
            if (configStream == null) {
                throw new NullPointerException("config.properties not found");
            }
            
            Properties config = new Properties();
            config.load(configStream);
            
            sql = new SQL(config);
            
            this.nerveRoot = new NerveRoot(config, sql);
            this.nerveRoot.getDictionary().verifySQL(config);
        } catch (IOException | ClassNotFoundException | IllegalAccessException | SQLException | InstantiationException ex) {
            Logger.getLogger(NerveSocket.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @Override
    public void socketException(JJJExceptionEvent event) {
        Throwable exception = event.getException();
        Console.log("Socket Exception: " + exception.getClass().getSimpleName());
        Console.log(exception.getMessage());
        for (StackTraceElement trace : exception.getStackTrace()) {
            Console.log(trace);
        }
    }
}
