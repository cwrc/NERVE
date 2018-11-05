package ca.sharcnet.dh.progress;

public interface ProgressListener {
    public void start(String message);
    public void updateMessage(String message);
    public void updateProgress(int percent);
    public void end();
}
