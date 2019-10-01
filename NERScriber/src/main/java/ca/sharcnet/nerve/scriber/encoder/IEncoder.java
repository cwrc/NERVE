/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.encoder;

import ca.sharcnet.nerve.scriber.query.Query;
import ca.sharcnet.nerve.scriber.context.Context;
import ca.sharcnet.nerve.scriber.dictionary.Dictionary;
import ca.sharcnet.nerve.scriber.schema.Schema;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import javax.xml.parsers.ParserConfigurationException;

/**
 *
 * @author edward
 */
public interface IEncoder {
    void run() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException;
    void setContext(Context context);
    void setSchema(Schema schema, String schemaURL);
    void setDictionaries(List<Dictionary> dictionaries);
    void setQuery(Query query);
}
