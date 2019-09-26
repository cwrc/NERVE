package ca.sharcnet.nerve.docnav;
import java.io.InputStream;

public interface HasStreams {
    public InputStream getResourceStream(String path);
}