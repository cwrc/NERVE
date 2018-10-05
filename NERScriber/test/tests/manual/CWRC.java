package tests.manual;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.encoder.EncodeProcess;
import ca.sharcnet.dh.scriber.encoder.EncodedDocument;
import ca.sharcnet.docnav.StartNodeException;
import ca.sharcnet.nerve.docnav.dom.Document;
import java.io.IOException;
import java.sql.SQLException;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

public class CWRC {
    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, InstantiationException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, IllegalArgumentException, ScriptException, NoSuchMethodException {
        try{
            Main main = new Main("cwrc.xml");            
            EncodedDocument encode = main.encode();
            Console.log(encode);
            Document decode = main.decode();
        } catch (StartNodeException ex){
            ex.printStackTrace();
            System.err.println("----- Document Start -----");
            System.err.print(ex.getDocument());
            System.err.println("------ Document End ------");
        }
    }
}