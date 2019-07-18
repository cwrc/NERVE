package ca.sharcnet.dh.scriber.encoder;

import java.io.IOException;

public interface IClassifier {
    public String classify(String input) throws IOException;
}
