package ca.sharcnet.dh.nerve.servlets.dictionary.deprecated;
import ca.fa.utility.SQLHelper;
import ca.sharcnet.dh.nerve.servlets.CustomServlet;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONObject;

public class AddLemma extends CustomServlet {

    @Override
    protected boolean processRequest(HttpServletRequest request, HttpServletResponse response, JSONObject json) throws ServletException, IOException {
        try {
            if (!requiredParameter("lemma")) return false;
            if (!requiredParameter("tag")) return false;
            if (!requiredParameter("link")) return false;

            String lemma = request.getParameter("lemma");
            String tag = request.getParameter("tag");
            String link = request.getParameter("link");
            String collection = request.getParameter("collection");
            if (collection == null) collection = "";

            SQLHelper sql = new SQLHelper("res/config.txt");

            String fmt = "insert into lemmas (lemma, tag, link)"
                + "values (\"%s\", \"%s\", \"%s\", \"%s\")"
                + " ON DUPLICATE KEY UPDATE tag=\"%s\", link=\"%s\", collection=\"%s\"";

            String q = String.format(fmt, lemma, tag, link, collection, tag, link, collection);

            int r = sql.update(q);

            if (r == 0) return this.setFailure("insertion failed");
        } catch (SQLException | ClassNotFoundException | InstantiationException | IllegalAccessException ex) {
            this.exception(response, ex);
        }
        return true;
    }
}