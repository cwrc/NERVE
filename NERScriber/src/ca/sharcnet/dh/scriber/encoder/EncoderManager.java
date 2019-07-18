package ca.sharcnet.dh.scriber.encoder;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import javax.xml.parsers.ParserConfigurationException;

public class EncoderManager extends ServiceModuleBase {    
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
            encoder.document(this.getDocument());
            encoder.setContext(this.getContext());
            encoder.setSchema(this.getSchema(), this.getSchemaUrl());
            encoder.setDictionaries(this.getDictionaries());             
            encoder.run();
        }
    }
}
