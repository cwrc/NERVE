package ca.sharcnet.dh.sql;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.JJJOptions;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.jjjrmi.annotations.SkipJS;
import java.util.Arrays;
import java.util.Iterator;

/**
 * A single row/record of an SQL query result.
 * @author Ed Armstrong
 */

@JJJ
@JJJOptions(retain=false)
public class SQLRecord implements Iterable<SQLEntry>{
    private final SQLEntry[] entries;

    @SkipJS
    SQLRecord(int size) {
        entries = new SQLEntry[size];
    }

    @SkipJS
    void put(int i, String column, String value) {
        entries[i] = new SQLEntry(column, value);
    }

    public SQLEntry getEntry(String column){
        for (int i = 0; i < entries.length; i++){
            if (entries[i].getName().equals(column)) return entries[i];
        }
        return null;
    }

    @NativeJS("[Symbol.iterator]")
    private void jsIterator(){
        /*JS{return this.entries[Symbol.iterator]();}*/
    }

    @Override
    public Iterator<SQLEntry> iterator() {
        return Arrays.<SQLEntry>asList(entries).iterator();
    }
}