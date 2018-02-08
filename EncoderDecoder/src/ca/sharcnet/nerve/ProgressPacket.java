package ca.sharcnet.nerve;

import ca.fa.jjjrmi.annotations.NativeJS;
import ca.fa.jjjrmi.annotations.ProcessLevel;

@NativeJS(trans=true, processLevel=ProcessLevel.NONE)
public class ProgressPacket {
    public final String message;
    public final int current;
    public final int total;

    public ProgressPacket(String message, int current, int total){
        this.message = message;
        this.current = current;
        this.total = total;
    }

    public ProgressPacket(int current, int total){
        this.message = "";
        this.current = current;
        this.total = total;
    }
}
