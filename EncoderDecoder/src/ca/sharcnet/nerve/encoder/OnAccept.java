package ca.sharcnet.nerve.encoder;
import ca.fa.utility.SQLRecord;

public interface OnAccept {
    public void accept(String string, SQLRecord row);
}
