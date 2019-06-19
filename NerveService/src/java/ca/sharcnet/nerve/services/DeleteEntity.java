package ca.sharcnet.nerve.services;
import ca.sharcnet.dh.scriber.dictionary.EntityValues;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONObject;

@WebServlet(name = "delete-entities", urlPatterns = {"/delete-entities"})
public class DeleteEntity extends ServiceBase {
    
    @Override
    public JSONObject run(JSONObject jsonRequest) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, DocumentParseException {
        if (!jsonRequest.has("values")){
            return this.badRequest("Missing json parameter: values");
        }
        
        JSONObject jsonObject = jsonRequest.getJSONObject("values");
        EntityValues entityValues = new EntityValues(jsonObject);
        
        ServiceBase.dictionary.deleteEntity(entityValues);
        JSONObject json = new JSONObject();        
        return json;
    }    
}