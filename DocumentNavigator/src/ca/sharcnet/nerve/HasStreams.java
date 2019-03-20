package ca.sharcnet.nerve;
import java.io.InputStream;

public interface HasStreams {
    public InputStream getResourceStream(String path);
}