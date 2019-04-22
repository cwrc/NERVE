package ca.sharcnet.dh.scriber.encoder;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import javax.xml.parsers.ParserConfigurationException;

public class EncoderManager extends EncoderBase {    
    ArrayList<IEncoder> encoders = new ArrayList<>();
    
    public IEncoder addProcess(IEncoder encoder){
        encoder.document(this.document);
        encoder.context(this.context);
        encoder.schema(this.schema);
        encoder.dictionary(this.dictionary);
        encoder.classifier(this.classifier);
        this.encoders.add(encoder);
        return encoder;
    }    

    public void clearProcesses(){
        this.encoders.clear();
    }
    
    @Override
    public void run() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        for (IEncoder encoder : encoders) encoder.run();
    }
}
