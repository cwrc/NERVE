package ca.sharcnet.dh.nerve.services;

import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import static ca.sharcnet.dh.scriber.Constants.SCHEMA_NODE_ATTR;
import static ca.sharcnet.dh.scriber.Constants.SCHEMA_NODE_NAME;
import ca.sharcnet.dh.scriber.dictionary.Dictionary;
import ca.sharcnet.dh.scriber.encoder.EncoderManager;
import ca.sharcnet.dh.scriber.context.Context;
import ca.sharcnet.dh.scriber.context.ContextLoader;
import ca.sharcnet.dh.scriber.encoder.MalformedSchemaURL;
import ca.sharcnet.dh.sql.SQL;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.query.Query;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchema;
import ca.sharcnet.nerve.docnav.schema.relaxng.RelaxNGSchemaLoader;
import edu.stanford.nlp.ie.crf.CRFClassifier;
import edu.stanford.nlp.ling.CoreLabel;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.zip.GZIPInputStream;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONArray;
import org.json.JSONObject;

public abstract class ServiceBase extends HttpServlet {
    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger(ServiceBase.class);

    static Dictionary dictionary = null;
    static CRFClassifier<CoreLabel> classifier = null;
    final static String CONTEXT_PATH = "/WEB-INF/";
    final static String DEFAULT_SCHEMA = CONTEXT_PATH + "default.rng";
    final static String CONFIG_PATH = "/WEB-INF/config.properties";

    @Override
    public void init() {
        LOGGER.debug("NerveRoot() ... ");
        try {
            this.initDictionary();
            this.initClassifier();
            LOGGER.debug("exiting NerveRoot()");
        } catch (Exception ex) {
            LOGGER.catching(ex);
            if (ex.getCause() != null) {
                LOGGER.error("cause");
                LOGGER.catching(ex.getCause());
            } else {
                LOGGER.error("no cause");
            }
        }
    }

    private void initClassifier() throws IOException, ClassCastException, ClassNotFoundException {
        if (ServiceBase.classifier != null) {
            return;
        }
        LOGGER.debug("loading classifier ...");
        String classifierPath = "/WEB-INF/english.all.3class.distsim.crf.ser.gz";
        InputStream in = this.getServletContext().getResourceAsStream(classifierPath);
        GZIPInputStream gzip = new GZIPInputStream(in);
        ServiceBase.classifier = CRFClassifier.getClassifier(gzip);
        in.close();
        LOGGER.debug("... classifier loaded");
    }

    private void initDictionary() throws FileNotFoundException, IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException {
        LOGGER.debug("initializing dictionary ...");
        if (ServiceBase.dictionary != null) {
            return;
        }

        InputStream configStream = this.getServletContext().getResourceAsStream(CONFIG_PATH);
        LOGGER.debug("configuration file: " + this.getServletContext().getContextPath());
        if (configStream == null) {
            throw new FileNotFoundException(this.getServletContext().getRealPath(CONFIG_PATH));
        }

        LOGGER.debug("loading configuration ...");
        Properties config = new Properties();
        config.load(configStream);
        configStream.close();
        LOGGER.debug("configuration loaded");

        String dbURL = config.getProperty("databaseURL");
        String dbPath = config.getProperty("databasePath");
        String realPath = this.getServletContext().getRealPath(dbPath);
        String dbDriver = config.getProperty("databaseDriver");
        
        LOGGER.debug("loading sql ...");
        SQL sql = new SQL(dbDriver, dbURL + realPath);
        LOGGER.debug("SQL loaded");

        LOGGER.debug("loading dictionary ...");
        ServiceBase.dictionary = new Dictionary(sql);
        LOGGER.debug("dictionary loaded");

        LOGGER.debug("verifying dictionary ...");
        ServiceBase.dictionary.verifySQL();
        LOGGER.debug("dictionary verified");
        
        LOGGER.debug("... initializing dictionary");
    }

    EncoderManager createManager(String documentSource) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, DocumentParseException {
        EncoderManager manager = new EncoderManager();
        Document document = DocumentLoader.documentFromString(documentSource);
        manager.document(document);
        manager.dictionary(ServiceBase.dictionary);
        Context context = this.getContext(document);
        manager.context(context);

        Query model = document.query(NodeType.INSTRUCTION).filter(SCHEMA_NODE_NAME);
        String schemaAttrValue = model.attr(SCHEMA_NODE_ATTR);

        if (schemaAttrValue.isEmpty()) {
            InputStream resourceAsStream = this.getServletContext().getResourceAsStream(DEFAULT_SCHEMA);
            RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromStream(resourceAsStream);
            manager.setSchemaUrl("");
            manager.setSchema(schema);
        } else {
            manager.setSchemaUrl(schemaAttrValue);
            this.retrieveSchema(manager, schemaAttrValue);
        }

        return manager;
    }

    void retrieveSchema(EncoderManager manager, String schemaAttrValue) throws MalformedURLException, IOException, DocumentParseException {
        LOGGER.debug("retrieve schema " + schemaAttrValue);
        URL url = new URL(schemaAttrValue);

        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        if (connection.getResponseCode() == 302) {
            String locationField = connection.getHeaderField("Location");
            this.retrieveSchema(manager, locationField);
        } else {
            try (final InputStream resourceAsStream = url.openStream()) {
                if (resourceAsStream == null) {
                    throw new MalformedSchemaURL(schemaAttrValue);
                }
                RelaxNGSchema schema = RelaxNGSchemaLoader.schemaFromStream(resourceAsStream);
                manager.setSchema(schema);
            }
        }
    }

    public Context getContext(Document document) throws IllegalArgumentException, IOException {
        /* retrieve the schema url to set the context */
        Query model = document.query(NodeType.INSTRUCTION).filter(SCHEMA_NODE_NAME);
        String schemaAttrValue = model.attr(SCHEMA_NODE_ATTR);

        if (!schemaAttrValue.isEmpty()) {
            int index = schemaAttrValue.lastIndexOf('/');
            schemaAttrValue = schemaAttrValue.substring(index);
        }

        /* Choose the context based on the schema delcared in the xml document */
        String path;
        switch (schemaAttrValue) {
            case "/orlando_biography_v2.rng":
                path = CONTEXT_PATH + "orlando.context.json";
                break;
            case "/cwrc_entry.rng":
                path = CONTEXT_PATH + "cwrc.context.json";
                break;
            case "/cwrc_tei_lite.rng":
                path = CONTEXT_PATH + "tei.context.json";
                break;
            default:
                path = CONTEXT_PATH + "default.context.json";
                break;
        }

        InputStream resourceAsStream = this.getServletContext().getResourceAsStream(path);
        return ContextLoader.load(resourceAsStream);
    }

// <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>   

    protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            response.setContentType("application/json;charset=UTF-8");

            String input = request.getReader().lines().collect(Collectors.joining());

            JSONObject jsonRequest = new JSONObject(input);
            JSONObject jsonResponse = this.run(jsonRequest);

            if (jsonResponse.has("status")) {
                response.setStatus(jsonResponse.getInt("status"));
            }

            try (PrintWriter out = response.getWriter()) {
                out.print(jsonResponse.toString());
            }
        } catch (MalformedSchemaURL ex) {
            JSONObject jsonResponse = this.badRequest(ex.getMessage());
            response.setStatus(jsonResponse.getInt("status"));
            try (PrintWriter out = response.getWriter()) {
                out.print(jsonResponse.toString());
            }
        } catch (Exception ex) {
            Logger.getLogger(NER.class.getName()).log(Level.SEVERE, null, ex);
            response.setStatus(500);
            JSONObject jsonException = new JSONObject();
            jsonException.put("exception", ex.getClass().getCanonicalName());
            jsonException.put("message", ex.getMessage());

            JSONArray jsonArray = new JSONArray();
            StackTraceElement[] stackTrace = ex.getStackTrace();
            for (StackTraceElement element : stackTrace) {
                jsonArray.put(element.toString());
            }

            jsonException.put("stacktrace", jsonArray);

            try (PrintWriter out = response.getWriter()) {
                out.print(jsonException.toString());
            }
        }
    }

    public JSONObject badRequest(String message) {
        JSONObject json = new JSONObject();
        json.put("status", 400);
        json.put("message", message);
        return json;
    }

    abstract JSONObject run(JSONObject json) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, DocumentParseException;
}
