package ca.sharcnet.nerve.docnav.tests;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.query.Query;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Scanner;

public class Main implements HasStreams {

    public static void main(String... args) throws IOException {
        Main main = new Main();
        main.run();
    }

    private Document doc;
    private final HashMap<String, Object> memory = new HashMap<>();

    public void run() throws IOException {
        Document doc = DocumentLoader.documentFromStream(this.getResourceStream("document.xml"));
        System.out.println(doc.toString());
    }

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }
}
