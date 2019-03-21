package ca.sharcnet.dh.sql;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.JJJOptions;

@JJJ
@JJJOptions(retain=false)
public class SQLEntry {
    private final String name;
    private final String value;

    public SQLEntry(String name, String value){
        this.name = name;
        this.value = value;
    }

    public String getName() {
        return name;
    }

    public String getValue() {
        return value;
    }
}