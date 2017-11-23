package ca.sharcnet.dh.nerve;
import ca.fa.jjjrmi.annotations.NativeJS;
import ca.fa.jjjrmi.annotations.ProcessLevel;
import ca.sharcnet.nerve.context.Context;

@NativeJS(trans=true, processLevel=ProcessLevel.NONE)
public class EncodeResponse {
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
}
