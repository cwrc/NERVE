package ca.sharcnet.dh.scriber.stringmatch;

import ca.sharcnet.dh.sql.*;

public interface OnAccept {
    public void accept(String string, SQLRecord row);
}
