package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.ClientSide;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.JJJOptions;
import ca.frar.jjjrmi.annotations.NativeJS;
import ca.sharcnet.dh.progress.ProgressListener;

@JJJ("ProgressMonitor")
@JJJOptions(jsExtends="require('@thaerious/nidget').AbstractModel")
public abstract class AProgressMonitor implements ProgressListener{

    @NativeJS
    public AProgressMonitor(){}
    
    @ClientSide(true)
    @Override
    public void start(String message) {
        /*JS{
        this.notifyListeners("serverStart", message);
        }*/
    }

    @ClientSide(true)
    @Override
    public void updateMessage(String message) {
        /*JS{
        this.notifyListeners("serverUpdateMessage", message);
        }*/
    }
    
    @ClientSide(true)
    @Override
    public void updateProgress(int i) {
        /*JS{
        this.notifyListeners("serverUpdateProgress", i);
        }*/
    }

    @ClientSide(true)
    @Override
    public void end() {
        /*JS{
        this.notifyListeners("serverEnd");
        }*/
    }
}