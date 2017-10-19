package ca.sharcnet.nerve;

public interface IsMonitor {

    public static final IsMonitor nullMonitor = new IsMonitor() {
        @Override public void step(int step, int stepMax) {}
        @Override public void phase(String message, int i, int max) {}
    };

    public void phase(String phaseName, int phaseIndex, int phaseMax);
    public void step(int stepIndex, int stepMax);
}
