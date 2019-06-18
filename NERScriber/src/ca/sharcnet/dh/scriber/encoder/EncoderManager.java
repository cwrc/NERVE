package ca.sharcnet.dh.scriber.encoder;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import javax.xml.parsers.ParserConfigurationException;

public class EncoderManager extends EncoderBase {    
    ArrayList<IEncoder> encoders = new ArrayList<>();
    
    public IEncoder addProcess(IEncoder encoder){   
        this.encoders.add(encoder);
        return encoder;
    }    

    public void clearProcesses(){
        this.encoders.clear();
    }
    
    @Override
    public void run() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, DocumentParseException {
        for (IEncoder encoder : encoders){
            encoder.document(this.document);
            encoder.context(this.context);
            encoder.setSchema(this.schema);
            encoder.dictionary(this.dictionary);             
            encoder.run();
        }
    }
}
