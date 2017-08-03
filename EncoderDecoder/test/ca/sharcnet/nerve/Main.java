package ca.sharcnet.nerve;
import ca.sharcnet.utility.Console;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.decode.Decoder;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.encoder.ClassifierException;
import ca.sharcnet.nerve.encoder.Encoder;
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.parsers.ParserConfigurationException;

public class Main  implements HasStreams, IsMonitor{

    @Override
    public InputStream getResourceStream(String path) {
        InputStream resourceAsStream = this.getClass().getResourceAsStream("/resources/" + path);
        if (resourceAsStream == null) throw new NullPointerException(path + " not found");
        return resourceAsStream;
    }

    public static void main(String[] args){
        try {
            new Main().run();
        } catch (Exception ex) {
            Logger.getLogger(Main.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public void run() throws IllegalArgumentException, IOException, ClassifierException, FileNotFoundException, ClassCastException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        InputStream resourceStream = this.getResourceStream("/doc/minimalOrlando.xml");
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(resourceStream));

        StringBuilder builder = new StringBuilder();
        String readLine = bufferedReader.readLine();
        while(readLine != null){
            builder.append(readLine).append("\n");
            readLine = bufferedReader.readLine();
        }

        Document d1 = DocumentLoader.documentFromString(builder.toString());
//        Document d2 = DocumentLoader.documentFromStream(this.getResourceStream("/doc/minimalOrlando.xml"));
    }

    @Override
    public void phase(String phase, int i, int phaseMax) {
        Console.log("phase " + phase + " " + i + "/" + phaseMax);
    }

    @Override
    public void step(int step, int stepMax) {
        Console.log("step " + step + "/" + stepMax);
    }
}
