package ca.sharcnet.dh.nerve.services;
import ca.sharcnet.dh.scriber.dictionary.EntityValues;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet(name = "add-entities", urlPatterns = {"/add-entities"})
public class AddEntities extends ServiceBase {
    
    @Override
    public JSONObject run(JSONObject jsonRequest) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, DocumentParseException {
        if (!jsonRequest.has("entities")){
            return this.badRequest("Missing json parameter: entities");
        }
        
        JSONArray jsonArray = jsonRequest.getJSONArray("entities");
        ArrayList<EntityValues> list = new ArrayList<>();
        for (int i = 0; i < jsonArray.length(); i++){
            JSONObject jsonValues = jsonArray.getJSONObject(i);
            EntityValues entityValues = new EntityValues(jsonValues);
            list.add(entityValues);
        }
        
        int count = ServiceBase.dictionary.addEntities(list);
        JSONObject json = new JSONObject();
        json.put("entitiesAdded", count);
        return json;
    }    
}