package tests.manual;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.HasStreams;
import ca.sharcnet.dh.progress.ProgressListener;
import ca.sharcnet.dh.scriber.ProgressPacket;
import ca.sharcnet.dh.scriber.decode.Decoder;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.dh.scriber.encoder.EncodeOptions;
import ca.sharcnet.dh.scriber.encoder.EncodeProcess;
import ca.sharcnet.dh.scriber.encoder.EncodedDocument;
import ca.sharcnet.dh.scriber.encoder.Encoder;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.script.ScriptException;
import javax.xml.parsers.ParserConfigurationException;

public class Main implements HasStreams, ProgressListener {
    final EncodeOptions encodeOptions;
    Document doc;
    EncodedDocument encoded;
    Document decoded;
    
    public Main(){
        this.encodeOptions = new EncodeOptions();
    }
    
    public Main(String filename) throws IOException{
        this.doc = DocumentLoader.documentFromStream(this.getFileStream(filename));
        this.encodeOptions = new EncodeOptions();                
    }

    public Main(Document doc) throws IOException{
        this.doc = doc;
        this.encodeOptions = new EncodeOptions();                
    }
    
    public EncodedDocument encode(EncodeProcess ... encodeProcesses) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        encodeOptions.addProcess(encodeProcesses);
        this.encoded = Encoder.encode(this.doc, this, this.encodeOptions, this);
        return this.encoded;
    }

    public Document decode() throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ScriptException, NoSuchMethodException{
        this.decoded = Decoder.decode(this.encoded, this.encoded.getContext().getName(), this, this);
        return decoded;
    }

    public Document decodeFromText() throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ScriptException, NoSuchMethodException{
        Document doc = DocumentLoader.documentFromString(this.encoded.toString());
        Console.log(doc);
        this.decoded = Decoder.decode(doc, this.encoded.getContext().getName(), this, this);
        return decoded;
    }

    
    @Override
    public final InputStream getResourceStream(String path) {
        try {
            File file = new File("./src/res/" + path);
            return new FileInputStream(file);
        } catch (IOException ex) {
            Logger.getLogger(Main.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }

    public final InputStream getFileStream(String path) {
        try {
            File file = new File("./test/tests/documents/" + path);
            return new FileInputStream(file);
        } catch (IOException ex) {
            Logger.getLogger(Main.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }    
    
    @Override
    public void start(String message) {
        Console.log("START: " + message);
    }

    @Override
    public void updateMessage(String message) {
        Console.log("MESSAGE: " + message);
    }

    @Override
    public void updateProgress(int percent) {
        Console.log("PROGRESS: " + percent);
    }

    @Override
    public void end() {
        Console.log("END:");
    }
}