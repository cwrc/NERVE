package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.ClientSide;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.JJJOptions;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.frar.utility.console.Console;
import ca.sharcnet.nerve.ProgressListener;
import ca.sharcnet.nerve.ProgressPacket;

@JJJ("ProgressMonitor")
@JJJOptions(jsExtends="require('Nidget/src/AbstractModel')")
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
