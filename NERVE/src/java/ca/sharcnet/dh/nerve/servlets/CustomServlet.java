package ca.sharcnet.dh.nerve.servlets;
import java.io.IOException;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.json.JSONObject;
import org.json.JSONArray;
import static java.util.logging.Logger.getLogger;

public abstract class CustomServlet extends HttpServlet {
    private static final boolean trace = true;
    private static final boolean debug = true;

    private JSONObject jsonLog, jsonRoot;
    private JSONObject checkedParamters;
    private HttpServletRequest request;

    public static void trace(String text) {
        Logger logger = getLogger(CustomServlet.class.getName());
        if (trace) {
            logger.info(text);
        }
    }

    public static void debug(String text) {
        Logger logger = getLogger(CustomServlet.class.getName());
        if (debug) {
            logger.info(text);
        }
    }

    protected synchronized final void processRequest(HttpServletRequest request, HttpServletResponse response) throws IOException {
        jsonLog = new JSONObject();
        jsonRoot = new JSONObject();

        try {
            trace(request.getRequestURI() + "?" + request.getQueryString());
            response.setContentType("application/json");
            response.setHeader("Access-Control-Allow-Origin", "*");

            String requestString = request.getRequestURI() + "?" + request.getQueryString();
            jsonLog.put("request", requestString);
            this.request = request;
            jsonLog.put("result", "success");

            checkedParamters = new JSONObject();
            jsonLog.put("checkedParameters", checkedParamters);

            if (processRequest(request, response, jsonRoot)) {trace(request.getRequestURI() + "?" + request.getQueryString() + " : onSuccess()");}
            else if(jsonLog.has("reason")) {trace(request.getRequestURI() + "?" + request.getQueryString() + " : onFailure(" + jsonLog.getString("reason") + ")");}
            else {trace(jsonLog.toString());}
        } catch (Exception ex) {
            this.exception(response, ex);
        }

        jsonRoot.put("__servletLog", jsonLog);
        response.getWriter().write(jsonRoot.toString(2));
    }

    /**
     * Called by the parent class 'CustomServlet' when page is requested.
     * @param request the HttpServletRequest object that contains the request the client made of the servlet
     * @param response the HttpServletResponse object that contains the response the servlet returns to the client
     * @param json the JSONObject which will be sent to the requesting connection.
     * @return true to indicate success, false to indicate failure
     * @throws ServletException
     * @throws IOException
     */
    abstract protected boolean processRequest(HttpServletRequest request, HttpServletResponse response, JSONObject json) throws ServletException, IOException;

    public boolean setFailure(String reason) {
        trace(request.getRequestURI() + "?" + request.getQueryString() + " : onFailure(" + reason + ")");
        jsonLog.put("reason", reason);
        jsonLog.put("result", "failure");
        return false;
    }

    protected boolean requiredParameter(String pName) {
        String pValue = request.getParameter(pName);

        JSONObject jObj = new JSONObject();
        checkedParamters.put(pName, jObj);
        jObj.put("checkType", "required");

        if (pValue == null) {
            trace(request.getRequestURI() + "?" + request.getQueryString() + " : onFailure(null parameter " + pName + "')");
            setFailure("null paramter " + pName);
            return false;
        }

        if (pValue.isEmpty()) {
            trace(request.getRequestURI() + "?" + request.getQueryString() + " : onFailure(empty parameter " + pName + "')");
            setFailure("empty paramter " + pName);
            return false;
        }

        jObj.put("value", pValue);
        return true;
    }

    protected boolean nonEmptyParameter(String pName) {
        String pValue = request.getParameter(pName);

        JSONObject jObj = new JSONObject();
        checkedParamters.put(pName, jObj);
        jObj.put("checkType", "nonEmpty");

        if (pValue == null) return true;

        if (pValue.isEmpty()) {
            trace(request.getRequestURI() + "?" + request.getQueryString() + " : onFailure(empty parameter " + pName + "')");
            setFailure("empty paramter " + pName);
            return false;
        }

        jObj.put("value", pValue);

        return true;
    }

    protected String defaultParameter(String pName, String defaultValue) {
        String pValue = request.getParameter(pName);
        if (pValue == null || pValue.isEmpty()) {pValue = defaultValue;}

        JSONObject jObj = new JSONObject();
        checkedParamters.put(pName, jObj);
        jObj.put("checkType", "default");
        jObj.put("value", pValue);

        return pValue;
    }

    protected String getParameter(String pName) {
        String pValue = request.getParameter(pName);
        if (pValue == null) {pValue = "";}
        return pValue;
    }

    /**
     * Returns a non-null session attribute.
     * @param name the desires attribute
     * @return If the session does not exist, or the attribute does not extst, return an empty string
     */
    protected String sessionAttribute(String name){
        /* if a session exists with a attribute 'uid' set the session directory
         * to uid, if the directory does not exist, create it
         */
        HttpSession session = request.getSession(false);
        String value = "";
        if (session != null) {
            Object attribute = session.getAttribute("uid");
            if (attribute != null) value = attribute.toString();
        }
        return value;
    }

    public void exception(HttpServletResponse response, Exception ex) throws IOException {
        response.setStatus(200);
        jsonLog.put("result", "exception");
        JSONArray stackTrace = new JSONArray();
        JSONObject exception = new JSONObject();

        exception.put("class", ex.getClass().getCanonicalName());
        exception.put("message", ex.getMessage() != null ? ex.getMessage() : "NULL");
        for (StackTraceElement ele : ex.getStackTrace()) {
            stackTrace.put(ele.toString());
        }

        exception.put("stackTrace", stackTrace);
        jsonLog.put("exception", exception);
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
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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
