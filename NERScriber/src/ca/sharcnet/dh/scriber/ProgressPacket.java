package ca.sharcnet.dh.scriber;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.JJJOptions;
import ca.frar.jjjrmi.translator.DataObject;

@JJJ
@JJJOptions(retain=false)
public class ProgressPacket implements DataObject{
    String message;
    int currentStep;
    int totalSteps;
    ProgressStage progressStage = ProgressStage.CONTINUE;

    public ProgressPacket message(String message){
        this.message = message;
        return this;
    }
    
    public ProgressPacket currentStep(int i){
        this.currentStep = i;
        return this;
    }

    public ProgressPacket totalSteps(int i){
        this.totalSteps = i;
        return this;
    }

    public ProgressPacket stage(ProgressStage progressStage){
        this.progressStage = progressStage;
        return this;
    }    
    
    public String toString(){
        return String.format("{%s, %d, %d, %s}", message, currentStep, totalSteps, progressStage);
    }
}
