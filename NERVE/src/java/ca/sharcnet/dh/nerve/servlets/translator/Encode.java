package ca.sharcnet.dh.nerve.servlets.translator;

import ca.sharcnet.dh.nerve.servlets.CustomServlet;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.antlr.InvalidTokenException;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.encoder.ClassifierException;
import ca.sharcnet.nerve.encoder.Encoder;
import ca.fa.utility.streams.StreamUtil;
import ca.sharcnet.nerve.HasStreams;
import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONObject;

@WebServlet(name = "Encode", urlPatterns = {"/Encode.do"})
public class Encode extends CustomServlet implements HasStreams {

    @Override
    protected boolean processRequest(HttpServletRequest request, HttpServletResponse response, JSONObject json) throws ServletException, IOException, FileNotFoundException {
        try {
            JSONObject inJSON = StreamUtil.getJSON(request.getInputStream());
            String inputString = inJSON.getString("input");
            ByteArrayInputStream inputStream = new ByteArrayInputStream(inputString.getBytes());
            Document document = DocumentLoader.documentFromStream(inputStream);
            Document encoded = Encoder.encode(document, this);
            json.put("result", "processed");
            json.put("output", encoded);
        } catch (InvalidTokenException | ParserConfigurationException | ClassNotFoundException | InstantiationException | IllegalAccessException | SQLException | ClassifierException | ClassCastException | NullPointerException ex) {
            super.exception(response, ex);
            return false;
        }
        return true;
    }

    @Override
    public InputStream getResourceStream(String path) {
        return Encode.class.getResourceAsStream("/res/" + path);
    }
}
