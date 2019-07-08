package ca.sharcnet.nerve.jacoco;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.Socket;
import java.util.ArrayList;
import javax.servlet.http.HttpSession;
import org.jacoco.core.data.ExecutionDataWriter;
import org.jacoco.core.runtime.RemoteControlReader;
import org.jacoco.core.runtime.RemoteControlWriter;

public final class JACOCODataReader {
    private String address = "127.0.0.1";
    private int port = 9000;    
    private String execFullPath = null;
    private String jarFullPath = null;
    private String sourcePath = null;
    private ArrayList<String> classPaths = new ArrayList<String>();
    private String htmlPath = null;
    
    JACOCODataReader(){}    
    
    public String exec(HttpSession session) throws IOException {  
        if (execFullPath == null) throw new NullPointerException("execFullPath not set");
        if (jarFullPath == null) throw new NullPointerException("jarFullPath not set");        
        
        final FileOutputStream localFile = new FileOutputStream(execFullPath);
        final ExecutionDataWriter localWriter = new ExecutionDataWriter(localFile);

        /* Open a socket to the coverage agent */
        final Socket socket = new Socket(InetAddress.getByName(address), port);
        final RemoteControlWriter writer = new RemoteControlWriter(socket.getOutputStream());
        final RemoteControlReader reader = new RemoteControlReader(socket.getInputStream());
        reader.setSessionInfoVisitor(localWriter);
        reader.setExecutionDataVisitor(localWriter);
                
        /* Send a dump command and read the response */
        writer.visitDumpCommand(true, false);
        if (!reader.read()) {
            throw new IOException("Socket closed unexpectedly.");
        }

        socket.close();
        localFile.close();        
        return execFullPath;
    }

    public String report(HttpSession session) throws IOException{
        if (classPaths.isEmpty()) throw new NullPointerException("no classPath set");
        if (htmlPath == null) throw new NullPointerException("htmlPath not set");
        
        String line;
        String command = String.format("java -jar %s report %s --sourcefiles %s %s --html %s", jarFullPath, execFullPath, sourcePath, buildClasspath(), htmlPath);
        System.out.println("**> " + command);
        Process process = Runtime.getRuntime().exec(command);
        
        BufferedReader inputReader = new BufferedReader(new InputStreamReader(process.getInputStream()));                
        while ((line = inputReader.readLine()) != null){
            System.out.println(line);
        }
        
        BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));        
        while ((line = errorReader.readLine()) != null){
            System.out.println(line);
        }        
        
        return htmlPath;
    }
    
    String buildClasspath(){
        StringBuilder builder = new StringBuilder();
        for (String classPath : this.classPaths){
            builder.append("--classfiles ");
            builder.append(classPath);
            builder.append(" ");
        }
        return builder.toString();
    }
    
    void clear(HttpSession session) {
        if (execFullPath == null) throw new NullPointerException("execFullPath not set");
        if (htmlPath == null) throw new NullPointerException("htmlPath not set");        
        File execFile = new File(execFullPath);
        File htmlFile = new File(htmlPath);
        if (execFile.exists()) execFile.delete();
        if (htmlFile.exists()) htmlFile.delete();
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public void setExecFullPath(String execFullPath) {
        this.execFullPath = execFullPath;
    }

    public void setJarFullPath(String jarFullPath) {
        this.jarFullPath = jarFullPath;
    }

    public void setSourcePath(String sourcePath) {
        this.sourcePath = sourcePath;
    }

    public void addClassPath(String classPath) {
        this.classPaths.add(classPath);
    }

    public void setHtmlPath(String htmlPath) {
        this.htmlPath = htmlPath;
    }
}
