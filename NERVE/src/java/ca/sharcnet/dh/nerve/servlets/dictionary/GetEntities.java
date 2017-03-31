package ca.sharcnet.dh.nerve.servlets.dictionary;
import ca.fa.utility.sql.SQL;
import ca.fa.utility.streams.StreamUtil;
import ca.sharcnet.dh.nerve.servlets.CustomServlet;
import java.io.IOException;
import java.util.Properties;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet(name = "GetEntities", urlPatterns = {"/GetEntities.do"})
public class GetEntities extends CustomServlet {

    @Override
    protected boolean processRequest(HttpServletRequest request, HttpServletResponse response, JSONObject json) throws ServletException, IOException {

        try {
            Properties config = new Properties();
            config.load(getServletContext().getResourceAsStream("/WEB-INF/config.txt"));
            SQL sql = new SQL(config);
            if (!requiredParameter("entity")) return false;
            String query = String.format("select * from dictionary where entity=\"%s\"", super.getParameter("entity"));
            JSONArray rows = sql.query(query);
            json.put("rows", rows);
        } catch (Exception ex) {
            ex.printStackTrace();
            this.exception(response, ex);
        }
        return true;
    }
}