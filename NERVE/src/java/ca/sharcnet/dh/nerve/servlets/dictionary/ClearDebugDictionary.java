package ca.sharcnet.dh.nerve.servlets.dictionary;
import ca.fa.utility.SQLHelper;
import ca.sharcnet.dh.nerve.servlets.CustomServlet;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Properties;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONObject;

@WebServlet(name = "ClearDebug", urlPatterns = {"/ClearDebug.do"})
public class ClearDebugDictionary extends CustomServlet {

    @Override
    protected boolean processRequest(HttpServletRequest request, HttpServletResponse response, JSONObject json) throws ServletException, IOException {
        try {
            Properties config = new Properties();
            config.load(getServletContext().getResourceAsStream("/WEB-INF/config.txt"));
            SQLHelper sql = new SQLHelper(config);

            String query = "delete from dictionary where collection=\"debug\"";
            int r = sql.update(query);
            if (r == 0) return this.setFailure("clear debug dictionary failed");
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException | SQLException ex) {
            ex.printStackTrace();
            this.exception(response, ex);
        }
        return true;
    }
}
