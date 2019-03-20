package ca.sharcnet.dh.scriber.encoder;
import edu.stanford.nlp.ie.AbstractSequenceClassifier;
import edu.stanford.nlp.ie.crf.CRFClassifier;
import edu.stanford.nlp.ling.CoreLabel;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;

public class Classifier {
    private final AbstractSequenceClassifier<CoreLabel> classifier;
    private final PrintStream err = System.err;
    private final PrintStream empty = new PrintStream(new OutputStream() {
        @Override public void write(int b) {/*DO NOTHING*/}
    });

    public Classifier(InputStream stream) throws FileNotFoundException, IOException, ClassCastException, ClassNotFoundException {
        System.setErr(empty);
        classifier = CRFClassifier.getClassifier(stream);
        System.setErr(err);
    }

    public String classify(String string) {
        System.setErr(empty);
        String classified = classifier.classifyWithInlineXML(string);
        System.setErr(err);
        return classified;
    }
}
