package ca.sharcnet.nerve.scriber.encoder;
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
    
    @Override
    public void run() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        for (IEncoder encoder : encoders){
            encoder.setQuery(this.getQuery());
            encoder.setContext(this.getContext());
            encoder.setSchema(this.getSchema(), this.getSchemaUrl());
            encoder.setDictionaries(this.getDictionaries());             
            encoder.run();
        }
    }
}
