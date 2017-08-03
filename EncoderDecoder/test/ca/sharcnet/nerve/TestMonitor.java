package ca.sharcnet.nerve;

public class TestMonitor implements IsMonitor{
    String phase = "";

    @Override
    public void step(int step, int stepMax) {
        System.out.println(phase + " " + (int)(((double)step / (double)stepMax) * 100.0) + "%");
    }

    @Override
    public void phase(String phase, int i, int max) {
        this.phase = phase;
        System.out.println(phase);
    }
}
