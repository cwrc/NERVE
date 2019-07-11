package ca.sharcnet.dh.sql;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;

/**
 * The result of an SQL query.  JJJEncodes as an object consisting of an array
 * of key-value pairs.
 * @author Ed Armstrong
 */

public class SQLResult implements Iterable<SQLRecord>{
    private SQLRecord[] records;

    public SQLResult(ResultSet rs) throws SQLException {
        ResultSetMetaData rsmd = rs.getMetaData();
//        rs.beforeFirst();

        ArrayList<SQLRecord> list = new ArrayList<>();

        while (rs.next()) {
            SQLRecord row = new SQLRecord(rsmd.getColumnCount());
            list.add(row);
            for (int i = 0; i < rsmd.getColumnCount(); i++) {
                String column = rsmd.getColumnName(i + 1);
                String value = rs.getString(i + 1);
                if (value == null) value = "";
                row.put(i, column, value);
            }
        }

        records = list.toArray(new SQLRecord[list.size()]);
    }

    public int size(){
        return records.length;
    }

    public boolean isEmpty(){
        return records.length == 0;
    }

    public SQLRecord get(int i){
        return records[i];
    }

    @Override
    public Iterator<SQLRecord> iterator() {
        return Arrays.asList(records).iterator();
    }
    
    @Override
    public String toString(){
        StringBuilder builder = new StringBuilder();
        builder.append("{");
        for (int i = 0; i < records.length; i++){
            builder.append(records[i].toString()).append("\n");
        }
        builder.append("}");
        return builder.toString();
    }
}