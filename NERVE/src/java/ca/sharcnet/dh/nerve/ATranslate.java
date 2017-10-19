package ca.sharcnet.dh.nerve;
import ca.fa.jjjrmi.annotations.ClientSide;
import ca.fa.jjjrmi.annotations.NativeJS;
import ca.fa.jjjrmi.annotations.RMI;
import ca.fa.jjjrmi.annotations.ServerSide;
import ca.fa.jjjrmi.annotations.SkipJS;
import ca.fa.jjjrmi.socket.RMISocket;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.IsMonitor;
import ca.sharcnet.nerve.decode.Decoder;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.encoder.Encoder;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;

@NativeJS
@RMI("Translate")
abstract public class ATranslate extends RMISocket implements HasStreams, IsMonitor{

    @SkipJS
    public ATranslate(){
        super();
    }

    private void setView(Object view){
        /*JS{
            this.view = view;
            this.phaseName = "";
        }*/
    }

    @ServerSide
    public String encode(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        Document document = DocumentLoader.documentFromString(source);
        Document encoded = Encoder.encode(document, this, this);
        return encoded.toString();
    }

    @ServerSide
    public String decode(String source) throws IOException, IllegalArgumentException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        Document document = DocumentLoader.documentFromString(source);
        Document decoded = Decoder.decode(document, this);
        decoded.query("doc").extract();
        return decoded.toString();
    }

    @SkipJS
    @Override
    public InputStream getResourceStream(String path) {
        return Encoder.class.getResourceAsStream("/res/" + path);
    }

    @SkipJS
    public void phase(String phase, int i, int phaseMax) {
        this.onPhase(phase, i, phaseMax);
    }

    @SkipJS
    public void step(int i, int stepMax) {
        this.onStep(i, stepMax);
    }

    @ClientSide
    public void onPhase(String phase, int i, int max) {
        /*JS{
            this.view.setThrobberMessage(phase);
            this.phaseName = phase;
            this.view.showBaubles(i, max);
        }*/
    }

    @ClientSide
    public void onStep(int i, int max) {
        /*JS{
            this.view.showPercent(Math.trunc(i / max * 100));
        }*/
    }
}