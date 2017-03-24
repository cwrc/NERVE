package ca.sharcnet.dh.nerve.servlets.dictionary.deprecated;
import ca.fa.utility.SQLHelper;
import ca.sharcnet.dh.nerve.servlets.CustomServlet;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONObject;

public class DeleteEntity extends CustomServlet {

    @Override
    protected boolean processRequest(HttpServletRequest request, HttpServletResponse response, JSONObject json) throws ServletException, IOException {
        try {
            if (!requiredParameter("idx")) return false;
            String index = request.getParameter("idx");

            SQLHelper sql = new SQLHelper("res/config.txt");
            String cmd = "delete from entities where idx = \"" + index + "\"";
            int r = sql.update(cmd);
            if (r == 0) return this.setFailure("deletion failed");
        } catch (SQLException | ClassNotFoundException | InstantiationException | IllegalAccessException ex) {
            this.exception(response, ex);
        }
        return true;
    }
}