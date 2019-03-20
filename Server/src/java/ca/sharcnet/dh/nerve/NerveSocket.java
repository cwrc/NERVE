package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.socket.JJJSocket;
import ca.frar.jjjrmi.socket.observer.JJJObserver;
import ca.frar.jjjrmi.socket.observer.events.JJJExceptionEvent;
import ca.frar.utility.console.Console;
import java.io.IOException;
import java.sql.SQLException;

public class NerveSocket extends JJJSocket<NerveRoot> implements JJJObserver{
    private NerveRoot nerveRoot;    
    
    public NerveSocket() throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException{
        this.nerveRoot = new NerveRoot();
        this.addObserver(this);
    }
    
    @Override
    public NerveRoot retrieveRoot() {
        return this.nerveRoot;
    }
    
    @Override
    public void socketException(JJJExceptionEvent event) {
        Throwable exception = event.getException();
        Console.log("Socket Exception: " + exception.getClass().getSimpleName());
    }
}