package ca.sharcnet.nerve.scriber.service;
import ca.sharcnet.nerve.scriber.context.Context;
import ca.sharcnet.nerve.scriber.context.ContextLoader;
import ca.sharcnet.nerve.scriber.dictionary.Dictionary;
import ca.sharcnet.nerve.scriber.encoder.EncoderManager;
import ca.sharcnet.nerve.scriber.encoder.servicemodules.EncoderDictLink;
import ca.sharcnet.nerve.scriber.encoder.servicemodules.EncoderNER;
import ca.sharcnet.nerve.scriber.ner.LocalClassifier;
import ca.sharcnet.nerve.scriber.query.Query;
import ca.sharcnet.nerve.scriber.schema.RelaxNGSchema;
import ca.sharcnet.nerve.scriber.schema.RelaxNGSchemaLoader;
import ca.sharcnet.nerve.scriber.sql.SQL;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.Properties;
import java.util.stream.Collectors;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.logging.log4j.Level;
import org.json.JSONObject;
import org.xml.sax.SAXException;

@WebServlet(name = "ner", urlPatterns = {"/ner"})
public class EncoderNERService extends HttpServlet {
    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger("EncoderNERService");
    final Level VERBOSE = Level.forName("VERBOSE", 450);
    final static String CONFIG_PATH = "WEB-INF/config.properties";
    final static String CONTEXT_PATH = "WEB-INF/";
    static LocalClassifier lClassifier = null;
    
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        processRequest(request, response);
    }

    protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            unHandledProcessRequest(request, response);
        } catch (Exception ex) {
            LOGGER.catching(ex);
            JSONObject jsonResponse = this.badRequest(ex.getMessage());
            try (PrintWriter out = response.getWriter()) {
                out.print(jsonResponse.toString());
            }
        }
    }

    protected void unHandledProcessRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException, SAXException, ParserConfigurationException, Exception {
        response.setContentType("application/json;charset=UTF-8");
        JSONObject jsonResponse;

        /* get all of the input as one string */
        String input = request.getReader().lines().collect(Collectors.joining());
        LOGGER.trace(input);

        if (input == null || input.isEmpty()) {
            jsonResponse = this.badRequest("Missing JSON in message body.");
        } else if (request.getHeader("Content-Type").contains("text/xml")){
            JSONObject jsonRequest = new JSONObject();
            jsonRequest.put("document", input);
            jsonResponse = this.run(jsonRequest);
            
            try (PrintWriter out = response.getWriter()) {
                out.print(jsonResponse.get("document"));
                LOGGER.log(VERBOSE, jsonResponse);
            }                        
        } else if (request.getHeader("Content-Type").contains("application/json")){
            JSONObject jsonRequest = new JSONObject(input);
            jsonResponse = this.run(jsonRequest);
            
            try (PrintWriter out = response.getWriter()) {
                out.print(jsonResponse.toString());
                LOGGER.log(VERBOSE, jsonResponse);
            }            
        } else if (request.getHeader("Content-Type").contains("application/x-www-form-urlencoded")){
            // kludge: handle 2019 CWRC-Writer resquest (blob not form data as content-type implies)
            JSONObject jsonRequest = new JSONObject(input);
            jsonResponse = this.run(jsonRequest);
            
            try (PrintWriter out = response.getWriter()) {
                out.print(jsonResponse.toString());
                LOGGER.log(VERBOSE, jsonResponse);
            }            
        } else {
            throw new Exception("Content-Type header not supported: " + request.getHeader("Content-Type"));
        }
    }
    
    /**
     * Used when an incoming JSON object is missing or malformed.
     *
     * @param message
     * @return
     */
    public final JSONObject badRequest(String message) {
        JSONObject json = new JSONObject();
        json.put("http-response-status", 400);
        json.put("message", message);
        return json;
    }

    private Properties loadProperties() throws FileNotFoundException, IOException {
        InputStream configStream = this.getServletContext().getResourceAsStream(CONFIG_PATH);

        if (configStream == null) {
            String msg = "Configuration file not found '" + this.getServletContext().getRealPath(CONFIG_PATH) + "'";
            LOGGER.log(VERBOSE, msg);
            throw new FileNotFoundException(msg);
        }

        Properties properties = new Properties();
        properties.load(configStream);
        configStream.close();

        return properties;
    }

    private void loadClassifier(Properties properties) throws IOException, ClassCastException, ClassNotFoundException{
        if (lClassifier == null){ 
            String classifierPath = properties.getProperty("classifier");
            String realPath = this.getServletContext().getRealPath(classifierPath);
            EncoderNERService.lClassifier = new LocalClassifier(realPath);
        }
    }
    
    private JSONObject run(JSONObject json) throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException, SAXException, ParserConfigurationException {
        Properties properties = this.loadProperties();
        loadClassifier(properties);
        
        /* Create dictionary */
        String dbURL = properties.getProperty("databaseURL");
        String dbPath = properties.getProperty("databasePath");
        String realDBPath = this.getServletContext().getRealPath(dbPath);
        String dbDriver = properties.getProperty("databaseDriver");

        SQL sql = new SQL(dbDriver, dbURL + realDBPath);
        Dictionary dictionary = new Dictionary(sql);
        dictionary.setTable("demonstration");
        dictionary.verifySQL();

        /* Load the document */
        if (!json.has("document")) return this.badRequest("Missing JSON 'document' parameter.");
        String documentSource = json.getString("document");
        Query document = new Query(documentSource);

        /* Discover context file (if not specified) */
        Context context = null;
        if (json.has("context")) {// use provided context            
            JSONObject jsonObject = json.getJSONObject("context");
            context = new Context(jsonObject);
        } else {
            String contextFilename = CONTEXT_PATH + "default.context.json";
            Query instrNodes = document.select(":inst").filter("xml-model");

            if (!instrNodes.isEmpty()) {
                String hrefAttr = document.select(":inst").attribute("href");
                if (hrefAttr.contains("cwrc.ca/schemas/orlando_biography_v2.rng")) {
                    LOGGER.log(VERBOSE, "Context detected for : " + hrefAttr);
                    contextFilename = CONTEXT_PATH + "orlando.context.json";
                } else if (hrefAttr.contains("cwrc.ca/schemas/cwrc_tei_lite.rng")) {
                    LOGGER.log(VERBOSE, "Context detected for : " + hrefAttr);
                    contextFilename = CONTEXT_PATH + "tei.context.json";
                } else if (hrefAttr.contains("cwrc.ca/schemas/cwrc_entry.rng")) {
                    LOGGER.log(VERBOSE, "Context detected for : " + hrefAttr);
                    contextFilename = CONTEXT_PATH + "cwrc.context.json";
                }                                
            }
            LOGGER.log(VERBOSE, "Context filename set to : " + contextFilename);

            InputStream resourceAsStream = this.getServletContext().getResourceAsStream(contextFilename);
            context = ContextLoader.load(resourceAsStream);
        }

        LOGGER.log(VERBOSE, "Context: " + context.getSourceString());

        /* Load the remote schema (use default.rng from context directory if none found) */
        Query xmlModelInstruction = document.select(":inst").filter("xml-model");
        RelaxNGSchema schema = null;
        Query instrNodes = document.select(":inst").filter("xml-model");
        String schemaURL;
        if (!instrNodes.isEmpty()) {
            schemaURL = xmlModelInstruction.attribute("href");
            schema = RelaxNGSchemaLoader.schemaFromURL(xmlModelInstruction.attribute("href"));
            LOGGER.log(VERBOSE, "Schema set to : " + xmlModelInstruction.attribute("href"));
        } else {
            schemaURL = CONTEXT_PATH + "default.rng";
            String realPath = this.getServletContext().getRealPath(schemaURL);
            schema = RelaxNGSchemaLoader.schemaFromFile(new File(realPath));
            LOGGER.log(VERBOSE, "Schema set to default");
        }

        /* Setup the manager */
        EncoderManager manager = new EncoderManager();
        manager.setDocument(document);
        manager.setSchema(schema, "");
        manager.setContext(context);
        manager.addDictionary(dictionary);

        /* Add ner process to manager */
        if (!json.has("ner") || json.getBoolean("ner")) {
            manager.addProcess(new EncoderNER(lClassifier));
            LOGGER.log(VERBOSE, "NER Selected : true");
        } else {
            LOGGER.log(VERBOSE, "NER Selected : false");
        }

        /* Add link process to manager */
        if (!json.has("dict") || json.getBoolean("dict")) {
            manager.addProcess(new EncoderDictLink());
            LOGGER.log(VERBOSE, "DICT Selected : true");
        } else {
            LOGGER.log(VERBOSE, "DICT Selected : false");
        }

        /* Execute the process */
        manager.run();
        Query result = manager.getQuery();
        String resultString = result.toString();
        
        JSONObject response = new JSONObject();
        response.put("document", resultString);
        response.put("context", context.getSourceString());
        response.put("schemaURL", schemaURL);
        
        return response;
    }
}
