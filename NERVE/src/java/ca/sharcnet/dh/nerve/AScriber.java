package ca.sharcnet.dh.nerve;
import ca.fa.jjjrmi.annotations.ClientSide;
import ca.fa.jjjrmi.annotations.NativeJS;
import ca.fa.jjjrmi.annotations.RMI;
import ca.fa.jjjrmi.annotations.ServerSide;
import ca.fa.jjjrmi.annotations.SkipJS;
import ca.fa.jjjrmi.socket.AsyncInvocation;
import ca.fa.jjjrmi.socket.RMISocket;
import ca.fa.utility.Console;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.IsMonitor;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.decode.Decoder;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.encoder.EncodedDocument;
import ca.sharcnet.nerve.encoder.Encoder;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

@NativeJS("Scriber")
@RMI("Scriber")
abstract public class AScriber extends RMISocket implements HasStreams, IsMonitor{

    @SkipJS
    public AScriber(){
        super();
    }

    @NativeJS
    private void setView(Object view){
        /*JS{
            this.view = view;
            this.phaseName = "";
        }*/
    }

    @ServerSide
    public EncodeResponse encode(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        Document document = DocumentLoader.documentFromString(source);
        EncodedDocument encoded = Encoder.encode(document, this, this);
        return new EncodeResponse(encoded.toString(), encoded.getContext(), encoded.getSchema());
    }

    @ServerSide
    public String decode(String source) throws IOException, IllegalArgumentException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ScriptException, NoSuchMethodException{
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
    public AsyncInvocation<Void> onPhase(String phase, int i, int max) {
        /*JS{
            this.view.setThrobberMessage(phase);
            this.phaseName = phase;
            this.view.showBaubles(i, max);
        }*/
        return null;
    }

    @ClientSide
    public AsyncInvocation<Void> onStep(int i, int max) {
        /*JS{
            this.view.showPercent(Math.trunc(i / max * 100));
        }*/
        return null;
    }

    @ServerSide
    public Context getContext(String contextFileName) throws IllegalArgumentException, IOException{
        Console.log(contextFileName);
        return ContextLoader.load(this.getResourceStream("/contexts/" + contextFileName));
    }
}