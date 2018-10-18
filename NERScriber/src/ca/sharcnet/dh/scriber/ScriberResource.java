package ca.sharcnet.dh.scriber;
import java.io.InputStream;

public class ScriberResource implements HasStreams{
    private static ScriberResource instance = new ScriberResource();    
    public static ScriberResource getInstance(){ return instance; }
    
    private ScriberResource(){}
    
    @Override
    public InputStream getResourceStream(String path) {
        return ScriberResource.class.getResourceAsStream("/res/" + path);
    }
}
