package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.ServerSide;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.HasStreams;
import ca.sharcnet.dh.scriber.ProgressListener;
import ca.sharcnet.dh.scriber.context.Context;
import ca.sharcnet.dh.scriber.context.ContextLoader;
import ca.sharcnet.dh.scriber.decode.Decoder;
import ca.sharcnet.dh.scriber.encoder.EncodeOptions;
import ca.sharcnet.dh.scriber.encoder.EncodeProcess;
import ca.sharcnet.dh.scriber.encoder.EncodedDocument;
import ca.sharcnet.dh.scriber.encoder.Encoder;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.ArrayList;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

@JJJ()
public class Scriber extends JJJObject implements HasStreams {

    private ProgressListener progressListener;
    private ArrayList<EncodeListener> encodeListeners = new ArrayList<>();

    public void setProgressListener(ProgressListener progressListener) {
        this.progressListener = progressListener;
    }

    public void addEncodeListener(EncodeListener encodeListener){
        this.encodeListeners.add(encodeListener);
    }
    
    private EncodeResponse doEncode(String source, EncodeOptions options) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        Document document = DocumentLoader.documentFromString(source);
        EncodedDocument encoded = Encoder.encode(document, this, options, progressListener);
        EncodeResponse encodeResponse = new EncodeResponse(encoded.toString(), encoded.getContext(), encoded.getSchema());
        for (EncodeListener encodeListener : this.encodeListeners) encodeListener.onEncode(encodeResponse);
        return encodeResponse;
    }

    @ServerSide
    public EncodeResponse link(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        EncodeOptions options = new EncodeOptions();
        options.addProcess(EncodeProcess.DICTIONARY);
        return doEncode(source, options);
    }
    
    @ServerSide
    public EncodeResponse encode(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        EncodeOptions options = new EncodeOptions();
        options.addProcess(EncodeProcess.DICTIONARY, EncodeProcess.NER);
        return doEncode(source, options);
    }

    @ServerSide
    public EncodeResponse tag(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        EncodeOptions options = new EncodeOptions();
        options.addProcess(EncodeProcess.NER);
        return doEncode(source, options);
    }

    @ServerSide
    public EncodeResponse edit(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        EncodeOptions options = new EncodeOptions();
        return doEncode(source, options);
    }

    @ServerSide
    public String decode(String source) throws IOException, IllegalArgumentException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ScriptException, NoSuchMethodException {
        Document document = DocumentLoader.documentFromString(source);

        Console.log(document);
        Console.log(this);
        Console.log(progressListener);

        Document decoded = Decoder.decode(document, this, progressListener);
        decoded.query("doc").extract();
        return decoded.toString();
    }

    @Override
    public InputStream getResourceStream(String path) {
        return Encoder.class.getResourceAsStream("/res/" + path);
    }

    @ServerSide
    public Context getContext(String contextFileName) throws IllegalArgumentException, IOException {
        Console.log(contextFileName);
        return ContextLoader.load(this.getResourceStream("/contexts/" + contextFileName));
    }
}
