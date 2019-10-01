package ca.sharcnet.nerve.scriber.stringmatch;

import ca.sharcnet.nerve.scriber.sql.SQLRecord;

public interface OnAccept {
    public void accept(String string, SQLRecord row);
}
