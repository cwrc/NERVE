package tests.manual;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.encoder.EncodeProcess;
import ca.sharcnet.dh.scriber.encoder.EncodedDocument;
import ca.sharcnet.docnav.StartNodeException;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

public class Plain02{
    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, InstantiationException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, IllegalArgumentException, ScriptException, NoSuchMethodException {
        try{            
            Main main = new Main();            
            InputStream resourceStream = main.getFileStream("plain-03.xml");
            Document fromStream = DocumentLoader.documentFromStream(resourceStream);
            String toString = fromStream.toString();
            Document fromString = DocumentLoader.documentFromString(toString);
            
            System.out.println("----- from stream -----");
            System.out.println(toString);
            System.out.println("----- from string -----");
            System.out.println(fromString);

            main.doc = fromStream;
            Document encoded = main.encode();
            System.out.println("----- encoded -----");
            System.out.println(encoded);
            
//            System.out.println(main.doc);
//            System.out.println();
//            EncodedDocument encode = main.encode();
//            System.out.println(encode);
//            System.out.println();
//            Document decode = main.decodeFromText();
//            System.out.println(decode);
//            System.out.println();
        } catch (StartNodeException ex){
            ex.printStackTrace();
            System.err.println("----- Document Start -----");
            System.err.print(ex.getDocument());
            System.err.println("------ Document End ------");
        }
    }
}