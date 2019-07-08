package ca.sharcnet.nerve.jacoco;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.stream.Collectors;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Process incoming http post requests into service requests with json input.
 *
 * @author Ed Armstrong
 */
public abstract class JSONServlet extends HttpServlet {

// <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.  This method is not supported
     * and will return an exception.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.returnException(response, new GetRequestNotSupported());
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
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "";
    }// </editor-fold>   

    protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            response.setContentType("application/json;charset=UTF-8");

            String input = request.getReader().lines().collect(Collectors.joining());

            JSONObject jsonRequest = new JSONObject(input);
            JSONObject jsonResponse = this.processRequest(jsonRequest, request.getSession());

            if (jsonResponse.has("status")) {
                response.setStatus(jsonResponse.getInt("status"));
            }

            try (PrintWriter out = response.getWriter()) {
                out.print(jsonResponse.toString());
            }
        } catch (Exception ex) {
            returnException(response, ex);
        }
    }

    /**
     * Used when an incoming JSON object is missing a parameter.
     * @param message
     * @return 
     */
    public final JSONObject badRequest(String message) {
        JSONObject json = new JSONObject();
        json.put("status", 400);
        json.put("message", message);
        return json;
    }

    /**
     * Format a JSON object with exception details and write out response.
     * @param response
     * @param exception
     * @throws IOException 
     */
    public final void returnException(HttpServletResponse response, Exception exception) throws IOException {
        response.setStatus(500);
        JSONObject jsonException = new JSONObject();
        jsonException.put("exception", exception.getClass().getCanonicalName());
        jsonException.put("message", exception.getMessage());

        JSONArray jsonArray = new JSONArray();
        StackTraceElement[] stackTrace = exception.getStackTrace();
        for (StackTraceElement element : stackTrace) {
            jsonArray.put(element.toString());
        }

        jsonException.put("stacktrace", jsonArray);

        try (PrintWriter out = response.getWriter()) {
            out.print(jsonException.toString());
        }
    }

    /**
     * Service endpoints must override this method.  This method is called
     * when the json object is created
     * @param json
     * @return
     * @throws IOException
     * @throws ClassNotFoundException
     * @throws InstantiationException
     * @throws IllegalAccessException
     * @throws SQLException
     * @throws ParserConfigurationException
     * @throws DocumentParseException 
     */
    abstract public JSONObject processRequest(JSONObject json, HttpSession session) throws IOException;
}
