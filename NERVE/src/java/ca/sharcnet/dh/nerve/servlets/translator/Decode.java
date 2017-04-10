package ca.sharcnet.dh.nerve.servlets.translator;
import ca.sharcnet.dh.nerve.servlets.CustomServlet;
import ca.sharcnet.nerve.decode.Decoder;
import ca.fa.utility.streams.StreamUtil;
import ca.sharcnet.nerve.Constants;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.docnav.DocumentNavigator;
import ca.sharcnet.nerve.docnav.dom.Attribute;
import ca.sharcnet.nerve.docnav.dom.AttributeNode;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.selector.Select;
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
            InputStream cfgStream = this.getServletContext().getResourceAsStream("/WEB-INF/config.txt");
            Properties config = new Properties();
            config.load(cfgStream);

            Document document = DocumentNavigator.documentFromString(inputString);

            /* check document for schema to set the context */
            Select selection = document.select().attribute("class", Constants.HTML_PROLOG_CLASSNAME);
            if (selection.isEmpty()) throw new RuntimeException("Schema instruction element not found.");
            Node node = selection.get(0);
            Context context = null;

            if (node.getType() == NodeType.INSTRUCTION){
                AttributeNode aNode = (AttributeNode) node;
                if (aNode.hasAttribute("href")){
                    Attribute attr = aNode.getAttribute("href");
                    String value = attr.getValue();

                    if (value.contains("orlando_biography_v2.rng")){
                        context = ContextLoader.load(Encode.class.getResourceAsStream("/res/orlando.context.json"));
                    }
                    else if (value.contains("cwrc_entry.rng")){
                        context = ContextLoader.load(Encode.class.getResourceAsStream("/res/cwrc.context.json"));
                    }
                    else if (value.contains("cwrc_tei_lite.rng")){
                        context = ContextLoader.load(Encode.class.getResourceAsStream("/res/tei.context.json"));
                    }
                }
            }

            Document decoded = new Decoder().decode(document, context);

            json.put("result", "processed");
            json.put("output", decoded);
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException | SQLException | ParserConfigurationException ex) {
            super.exception(response, ex);
            return false;
        }

        return true;
    }
}
