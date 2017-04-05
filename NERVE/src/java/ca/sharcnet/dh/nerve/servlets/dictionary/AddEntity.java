package ca.sharcnet.dh.nerve.servlets.dictionary;
import ca.fa.utility.sql.SQL;
import ca.fa.utility.streams.StreamUtil;
import ca.sharcnet.dh.nerve.servlets.CustomServlet;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.TagInfo;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Properties;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONObject;

@WebServlet(name = "AddEntity", urlPatterns = {"/AddEntity.do"})
public class AddEntity extends CustomServlet {

    @Override
    protected boolean processRequest(HttpServletRequest request, HttpServletResponse response, JSONObject json) throws ServletException, IOException {
        try {
            Properties config = new Properties();
            config.load(getServletContext().getResourceAsStream("/WEB-INF/config.txt"));
            SQL sql = new SQL(config);

            String jsonString = StreamUtil.toString(request.getInputStream());
            JSONObject jsonObject = new JSONObject(jsonString);
            Context context = new Context(jsonObject);

            if (!requiredParameter("entity")) return false;
            if (!requiredParameter("collection")) return false;

            String entity = request.getParameter("entity");
            String lemma = request.getParameter("lemma");
            String link = request.getParameter("link");
            String tag = request.getParameter("tag");
            String collection = request.getParameter("collection");
            if (collection == null) collection = "";

            if (tag != null && !tag.isEmpty()){
                TagInfo tagInfo = context.getTagInfo(tag);
                tag = tagInfo.getDictionaryMap();
            }

            String q = String.format("insert into dictionary (entity, lemma, link, tag, collection) values (\"%s\", \"%s\", \"%s\", \"%s\", \"%s\") ON DUPLICATE KEY UPDATE lemma=\"%s\", link=\"%s\", tag=\"%s\"", entity, lemma, link, tag, collection, lemma, link, tag);
            System.out.println(q);
            int r = sql.update(q);
            if (r == 0) return this.setFailure("insertion failed");
        } catch (SQLException | ClassNotFoundException | InstantiationException | IllegalAccessException ex) {
            ex.printStackTrace();
            this.exception(response, ex);
        }
        return true;
    }
}