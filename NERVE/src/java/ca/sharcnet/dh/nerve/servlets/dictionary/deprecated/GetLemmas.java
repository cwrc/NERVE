package ca.sharcnet.dh.nerve.servlets.dictionary.deprecated;
import ca.fa.utility.SQLHelper;
import ca.sharcnet.dh.nerve.servlets.CustomServlet;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONObject;

public class GetLemmas extends CustomServlet {

    @Override
    protected boolean processRequest(HttpServletRequest request, HttpServletResponse response, JSONObject json) throws ServletException, IOException {
        try {
            SQLHelper sql = new SQLHelper("res/config.txt");
            JSONObject selectAll = sql.selectAll("lemmas");
            json.put("describe", selectAll.get("describe"));
            json.put("rows", selectAll.get("rows"));
        } catch (SQLException | ClassNotFoundException | InstantiationException | IllegalAccessException ex) {
            this.exception(response, ex);
        }
        return true;
    }
}