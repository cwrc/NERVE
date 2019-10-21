/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.ner;

import ca.sharcnet.nerve.scriber.encoder.IClassifier;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/**
 * Used to connect to a classifier on this machine 
 * @author Ed Armstrong
 */
public class RemoteClassifier implements IClassifier{
    private final int port;
    private String ip;
    
    public RemoteClassifier(int port) throws IOException{
        this.port = port;
        this.ip = "127.0.0.1";
        classify("");
    }
    
    public RemoteClassifier(String ip, int port) throws IOException{
        this.port = port;
        this.ip = ip;
        classify("");
    }    
    
    @Override
    public String classify(String input) throws IOException{
        Socket socket = new Socket(this.ip, this.port);
        writeOutput(socket, input);
        String result = readInput(socket);
        socket.close();        
        return result;
    }
    
    private void writeOutput(Socket socket, String string) throws IOException{
        PrintWriter out = new PrintWriter(socket.getOutputStream(), true);  
        out.println(string.length());
        out.println(string);
    }
    
    private String readInput(Socket socket) throws IOException{
        InputStream inputStream = socket.getInputStream();
        InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
        BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
        
        String line = bufferedReader.readLine();
        StringBuilder builder = new StringBuilder();
        while (line != null){    
            builder.append(line);
            line = bufferedReader.readLine();            
        }        
        return builder.toString();
    }    
}