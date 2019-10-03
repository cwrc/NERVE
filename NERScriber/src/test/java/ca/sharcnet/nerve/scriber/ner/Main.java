/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.ner;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.parsers.ParserConfigurationException;
import org.xml.sax.SAXException;

/**
 *
 * @author edward
 */
public class Main {

    public static void main(String... args) throws SAXException, IOException, ParserConfigurationException, ClassCastException, ClassNotFoundException {
        int portNumber = 9003;
        
        StandaloneNER standaloneNER = new StandaloneNER();
        
        Runnable runnable = new Runnable() {
            public void run() {
                try {
                    RemoteClassifier remoteClassifier = new RemoteClassifier(portNumber);
                    System.out.println("classifying");
                    String classify = remoteClassifier.classify("Toronto");
                    System.out.println("result : " + classify);
                    standaloneNER.stop();
                } catch (IOException ex) {
                    Logger.getLogger(Main.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        };
        
        standaloneNER.start(portNumber, ()->new Thread(runnable).start());
    }
}
