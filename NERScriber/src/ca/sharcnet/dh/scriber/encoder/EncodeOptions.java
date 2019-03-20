package ca.sharcnet.dh.scriber.encoder;

import java.util.ArrayList;

public class EncodeOptions {
    private final ArrayList<EncodeProcess> processes = new ArrayList<>();

    public EncodeOptions addProcess(EncodeProcess ... encodeProcesses){
        for (EncodeProcess encodeProcess : encodeProcesses){
            this.processes.add(encodeProcess);
        }
        return this;
    }

    public EncodeProcess[] getProcesses(){
        return processes.toArray(new EncodeProcess[processes.size()]);
    }
    
    public boolean hasProcess(EncodeProcess encodeProcess){
        return processes.contains(encodeProcess);
    }
}