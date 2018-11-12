package tests.manual;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.encoder.EncodeProcess;
import ca.sharcnet.dh.scriber.encoder.EncodedDocument;
import ca.sharcnet.docnav.StartNodeException;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import java.io.IOException;
import java.sql.SQLException;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

public class Orlando {
    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, InstantiationException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, IllegalArgumentException, ScriptException, NoSuchMethodException {
        try{
            Main main = new Main("minimalOrlando.xml");            
            System.out.println(main.doc);
            System.out.println();
            EncodedDocument encode = main.encode();
            System.out.println("----- encode.toString -----");
            System.out.println(encode.toString());
            System.out.println("----- encode.documentFromString -----");
            System.out.println(DocumentLoader.documentFromString(encode.toString()).toString());            
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