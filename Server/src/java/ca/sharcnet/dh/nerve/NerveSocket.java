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
            String realPath = context.getRealPath(path);
            if (configStream == null) throw new NullPointerException("config.properties not found");
            Properties config = new Properties();
            config.load(configStream);
            
            Console.log("db real path " + realPath);
            this.nerveRoot = new NerveRoot(config);

            SQL sql = new SQL(config);
            SQLResult result = sql.tables();
            
            Console.log(result.size() + " entries");
            for (SQLRecord r : result) {
                for (SQLEntry c : r) {
                    Console.log(c.getName() + ", " + c.getValue());
                }
            }            
            
            if (result.size() == 0){
                Console.log("creating tables");
                sql.update("create table dictionaries (name varchar(64))");
            }

            sql = new SQL(config);
            
        } catch (IOException | ClassNotFoundException | IllegalAccessException | SQLException | InstantiationException ex) {
            Logger.getLogger(NerveSocket.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @Override
    public void socketException(JJJExceptionEvent event) {
        Throwable exception = event.getException();
        Console.log("Socket Exception: " + exception.getClass().getSimpleName());
        Console.log(exception.getMessage());
        for (StackTraceElement trace : exception.getStackTrace()){
            Console.log(trace);
        }
    }
}
