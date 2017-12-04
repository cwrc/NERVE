package ca.sharcnet.nerve.encoder;

import ca.sharcnet.nerve.IsMonitor;
import java.util.ArrayList;

public class EncodeOptions {
    private final ArrayList<EncodeProcess> processes = new ArrayList<>();
    private IsMonitor monitor = null;

    public void addProcess(EncodeProcess encodeProcess){
        this.processes.add(encodeProcess);
    }

    public EncodeProcess[] getProcesses(){
        return processes.toArray(new EncodeProcess[processes.size()]);
    }

    public boolean hasMonitor(){
        return monitor != null;
    }

    public IsMonitor getMonitor() {
        return monitor;
    }

    public void setMonitor(IsMonitor monitor) {
        this.monitor = monitor;
    }
}