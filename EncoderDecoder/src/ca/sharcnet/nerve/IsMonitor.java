package ca.sharcnet.nerve;

public interface IsMonitor {
    public void phase(String phase, int i, int phaseMax);
    public void step(int step, int stepMax);
}
