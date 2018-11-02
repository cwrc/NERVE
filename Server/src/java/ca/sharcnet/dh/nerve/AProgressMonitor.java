package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.ClientSide;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.JJJOptions;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.sharcnet.dh.scriber.ProgressListener;
import ca.sharcnet.dh.scriber.ProgressPacket;

@JJJ("ProgressMonitor")
@JJJOptions(jsExtends="require('@thaerious/nidget').AbstractModel")
public abstract class AProgressMonitor implements ProgressListener{

    @NativeJS
    public AProgressMonitor(){

    }
    
    @ClientSide(true)
    @Override
    public void notifyProgress(ProgressPacket pp) {
        /*JS{
        this.notifyListeners("notifyProgress", pp);
        }*/
    }
    
}
