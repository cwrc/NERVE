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

@WebServlet(name = "DeleteEntity", urlPatterns = {"/DeleteEntity.do"})
public class DeleteEntity extends CustomServlet {

    @Override
    protected boolean processRequest(HttpServletRequest request, HttpServletResponse response, JSONObject json) throws ServletException, IOException {
        try {
            Properties config = new Properties();
            config.load(getServletContext().getResourceAsStream("/WEB-INF/config.txt"));
            SQLHelper sql = new SQLHelper(config);

            String query;
            if (!requiredParameter("entity")) return false;
            if (!requiredParameter("dictionary")) return false;
            query = String.format("delete from dictionary where entity=\"%s\" and collection=\"%s\"", getParameter("entity"), getParameter("dictionary"));
            int r = sql.update(query);
            if (r == 0) return this.setFailure("deletion failed");
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException | SQLException ex) {
            ex.printStackTrace();
            this.exception(response, ex);
        }
        return true;
    }
}
