package ca.sharcnet.dh.nerve.servlets.translator;
import ca.sharcnet.dh.nerve.servlets.CustomServlet;
import ca.sharcnet.nerve.decode.Decoder;
import ca.fa.utility.streams.StreamUtil;
import ca.sharcnet.nerve.docnav.DocumentNavigator;
import ca.sharcnet.nerve.docnav.dom.Document;
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
            String inputString = inJSON.getString("input");
            ByteArrayInputStream bais = new ByteArrayInputStream(inputString.getBytes());
            InputStream cfgStream = this.getServletContext().getResourceAsStream("/WEB-INF/config.txt");
            Properties config = new Properties();
            config.load(cfgStream);


            System.out.println(inputString);

            Decoder decoder = new Decoder();
//            Document document = DocumentNavigator.documentFromStream(bais);
            Document document = DocumentNavigator.documentFromString(inputString);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            decoder.decode(document, baos);

            json.put("result", "processed");
            json.put("output", baos.toString("UTF-8"));
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException | SQLException | ParserConfigurationException ex) {
            super.exception(response, ex);
            return false;
        }

        return true;
    }
}
