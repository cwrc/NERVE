package ca.sharcnet.nerve;

public class NullMonitor implements IsMonitor {
    @Override
    public void step(int step, int stepMax) {}

    @Override
    public void phase(String message, int i, int max) {}
}
