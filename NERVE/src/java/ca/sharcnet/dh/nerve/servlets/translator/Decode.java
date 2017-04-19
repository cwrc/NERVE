package ca.sharcnet.dh.nerve.servlets.translator;
import ca.sharcnet.dh.nerve.servlets.CustomServlet;
import ca.sharcnet.nerve.decode.Decoder;
import ca.fa.utility.streams.StreamUtil;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONObject;

@WebServlet(name = "Decode", urlPatterns = {"/Decode.do"})
public class Decode extends CustomServlet implements HasStreams {

    @Override
    protected boolean processRequest(HttpServletRequest request, HttpServletResponse response, JSONObject json) throws ServletException, IOException {
        try {
            JSONObject inJSON = StreamUtil.getJSON(request.getInputStream());
            String asString = "<doc>\n" + inJSON.getString("input") + "\n</doc>";
            Document document = DocumentLoader.documentFromString(asString);
            Document decoded = Decoder.decode(document, this);
            json.put("result", "processed");
            json.put("output", decoded);
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException | SQLException | ParserConfigurationException ex) {
            super.exception(response, ex);
            return false;
        }

        return true;
    }

    @Override
    public InputStream getResourceStream(String path) {
        return Decode.class.getResourceAsStream("/res/" + path);
    }
}
