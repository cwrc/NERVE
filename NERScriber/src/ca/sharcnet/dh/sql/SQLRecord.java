package ca.sharcnet.dh.sql;

import java.util.Arrays;
import java.util.Iterator;

/**
 * A single row/record of an SQL query result.
 *
 * @author Ed Armstrong
 */
public class SQLRecord implements Iterable<SQLEntry> {

    private final SQLEntry[] entries;

    SQLRecord(int size) {
        entries = new SQLEntry[size];
    }

    void put(int i, String column, String value) {
        entries[i] = new SQLEntry(column, value);
    }

    public SQLEntry getEntry(String column) {
        for (int i = 0; i < entries.length; i++) {
            if (entries[i].getName().equals(column)) return entries[i];
        }
        return null;
    }

    public SQLEntry getEntry(int i) {
        if (i < 0 || i > entries.length) throw new IndexOutOfBoundsException();
        return entries[i];
    }

    @Override
    public Iterator<SQLEntry> iterator() {
        return Arrays.<SQLEntry>asList(entries).iterator();
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("{");
        for (int i = 0; i < entries.length; i++) {            
            builder.append(entries[i].getName()).append(":").append(entries[i].getValue());
            if (i != entries.length - 1) builder.append(", ");
        }
        builder.append("}");
        return builder.toString();
    }
}
