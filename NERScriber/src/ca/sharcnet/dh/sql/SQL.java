package ca.sharcnet.dh.sql;

import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.dictionary.Dictionary;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Enumeration;
import java.util.Properties;
import org.apache.logging.log4j.LogManager;

/**
 * Wrapper class for SQL query/update calls.
 *
 * @author Ed Armstrong
 */
public class SQL {
    final static org.apache.logging.log4j.Logger LOGGER = LogManager.getLogger(SQL.class);    
    
    public static String sanitize(String innerText) {
        if (innerText == null) innerText = "";
        String rvalue = innerText.replaceAll("'", "''");
        return "'" + rvalue + "'";
    }

    private final String url, driver;

    public SQL(String driver, String url) throws ClassNotFoundException, IllegalAccessException, IOException, SQLException, InstantiationException {
        if (url == null) throw new SQLPropertyNotFoundException("url");
        if (driver == null) throw new SQLPropertyNotFoundException("driver");
        this.url = url;
        this.driver = driver;
        Class.forName(driver).newInstance();
    }    
    
    public SQL(Properties config) throws ClassNotFoundException, IllegalAccessException, IOException, SQLException, InstantiationException {
        if (config == null) {
            throw new UnsetPropertiesException();
        }

        url = config.getProperty("databaseURL");
        driver = config.getProperty("databaseDriver");

        if (url == null) throw new SQLPropertyNotFoundException("url");
        if (driver == null) throw new SQLPropertyNotFoundException("driver");
        Class.forName(driver).newInstance();
    }

    public int update(String query) throws SQLException {
        Connection conn = null;
        try {
            conn = DriverManager.getConnection(url);
            Statement statement = conn.createStatement();
            int rvalue = statement.executeUpdate(query);
            return rvalue;
        } catch (SQLException ex) {
            throw ex;
        } finally {
            if (conn != null) {
                conn.close();
            }
        }
    }

    public int update(String query, Object... objects) throws SQLException {
        String[] strings = new String[objects.length];
        for (int i = 0; i < objects.length; i++) {
            strings[i] = sanitize(objects[i].toString());
        }
        return update(String.format(query, strings));
    }

    public SQLResult query(String query) throws SQLException {
        Connection conn = null;
        try {
            conn = DriverManager.getConnection(url);
            Statement statement = conn.createStatement();
            ResultSet rs = statement.executeQuery(query);
            SQLResult sqlResult = new SQLResult(rs);
            return sqlResult;
        } catch (SQLException ex) {
            throw ex;
        } finally {
            if (conn != null) {
                conn.close();
            }
        }
    }

    public SQLResult tables() throws SQLException {
        LOGGER.debug("tables()");
        Connection conn = DriverManager.getConnection(url);
        LOGGER.debug("connected");
        ResultSet tables = conn.getMetaData().getTables(null, null, "%", null);
        LOGGER.debug("result retreived");
        SQLResult sqlResult = new SQLResult(tables);
        LOGGER.debug("result made : " + sqlResult.size());
        conn.close();
        LOGGER.debug("connection closed");
        return sqlResult;
    }

    public SQLResult query(String query, Object... objects) throws SQLException {
        String[] strings = new String[objects.length];
        for (int i = 0; i < objects.length; i++) {
            if (objects[i] == null) {
                throw new NullPointerException("Query object " + i + " is null.");
            }
            strings[i] = sanitize(objects[i].toString());
        }
        return query(String.format(query, strings));
    }

    public String formatString(String query, Object... objects) {
        String[] strings = new String[objects.length];
        for (int i = 0; i < objects.length; i++) {
            if (objects[i] == null) {
                throw new NullPointerException("Query object " + i + " is null.");
            }
            strings[i] = sanitize(objects[i].toString());
        }
        return String.format(query, strings);
    }
}
