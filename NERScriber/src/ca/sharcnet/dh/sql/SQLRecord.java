package ca.sharcnet.dh.sql;
import java.util.Arrays;
import java.util.Iterator;

/**
 * A single row/record of an SQL query result.
 * @author Ed Armstrong
 */

public class SQLRecord implements Iterable<SQLEntry>{
    private final SQLEntry[] entries;

    SQLRecord(int size) {
        entries = new SQLEntry[size];
    }

    void put(int i, String column, String value) {
        entries[i] = new SQLEntry(column, value);
    }

    public SQLEntry getEntry(String column){
        for (int i = 0; i < entries.length; i++){
            if (entries[i].getName().equals(column)) return entries[i];
        }
        return null;
    }

    @Override
    public Iterator<SQLEntry> iterator() {
        return Arrays.<SQLEntry>asList(entries).iterator();
    }
}