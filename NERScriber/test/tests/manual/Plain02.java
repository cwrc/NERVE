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
            Main main = new Main("plain-03.xml");            
              
            System.out.println("----- encoded -----");
            Document encoded = main.encode();
            System.out.println(encoded);
            
            System.out.println("----- text -----");
            System.out.println(main.encoded.toString());
            System.out.println("----- decoded from text -----");            
            Document decoded = main.decodeFromText();
            System.out.println(decoded);            

        } catch (StartNodeException ex){
            ex.printStackTrace();
            System.err.println("----- Document Start -----");
            System.err.print(ex.getDocument());
            System.err.println("------ Document End ------");
        }
    }
}