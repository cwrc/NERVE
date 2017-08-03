package ca.sharcnet.utility;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;

/**
 * The result of an SQL query.  JJJEncodes as an object consisting of an array
 * of key-value pairs.
 * @author Ed Armstrong
 */
public class SQLResult extends ArrayList<SQLRecord> {

    public SQLResult(ResultSet rs) throws SQLException {
        ResultSetMetaData rsmd = rs.getMetaData();
        rs.beforeFirst();

        while (rs.next()) {
            SQLRecord row = new SQLRecord();
            add(row);
            for (int i = 0; i < rsmd.getColumnCount(); i++) {
                String column = rsmd.getColumnName(i + 1);
                String value = rs.getString(i + 1);
                if (value == null) value = "";
                row.put(column, value);
            }
        }
    }

    public SQLRecord getRow(int i){
        return this.get(i);
    }
}