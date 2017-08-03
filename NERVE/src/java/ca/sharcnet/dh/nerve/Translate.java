package ca.sharcnet.dh.nerve;
import ca.fa.jjj.web.rmi.RMISocket;
import ca.fa.jjj.web.rmi.annotations.Remote;
import ca.fa.utility.Console;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.IsMonitor;
import ca.sharcnet.nerve.decode.Decoder;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.encoder.ClassifierException;
import ca.sharcnet.nerve.encoder.Encoder;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;

public class Translate extends RMISocket implements HasStreams, IsMonitor{

    public Translate(){
        super();
        Console.log(ca.sharcnet.encoderdecoder.Info.version);
    }

    @Remote
    public String encode(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ClassifierException, ParserConfigurationException{
        Document document = DocumentLoader.documentFromString(source);
        Document encoded = Encoder.encode(document, this, this);
        return encoded.toString();
    }

    @Remote
    public String decode(String source) throws IOException, IllegalArgumentException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        Document document = DocumentLoader.documentFromString(source);
        Document decoded = Decoder.decode(document, this);
        decoded.query("doc").extract();
        return decoded.toString();
    }

    @Override
    public InputStream getResourceStream(String path) {
        return Encoder.class.getResourceAsStream("/res/" + path);
    }

    @Override
    public void phase(String phase, int i, int phaseMax) {
        super.invokeRemoteMethod("phase", phase, i, phaseMax);
    }

    @Override
    public void step(int i, int stepMax) {
        super.invokeRemoteMethod("step", i, stepMax);
    }
}