package ca.sharcnet.dh.sql;
import ca.frar.utility.console.Console;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Enumeration;
import java.util.Properties;

/**
 * Wrapper class for SQL query/update calls.
 * @author Ed Armstrong
 */
public class SQL {
    
    public static String sanitize(String innerText) {
        String rvalue = innerText.replaceAll("\\\"", "\\\\\"");
        return "\"" + rvalue + "\"";
    }

    private final String url, user, pass, driver, dbName;

    public SQL(Properties config) throws ClassNotFoundException, IllegalAccessException, IOException, SQLException, InstantiationException {
        if (config == null) throw new NullPointerException("config not found");
        
        url = config.getProperty("databaseURL");
        user = config.getProperty("databaseUser");
        pass = config.getProperty("databasePassword");
        driver = config.getProperty("databaseDriver");
        dbName = config.getProperty("databaseName");

        if (url == null || driver == null){
            Enumeration<?> propertyNames = config.propertyNames();
            while (propertyNames.hasMoreElements()){
                Console.log(propertyNames.nextElement());
            }
            throw new NullPointerException("property not found");
        }
        
        Class.forName(driver).newInstance();
    }

    public int update(String query) throws SQLException {
        Connection conn = DriverManager.getConnection(url, user, pass);
        Statement statement = conn.createStatement();
        int rvalue = statement.executeUpdate(query);
        conn.close();
        return rvalue;
    }

    public int update(String query, Object ... objects) throws SQLException {
        String[] strings = new String[objects.length];
        for (int i = 0; i < objects.length; i++) strings[i] = sanitize(objects[i].toString());
        return update(String.format(query, strings));
    }

    public SQLResult query(String query) throws SQLException {
        Connection conn = DriverManager.getConnection(url, user, pass);
        Statement statement = conn.createStatement();
        ResultSet rs = statement.executeQuery(query);
        SQLResult sqlResult = new SQLResult(rs);
        conn.close();
        return sqlResult;
    }

    public SQLResult tables() throws SQLException {
        Connection conn = DriverManager.getConnection(url, user, pass);
        ResultSet tables = conn.getMetaData().getTables(null, null, "%", null);
        SQLResult sqlResult = new SQLResult(tables);
        conn.close();
        return sqlResult;
    }    
    
    public SQLResult query(String query, Object ... objects) throws SQLException {
        String[] strings = new String[objects.length];
        for (int i = 0; i < objects.length; i++){
            if (objects[i] == null) throw new NullPointerException("Query object " + i + " is null.");
            strings[i] = sanitize(objects[i].toString());
        }
        return query(String.format(query, strings));
    }
    
    public String formatString(String query, Object ... objects){
        String[] strings = new String[objects.length];
        for (int i = 0; i < objects.length; i++){
            if (objects[i] == null) throw new NullPointerException("Query object " + i + " is null.");
            strings[i] = sanitize(objects[i].toString());
        }
        return String.format(query, strings);    
    }
}