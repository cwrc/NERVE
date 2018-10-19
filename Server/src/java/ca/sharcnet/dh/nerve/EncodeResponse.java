package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.sharcnet.dh.scriber.context.Context;

@JJJ
public class EncodeResponse extends JJJObject{
    private final String text;
    private final String context;
    private final String schemaURL;
    private String filename = "";

    public EncodeResponse(String text, String context, String schemaURL){
        this.text = text;
        this.context = context;
        this.schemaURL = schemaURL;
    }

    @NativeJS
    public void setFilename(String filename){
        this.filename = filename;
    }
    
    /**
     * @return the text
     */
    @NativeJS
    public String getText() {
        return text;
    }

    /**
     * @return the context
     */
    @NativeJS
    public String getContext() {
        return context;
    }

    /**
     * @return the schemaURL
     */
    @NativeJS
    public String getSchemaURL() {
        return schemaURL;
    }

    /**
     * @return the filename
     */
    @NativeJS
    public String getFilename() {
        return filename;
    }    
}
