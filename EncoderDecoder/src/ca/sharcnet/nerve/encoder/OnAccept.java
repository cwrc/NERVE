package ca.sharcnet.nerve.encoder;
import org.json.JSONObject;

public interface OnAccept {
    public void accept(String string, JSONObject row);
}
