package ca.sharcnet.nerve.encoder;
import ca.sharcnet.utility.SQLRecord;

public interface OnAccept {
    public void accept(String string, SQLRecord row);
}
