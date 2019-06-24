package ca.sharcnet.nerve.services;
import ca.sharcnet.dh.scriber.encoder.servicemodules.EncoderDictLink;
import ca.sharcnet.dh.scriber.encoder.EncoderManager;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONObject;

@WebServlet(name = "dict-link", urlPatterns = {"/dict-link"})
public class LinkDict extends ServiceBase {
    
    @Override
    public JSONObject run(JSONObject jsonRequest) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, DocumentParseException {
        EncoderManager manager = this.createManager(jsonRequest);        
        manager.addProcess(new EncoderDictLink());
        manager.run();
        
        JSONObject json = new JSONObject();
        json.put("document", manager.getDocument().toString());
        json.put("context", manager.context().getSourceString());
        json.put("schemaURL", manager.getSchemaUrl().toString());        
        return json;
    }    
}