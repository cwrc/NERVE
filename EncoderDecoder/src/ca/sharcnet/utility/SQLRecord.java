package ca.sharcnet.utility;
import java.util.HashMap;

/**
 * A single row/record of an SQL query result.
 * @author Ed Armstrong
 */
public class SQLRecord extends HashMap<String, String>{
    public boolean has(String column, String value){
        return this.get(column).equals(value);
    }
}