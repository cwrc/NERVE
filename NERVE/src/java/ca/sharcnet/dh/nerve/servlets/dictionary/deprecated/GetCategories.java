package ca.sharcnet.dh.nerve.servlets.dictionary.deprecated;
import ca.sharcnet.dh.nerve.servlets.CustomServlet;
import ca.fa.utility.SQLHelper;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet(name = "GetCategories", urlPatterns = {"/GetCategories"})
public class GetCategories extends CustomServlet {

    @Override
    protected boolean processRequest(HttpServletRequest request, HttpServletResponse response, JSONObject json) throws ServletException, IOException {
        try {
            SQLHelper sql = new SQLHelper("res/config.txt");
            JSONObject r = sql.query(" select collection from nerve.entities group by collection");

            json.put("categories", new JSONArray());
            JSONArray a = r.getJSONObject("rows").getJSONArray("list");
            for (int i = 0; i < a.length(); i++){
                JSONObject get = (JSONObject) a.get(i);
                json.getJSONArray("categories").put(get.getString("collection"));
            }
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException | SQLException ex) {
            super.exception(response, ex);
        }
        return true;
    }
}

