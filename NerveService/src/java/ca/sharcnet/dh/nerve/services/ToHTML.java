package ca.sharcnet.dh.nerve.services;
import ca.sharcnet.dh.scriber.encoder.EncoderHTML;
import ca.sharcnet.dh.scriber.encoder.EncoderManager;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONObject;

@WebServlet(name = "to-html", urlPatterns = {"/to-html"})
public class ToHTML extends ServiceBase {
    
    @Override
    public JSONObject run(JSONObject jsonRequest) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, DocumentParseException {
        if (!jsonRequest.has("document")){
            
        }
        
        String source = jsonRequest.getString("document");
        EncoderManager manager = this.createManager(source);        
        manager.addProcess(new EncoderHTML());
        manager.run();
        
        JSONObject json = new JSONObject();
        json.put("document", manager.getDocument().toString());
        json.put("context", manager.context().getSourceString());
        json.put("schemaURL", manager.getSchemaUrl().toString());        
        return json;
    }
}