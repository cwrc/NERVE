/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.services;

import static ca.sharcnet.nerve.services.ServiceBase.CONFIG_PATH;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.Properties;
import java.util.Set;
import java.util.stream.Collectors;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 *
 * @author edward
 */
@WebServlet(name = "Status", urlPatterns = {"/Status"})
public class Status extends HttpServlet {
    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger(ServiceBase.class);
    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        LOGGER.debug("processRequest enter");
        response.setContentType("application/json;charset=UTF-8");

        JSONObject json = new JSONObject();
        json.put("status", "running");
        json.put("servlet context path", request.getContextPath());
        json.put("real path", this.getServletContext().getRealPath("."));
        json.put("configuration path", this.getServletContext().getRealPath(ServiceBase.CONFIG_PATH));

        InputStream configStream = this.getServletContext().getResourceAsStream(CONFIG_PATH);
        if (configStream != null) {
            JSONObject configJSON = new JSONObject();
            Properties config = new Properties();
            config.load(configStream);
            configStream.close();
            for (Object key : config.keySet()){
                configJSON.put((String)key, config.get(key));
            }
            json.put("configuration settings", configJSON);
        }

        try (PrintWriter out = response.getWriter()) {
            out.print(json.toString(4));
        }
        
        LOGGER.info(json.toString(4));
        LOGGER.debug("processRequest exit");
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

}
