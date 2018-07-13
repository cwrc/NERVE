package ca.sharcnet.nerve.encoder;

import ca.frar.utility.SQL.SQLRecord;

public interface OnAccept {
    public void accept(String string, SQLRecord row);
}
