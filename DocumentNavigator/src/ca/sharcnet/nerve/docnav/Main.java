package ca.sharcnet.nerve.docnav;
import ca.sharcnet.nerve.docnav.dom.Document;
import java.io.IOException;
import java.io.InputStream;

public class Main {
    public static void main(String ... args) throws IOException{
        InputStream resourceAsStream = Main.class.getResourceAsStream("/testFiles/text14.txt");
        Document doc = DocumentNavigator.documentFromStream(resourceAsStream);
        System.out.println(doc);
    }
}
