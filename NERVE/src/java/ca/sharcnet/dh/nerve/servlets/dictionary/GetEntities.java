package ca.sharcnet.dh.nerve.servlets.dictionary;
import ca.fa.utility.SQLHelper;
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
            SQLHelper sql = new SQLHelper(config);

            String jsonString = StreamUtil.toString(request.getInputStream());
            JSONObject context = new JSONObject(jsonString);

            String query;
            if (!requiredParameter("entity")) return false;
            String dictionary = request.getParameter("dictionary");
            if (dictionary == null){
                query = String.format("select * from dictionary where entity=\"%s\" and (%s) ", getParameter("entity"), dictString(context));
            } else {
                query = String.format("select * from dictionary where entity=\"%s\" and collection=\"%s\"", getParameter("entity"), dictionary);
            }

            JSONArray rows = sql.queryToJSONArray(query);
            json.put("rows", rows);
        } catch (Exception ex) {
            ex.printStackTrace();
            this.exception(response, ex);
        }

//            sql.queryToJSONArray("select from entities)
//            JSONObject selectAll = sql.selectAll("entities");
//            json.put("describe", selectAll.get("describe"));
//            json.put("rows", selectAll.get("rows"));
        return true;
    }

    public String dictString(JSONObject context) {
        JSONArray readFrom = context.getJSONArray("readFromDictionary");
        StringBuilder builder = new StringBuilder();

        builder.append("collection=\"");
        builder.append(readFrom.getString(0));
        builder.append("\"");

        for (int i = 1; i < readFrom.length(); i++) {
            builder.append(" OR ");
            builder.append("collection=\"");
            builder.append(readFrom.getString(i));
            builder.append("\"");
        }

        return builder.toString();
    }
}
