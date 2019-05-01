package ca.sharcnet.dh.nerve.services;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.dictionary.EntityValues;
import ca.sharcnet.dh.sql.SQLRecord;
import ca.sharcnet.dh.sql.SQLResult;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.annotation.WebServlet;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet(name = "lookup-entities", urlPatterns = {"/lookup-entities"})
public class LookupEntities extends ServiceBase {
    
    @Override
    public JSONObject run(JSONObject jsonRequest) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, DocumentParseException {
        if (!jsonRequest.has("values")){
            return this.badRequest("Missing json parameter: values");
        }
        if (!jsonRequest.has("from")){
            return this.badRequest("Missing json parameter: from");
        }
        if (!jsonRequest.has("count")){
            return this.badRequest("Missing json parameter: count");
        }        
        
        JSONObject jsonObject = jsonRequest.getJSONObject("values");
        EntityValues entityValues = new EntityValues(jsonObject);
        int offset = jsonRequest.getInt("from");
        int count = jsonRequest.getInt("count");        
        SQLResult lookupEntities = ServiceBase.dictionary.lookupEntities(entityValues, count, offset);

        JSONObject json = new JSONObject();
        JSONArray jsonArray = new JSONArray();
        json.put("entities", jsonArray);
        
        for (SQLRecord sqlResult : lookupEntities){
            JSONObject entity = new EntityValues(sqlResult).toJSONObject();
            jsonArray.put(entity);
        }
        
        return json;
    }    
}