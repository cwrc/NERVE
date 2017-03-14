package ca.sharcnet.nerve.encoder;
import edu.stanford.nlp.ie.AbstractSequenceClassifier;
import edu.stanford.nlp.ie.crf.CRFClassifier;
import edu.stanford.nlp.ling.CoreLabel;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.util.zip.GZIPInputStream;

public class Classifier {

    private AbstractSequenceClassifier<CoreLabel> classifier;

    PrintStream err = System.err;
    PrintStream empty = new PrintStream(new OutputStream() {
        public void write(int b) {
            //DO NOTHING
        }
    });

    public Classifier(String configPath) throws ClassifierException, FileNotFoundException, IOException, ClassCastException, ClassNotFoundException {
        System.setErr(empty);

        File file = new File(configPath);
        InputStream inputStream = new FileInputStream(file);
        BufferedInputStream bis = new BufferedInputStream(new GZIPInputStream(inputStream));

        classifier = CRFClassifier.getClassifier(bis);
        if (classifier == null) throw new ClassifierException("Classifier not found at " + configPath);
        System.setErr(err);
    }

    public Classifier(InputStream stream) throws ClassifierException, FileNotFoundException, IOException, ClassCastException, ClassNotFoundException {
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
