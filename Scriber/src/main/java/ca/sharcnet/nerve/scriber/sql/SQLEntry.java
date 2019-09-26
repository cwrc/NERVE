package ca.sharcnet.nerve.scriber.sql;

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