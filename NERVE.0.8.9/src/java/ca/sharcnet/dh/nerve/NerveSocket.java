package ca.sharcnet.dh.nerve;

import ca.frar.jjjrmi.socket.JJJSocket;
import ca.frar.jjjrmi.socket.message.ClientRequestMessage;
import ca.frar.jjjrmi.socket.message.JJJMessage;
import ca.frar.jjjrmi.socket.message.JJJMessageType;
import ca.frar.jjjrmi.socket.observer.JJJObserver;
import ca.frar.jjjrmi.socket.observer.events.JJJCloseEvent;
import ca.frar.jjjrmi.socket.observer.events.JJJExceptionEvent;
import ca.frar.jjjrmi.socket.observer.events.JJJMethodInvocationEvent;
import ca.frar.jjjrmi.socket.observer.events.JJJMethodRequestEvent;
import ca.frar.jjjrmi.socket.observer.events.JJJOpenEvent;
import ca.frar.jjjrmi.socket.observer.events.JJJReceiveEvent;
import ca.frar.jjjrmi.socket.observer.events.JJJSendEvent;
import ca.frar.utility.console.Console;
import java.io.IOException;
import java.sql.SQLException;

public class NerveSocket extends JJJSocket<NerveRoot> {

    private NerveRoot nerveRoot;

    public NerveSocket() throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException {
        this.nerveRoot = new NerveRoot();

        this.addObserver(new JJJObserver() {
            @Override
            public void socketOpen(JJJOpenEvent jjjoe) {
//                Console.log("socketOpen");
//                Console.log(jjjoe.getSession());
            }

            @Override
            public void socketReceive(JJJReceiveEvent jjjre) {
//                Console.log("socketReceive");
            }

            @Override
            public void socketSend(JJJSendEvent<?> jjjse) {
                JJJMessage message = jjjse.getMessage();
                JJJMessageType type = message.getType();

                if (type == JJJMessageType.REMOTE) {
                    ClientRequestMessage crm = (ClientRequestMessage) message;
//                    Console.log("socketSend " + crm.getMethodName());
//                    for (Object o : crm.getArgs()) {
//                        Console.log("arg : " + o.toString());
//                    }
                    
//                    if (crm.getMethodName().equals("notifyProgress")){
//                        StackTraceElement[] st = Thread.currentThread().getStackTrace();
//                        for (StackTraceElement e : st) Console.log(e);
//                    }                    
                } else {
//                    Console.log("socketSend " + type);
                }
//                Console.log(jjjse.getSession());
            }

            @Override
            public void clientMethodInvocation(JJJMethodInvocationEvent jjjmie) {
//                Console.log("clientMethodInvocation");
            }

            @Override
            public void socketException(JJJExceptionEvent jjjee) {
//                Console.log("socketException");
            }

            @Override
            public void serverMethodRequest(JJJMethodRequestEvent jjjmre) {
//                Console.log("serverMethodRequest");
            }

            @Override
            public void socketClose(JJJCloseEvent jjjce) {
//                Console.log("socketClose");
//                Console.log(jjjce.getSession());
            }
        });
    }

    @Override
    public NerveRoot retrieveRoot() {
        return this.nerveRoot;
    }

}
