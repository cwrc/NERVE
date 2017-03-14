package ca.sharcnet.dh.nerve.servlets.translator;
import ca.fa.utility.SQLHelper;
import ca.sharcnet.dh.nerve.servlets.CustomServlet;
import ca.sharcnet.nerve.context.*;
import ca.sharcnet.nerve.decode.Decoder;
import ca.fa.utility.streams.StreamUtil;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.Properties;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONObject;

@WebServlet(name = "Decode", urlPatterns = {"/Decode.do"})
public class Decode extends CustomServlet {

    @Override
    protected boolean processRequest(HttpServletRequest request, HttpServletResponse response, JSONObject json) throws ServletException, IOException {
        try {
            JSONObject inJSON = StreamUtil.getJSON(request.getInputStream());
            Context context = ContextLoader.load(inJSON.getString("context"));
            String inputString = inJSON.getString("input");
            ByteArrayInputStream bais = new ByteArrayInputStream(inputString.getBytes());
            InputStream cfgStream = this.getServletContext().getResourceAsStream("/WEB-INF/config.txt");
            Properties config = new Properties();
            config.load(cfgStream);
            SQLHelper sql = new SQLHelper(config);

            Decoder decoder = new Decoder(bais, context, sql);
            decoder.setParameters(request.getParameterNames());
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            decoder.decode(baos);

            json.put("result", "processed");
            json.put("output", baos.toString("UTF-8"));
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException | SQLException | ParserConfigurationException ex) {
            super.exception(response, ex);
            return false;
        }

        return true;
    }
}
