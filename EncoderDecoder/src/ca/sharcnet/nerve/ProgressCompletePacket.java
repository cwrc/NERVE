package ca.sharcnet.nerve;

import ca.fa.jjjrmi.annotations.NativeJS;
import ca.fa.jjjrmi.annotations.ProcessLevel;

@NativeJS(trans=true, processLevel=ProcessLevel.NONE)
public class ProgressCompletePacket extends ProgressPacket{
    public ProgressCompletePacket() {
        super("", -1, -1);
    }
}