/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.ner;

import edu.stanford.nlp.ie.crf.CRFClassifier;
import edu.stanford.nlp.util.CoreMap;
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.GZIPInputStream;
import org.apache.logging.log4j.LogManager;

/**
 *
 * @author Ed Armstrong
 */
public class StandaloneNER {
    final static org.apache.logging.log4j.Logger LOGGER = LogManager.getLogger("StandaloneNER");
    public static void main(String[] args) throws IOException, ClassCastException, ClassNotFoundException {
        int portNumber = Integer.parseInt(args[0]);
        new StandaloneNER(portNumber);
    }
    
    private CRFClassifier<CoreMap> classifier;

    public StandaloneNER(int portNumber) throws IOException, ClassCastException, ClassNotFoundException {
        this.initClassifier();
        ServerSocket serverSocket = new ServerSocket(portNumber);    
        
        while(true){
            LOGGER.trace("awaiting connection");
            Socket clientSocket = serverSocket.accept();
            this.onAccept(clientSocket);
            clientSocket.close();
        }
    }

    private void initClassifier() throws IOException, ClassCastException, ClassNotFoundException {
        LOGGER.trace("loading classifier");
        String classifierPath = "/english.all.3class.distsim.crf.ser.gz";
        
        InputStream in = this.getClass().getResourceAsStream(classifierPath);
        if (in == null){
            throw new FileNotFoundException();
        }
        
        GZIPInputStream gzip = new GZIPInputStream(in);
        this.classifier = CRFClassifier.getClassifier(gzip);
        in.close();
        LOGGER.trace("classifier loaded");
    }
    
    private void onAccept(Socket clientSocket) {        
        try (PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true)){
            LOGGER.trace("connection accepted");
            String input = this.readInput(clientSocket);
            LOGGER.info(input);
            String classifyWithInlineXML = this.classifier.classifyWithInlineXML(input);
            this.writeOutput(out, classifyWithInlineXML);
            LOGGER.trace("connection complete");
        } catch (IOException ex) {
            Logger.getLogger(StandaloneNER.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    private String readInput(Socket socket) throws IOException{
        LOGGER.trace(socket.hashCode());
        InputStreamReader inputStreamReader = new InputStreamReader(socket.getInputStream());
        BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
        
        String readLine = bufferedReader.readLine();
        int messageLength = Integer.parseInt(readLine);
        char[] message = new char[messageLength];
        bufferedReader.read(message);
        return new String(message);
    }

    private void writeOutput(PrintWriter printWriter, String string){
        LOGGER.trace(string);
        printWriter.write(string);
    }
}
