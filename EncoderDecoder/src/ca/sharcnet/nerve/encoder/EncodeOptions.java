package ca.sharcnet.nerve.encoder;

import java.util.ArrayList;

public class EncodeOptions {
    private final ArrayList<EncodeProcess> processes = new ArrayList<>();

    public void addProcess(EncodeProcess ... encodeProcesses){
        for (EncodeProcess encodeProcess : encodeProcesses){
            this.processes.add(encodeProcess);
        }
    }

    public EncodeProcess[] getProcesses(){
        return processes.toArray(new EncodeProcess[processes.size()]);
    }
}