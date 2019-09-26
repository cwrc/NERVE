package ca.sharcnet.nerve.scriber;
import java.io.InputStream;

public interface HasStreams {
    public InputStream getResourceStream(String path);
}
