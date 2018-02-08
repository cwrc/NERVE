package ca.sharcnet.nerve;
import ca.sharcnet.nerve.ProgressPacket;

public interface ProgressListener {
    public void onEvent(ProgressPacket packet);
}
