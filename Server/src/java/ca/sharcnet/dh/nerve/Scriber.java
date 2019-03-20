package ca.sharcnet.dh.nerve;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.JSPrequel;
import ca.frar.jjjrmi.annotations.ServerSide;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.progress.ProgressListener;
import ca.sharcnet.dh.scriber.HasStreams;
import ca.sharcnet.dh.scriber.ScriberResource;
import ca.sharcnet.dh.scriber.context.Context;
import ca.sharcnet.dh.scriber.context.ContextLoader;
import ca.sharcnet.dh.scriber.decode.Decoder;
import ca.sharcnet.dh.scriber.encoder.EncodeOptions;
import ca.sharcnet.dh.scriber.encoder.EncodeProcess;
import ca.sharcnet.dh.scriber.encoder.EncodedDocument;
import ca.sharcnet.dh.scriber.encoder.Encoder;
import ca.sharcnet.nerve.docnav.query.Query;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.ArrayList;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

@JJJ()
@JSPrequel("const ArrayList = require ('jjjrmi').ArrayList;")
public class Scriber extends JJJObject implements HasStreams {
    private ProgressListener progressListener;

    public void setProgressListener(ProgressListener progressListener) {
        this.progressListener = progressListener;
    }
    
    private EncodeResponse doEncode(String source, EncodeOptions options) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        Document document = DocumentLoader.documentFromString(source);
        EncodedDocument encoded = Encoder.encode(document, ScriberResource.getInstance(), options, progressListener);
        EncodeResponse encodeResponse = new EncodeResponse(encoded.toString(), encoded.getContext().getSourceString(), encoded.getSchema());
        return encodeResponse;
    }

    @ServerSide
    public EncodeResponse link(String source) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        Console.log("link / dictionary");
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
    public String decode(String source, String contextName) throws IOException, IllegalArgumentException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ScriptException, NoSuchMethodException {
        Document document = DocumentLoader.documentFromString(source);
        Document decoded = Decoder.decode(document, contextName, ScriberResource.getInstance(), progressListener);
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
