package ca.sharcnet.nerve.services;
import ca.sharcnet.dh.scriber.encoder.EncoderManager;
import ca.sharcnet.dh.scriber.encoder.servicemodules.EncoderNER;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONObject;

@WebServlet(name = "NER", urlPatterns = {"/ner"})
public class NER extends ServiceBase {
    
    public NER(){
        super();
    }
    
    @Override
    public JSONObject run(JSONObject jsonRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, DocumentParseException {
        if (!jsonRequest.has("document")){
            return this.badRequest("Missing json parameter: document");
        }
        
        EncoderManager manager = this.createManager(jsonRequest, request);        
        manager.addProcess(new EncoderNER(ServiceBase.classifier));
        manager.run();
        
        JSONObject json = new JSONObject();
        json.put("document", manager.getDocument().toString());
        json.put("context", manager.getContext().getSourceString());
        json.put("schemaURL", manager.getSchemaUrl());
        System.out.println(json.toString(4));
        System.out.println(manager.getSchemaUrl());
        return json;
    }    
}