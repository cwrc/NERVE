package tests.manual;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.encoder.EncodeProcess;
import ca.sharcnet.docnav.StartNodeException;
import java.io.IOException;
import java.sql.SQLException;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

public class Orlando {
    public static void main(String... args) throws IOException, ClassNotFoundException, InstantiationException, InstantiationException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, IllegalArgumentException, ScriptException, NoSuchMethodException {
        try{
            Main main = new Main("minimalOrlando.xml");            
            Console.log(main.encode(EncodeProcess.NER, EncodeProcess.DICTIONARY));
            Console.log(main.decode());
        } catch (StartNodeException ex){
            ex.printStackTrace();
            System.err.println("----- Document Start -----");
            System.err.print(ex.getDocument());
            System.err.println("------ Document End ------");
        }
    }
}