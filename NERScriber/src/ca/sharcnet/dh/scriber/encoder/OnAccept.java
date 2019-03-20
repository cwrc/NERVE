package ca.sharcnet.dh.scriber.encoder;

import ca.sharcnet.dh.sql.*;

public interface OnAccept {
    public void accept(String string, SQLRecord row);
}
