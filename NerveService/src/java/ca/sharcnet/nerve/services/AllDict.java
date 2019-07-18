package ca.sharcnet.nerve.services;
import ca.sharcnet.dh.scriber.encoder.servicemodules.EncoderDictAll;
import ca.sharcnet.dh.scriber.encoder.EncoderManager;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONObject;

@WebServlet(name = "dict-all", urlPatterns = {"/dict-all"})
public class AllDict extends ServiceBase {
    
    @Override
    public JSONObject run(JSONObject jsonRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, DocumentParseException {
        EncoderManager manager = this.createManager(jsonRequest, request);       
        manager.addProcess(new EncoderDictAll());
        manager.run();
        
        JSONObject json = new JSONObject();
        json.put("document", manager.getDocument().toString());
        json.put("context", manager.getContext().getSourceString());
        json.put("schemaURL", manager.getSchemaUrl().toString());        
        return json;
    }    
}