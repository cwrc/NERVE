package ca.sharcnet.dh.nerve;
import ca.fa.jjjrmi.annotations.ClientSide;
import ca.fa.jjjrmi.annotations.NativeJS;
import ca.fa.jjjrmi.annotations.RMI;
import ca.fa.jjjrmi.annotations.ServerSide;
import ca.fa.jjjrmi.annotations.SkipJS;
import ca.fa.jjjrmi.socket.RMISocket;
import ca.fa.utility.Console;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.ProgressListener;
import ca.sharcnet.nerve.ProgressPacket;
import ca.sharcnet.nerve.context.Context;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.decode.Decoder;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.encoder.EncodeOptions;
import ca.sharcnet.nerve.encoder.EncodeProcess;
import ca.sharcnet.nerve.encoder.EncodedDocument;
import ca.sharcnet.nerve.encoder.Encoder;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.ArrayList;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

@NativeJS("Scriber")
@RMI("Scriber")
abstract public class AScriber extends RMISocket implements HasStreams, ProgressListener{
    private final ArrayList<ProgressListener> listeners = new ArrayList<>();

    public AScriber(){
        super();
    }

    public void addListener(ProgressListener listener){
        this.listeners.add(listener);
    }

    @Override
    @ClientSide(true)
    public void notifyProgress(ProgressPacket packet){
        for (ProgressListener listener : listeners) listener.notifyProgress(packet);
    }

    @ServerSide
    public EncodeResponse encode(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        this.notifyProgress(new ProgressPacket("Loading Document ", 0,  5));
        EncodeOptions options = new EncodeOptions();
        options.addProcess(EncodeProcess.NER);
        options.addProcess(EncodeProcess.DICTIONARY);

        Document document = DocumentLoader.documentFromString(source);
        EncodedDocument encoded = Encoder.encode(document, this, options, this);
        return new EncodeResponse(encoded.toString(), encoded.getContext(), encoded.getSchema());
    }

    @ServerSide
    public EncodeResponse tag(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        this.notifyProgress(new ProgressPacket("Loading Document ", 0,  5));
        EncodeOptions options = new EncodeOptions();
        options.addProcess(EncodeProcess.NER);

        Document document = DocumentLoader.documentFromString(source);
        EncodedDocument encoded = Encoder.encode(document, this, options, this);
        return new EncodeResponse(encoded.toString(), encoded.getContext(), encoded.getSchema());
    }

    @ServerSide
    public EncodeResponse edit(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        this.notifyProgress(new ProgressPacket("Loading Document ", 0,  5));
        EncodeOptions options = new EncodeOptions();
        Document document = DocumentLoader.documentFromString(source);
        EncodedDocument encoded = Encoder.encode(document, this, options, this);
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

    @ServerSide
    public Context getContext(String contextFileName) throws IllegalArgumentException, IOException{
        Console.log(contextFileName);
        return ContextLoader.load(this.getResourceStream("/contexts/" + contextFileName));
    }
}