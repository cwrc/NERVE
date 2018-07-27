package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.sharcnet.nerve.context.Context;

@JJJ
public class EncodeResponse extends JJJObject{
    private final String text;
    private final Context context;
    private final String schemaURL;
    private String filename = "";

    public EncodeResponse(String text, Context context, String schemaURL){
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
    public String getText() {
        return text;
    }

    /**
     * @return the context
     */
    public Context getContext() {
        return context;
    }

    /**
     * @return the schemaURL
     */
    public String getSchemaURL() {
        return schemaURL;
    }

    /**
     * @return the filename
     */
    public String getFilename() {
        return filename;
    }    
}
