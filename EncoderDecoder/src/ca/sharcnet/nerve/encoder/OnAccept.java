package ca.sharcnet.nerve.encoder;
import ca.fa.SQL.SQLRecord;

public interface OnAccept {
    public void accept(String string, SQLRecord row);
}
