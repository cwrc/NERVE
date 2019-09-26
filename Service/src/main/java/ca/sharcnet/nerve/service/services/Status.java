/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.service.services;

import ca.sharcnet.nerve.docnav.DocumentParseException;
import static ca.sharcnet.nerve.service.services.ServiceBase.CONFIG_PATH;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.Properties;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONObject;

/**
 *
 * @author edward
 */
@WebServlet(name = "Status", urlPatterns = {"/Status"})
public class Status extends ServiceBase {
    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger(ServiceBase.class);
    
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        processRequest(request, response);
    }    
    
    @Override
    protected JSONObject run(JSONObject inputJSON, HttpServletRequest request, HttpServletResponse response) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, DocumentParseException {
        LOGGER.debug("processRequest enter");

        JSONObject reponseJSON = new JSONObject();
        reponseJSON.put("status", "running");
        reponseJSON.put("servlet context path", request.getContextPath());
        reponseJSON.put("real path", this.getServletContext().getRealPath("."));
        reponseJSON.put("configuration path", this.getServletContext().getRealPath(ServiceBase.CONFIG_PATH));

        InputStream configStream = this.getServletContext().getResourceAsStream(CONFIG_PATH);
        if (configStream != null) {
            JSONObject configJSON = new JSONObject();
            Properties config = new Properties();
            config.load(configStream);
            configStream.close();
            for (Object key : config.keySet()) {
                configJSON.put((String) key, config.get(key));
            }
            reponseJSON.put("configuration settings", configJSON);
            if (ServiceBase.classifier == null) {
                reponseJSON.put("classifier", "null");
            } else {
                reponseJSON.put("classifier", ServiceBase.classifier.getClass().getCanonicalName());
            }
        }

        return reponseJSON;
    }

}
