package ca.sharcnet.dh.nerve.servlets.translator;
import ca.fa.utility.sql.SQL;
import ca.sharcnet.dh.nerve.servlets.CustomServlet;
import ca.sharcnet.nerve.docnav.DocumentNavigator;
import ca.sharcnet.nerve.docnav.antlr.InvalidTokenException;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.Schema;
import ca.sharcnet.nerve.encoder.Classifier;
import ca.sharcnet.nerve.encoder.ClassifierException;
import ca.sharcnet.nerve.encoder.Encoder;
import ca.fa.utility.streams.StreamUtil;
import ca.sharcnet.nerve.context.*;
import ca.sharcnet.nerve.docnav.dom.Attribute;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.Constants;
import ca.sharcnet.nerve.docnav.dom.InstructionNode;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.selector.Select;
import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.sql.SQLException;
import java.util.Properties;
import java.util.zip.GZIPInputStream;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONObject;

@WebServlet(name = "Encode", urlPatterns = {"/Encode.do"})
public class Encode extends CustomServlet {

    @Override
    protected boolean processRequest(HttpServletRequest request, HttpServletResponse response, JSONObject json) throws ServletException, IOException, FileNotFoundException {
        try {
            JSONObject inJSON = StreamUtil.getJSON(request.getInputStream());
            String inputString = inJSON.getString("input");
            ByteArrayInputStream inputStream = new ByteArrayInputStream(inputString.getBytes());
            InputStream cfgStream = this.getServletContext().getResourceAsStream("/WEB-INF/config.txt");
            Properties config = new Properties();
            config.load(cfgStream);
            SQL sql = new SQL(config);

            Encoder encoder;
            InputStream resourceAsStream = super.getServletContext().getResourceAsStream(config.getProperty("classifier"));
            assert resourceAsStream != null;
            BufferedInputStream bis = new BufferedInputStream(new GZIPInputStream(resourceAsStream));
            Document doc = DocumentNavigator.documentFromStream(inputStream);

            /* check document for schema to set the context */
            System.out.println(doc);
            InstructionNode iNode = doc.getInstructionNode("xml-model");

            Context context = null;
            if (iNode.getType() == NodeType.INSTRUCTION){
                if (iNode.hasAttribute("href")){
                    Attribute attr = iNode.getAttribute("href");
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

            encoder = new Encoder(doc, context, sql, new Classifier(bis));
            resourceAsStream.close();

            /** add the schema **/
            String schemaURL = context.schemaName;
            if (schemaURL != null && !schemaURL.isEmpty()) {
                InputStream schemaStream = new URL(schemaURL).openStream();
                Document document = DocumentNavigator.documentFromStream(schemaStream);
                Schema schema = new Schema(document);
                encoder.setSchema(schema);
            }

            Document encoded = encoder.encode();

            json.put("result", "processed");
            json.put("output", encoded);
        } catch (InvalidTokenException | ParserConfigurationException | ClassNotFoundException | InstantiationException | IllegalAccessException | SQLException | ClassifierException | ClassCastException | NullPointerException ex) {
            super.exception(response, ex);
            return false;
        }
        return true;
    }
}
