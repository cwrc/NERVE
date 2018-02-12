package ca.sharcnet.nerve;

import ca.fa.jjjrmi.annotations.JSExtends;
import ca.fa.jjjrmi.annotations.NativeJS;
import ca.fa.jjjrmi.annotations.ProcessLevel;

@NativeJS(trans=true, processLevel=ProcessLevel.NONE)
@JSExtends("ProgressPacket")
public class ProgressCompletePacket extends ProgressPacket{
    @NativeJS
    public ProgressCompletePacket() {
        super("", -1, -1);
    }
}