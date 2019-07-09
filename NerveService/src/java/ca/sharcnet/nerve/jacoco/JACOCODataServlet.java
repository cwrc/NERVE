package ca.sharcnet.nerve.jacoco;
import java.io.File;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpSession;
import org.json.JSONObject;

@WebServlet(name = "JACOCODataServlet", urlPatterns = {"/JACOCODataServlet"})
public class JACOCODataServlet extends JSONServlet {
    JACOCODataReader jacocoDataReader = new JACOCODataReader();
    
    @Override
    public JSONObject processRequest(JSONObject json, HttpSession session) throws IOException{
        JSONObject result = new JSONObject();
        
        this.jacocoDataReader.setExecFullPath(session.getServletContext().getRealPath("/WEB-INF/jacoco.exec"));
        this.jacocoDataReader.addClassPath(session.getServletContext().getRealPath("/WEB-INF/classes"));
        this.jacocoDataReader.addClassPath(session.getServletContext().getRealPath("/WEB-INF/lib/DocNav-0.9.3.jar"));
        this.jacocoDataReader.addClassPath(session.getServletContext().getRealPath("/WEB-INF/lib/NERScriber-0.9.2.jar"));
        this.jacocoDataReader.setHtmlPath(session.getServletContext().getRealPath("/coverage"));
        this.jacocoDataReader.setSourcePath(session.getServletContext().getRealPath("/WEB-INF/src"));
        this.jacocoDataReader.setJarFullPath(session.getServletContext().getRealPath("/WEB-INF/lib/jacococli.jar"));

        if (json.has("path")){
            String coveragePath = json.getString("path");
            this.jacocoDataReader.setHtmlPath(session.getServletContext().getRealPath("/coverage/" + coveragePath));
        }
        
        switch (json.getString("action")){
            case "exec":
                String execFilePath = jacocoDataReader.exec(session);
                File execFile = new File(execFilePath);
                result.put("execFilePath", execFilePath);
                result.put("exists", execFile.exists());
            break;
            case "report":
                String reportPath = jacocoDataReader.report(session);
                File reportPathFile = new File(reportPath);
                result.put("reportPath", reportPath);
                result.put("exists", reportPathFile.exists());
            break;
            case "clear":
                jacocoDataReader.clear(session);
            break;
        }
        
        return result;
    }
}
