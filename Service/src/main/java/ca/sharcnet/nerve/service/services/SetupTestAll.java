package ca.sharcnet.nerve.service.services;
import ca.sharcnet.nerve.scriber.dictionary.Dictionary;
import ca.sharcnet.nerve.scriber.dictionary.EntityValues;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONObject;

@WebServlet(name = "setup-test-all", urlPatterns = {"/setup-test-all"})
public class SetupTestAll extends ServiceBase {
    
    @Override
    public JSONObject run(JSONObject jsonRequest) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, DocumentParseException {
        JSONObject rjson = new JSONObject();
        Dictionary dictionary = new Dictionary(ServiceBase.sql);
        dictionary.setTable("test");
        rjson.put("table created", dictionary.addTable("test"));
        dictionary.addEntity(new EntityValues().text("Toronto").lemma("TO ON CA").tag("LOCATION"));
        dictionary.addEntity(new EntityValues().text("Toronto Ontario").lemma("TO ON CA").tag("LOCATION"));
        dictionary.addEntity(new EntityValues().text("Toronto Ontario Canada").lemma("TO ON CA").tag("LOCATION"));
        dictionary.addEntity(new EntityValues().text("Toronto Hydro").lemma("Toronto Hydro Corp.").link("http:/TorontoHydro.ca").tag("ORGANIZATION"));
        return rjson;
    }    
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        processRequest(request, response);
    }
}