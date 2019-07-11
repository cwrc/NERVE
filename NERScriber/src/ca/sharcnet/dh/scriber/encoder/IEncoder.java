/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.dh.scriber.encoder;

import ca.sharcnet.dh.scriber.context.Context;
import ca.sharcnet.dh.scriber.dictionary.Dictionary;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.schema.Schema;
import java.io.IOException;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;

/**
 *
 * @author edward
 */
public interface IEncoder {
    void run() throws IOException, DocumentParseException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException;
    void context(Context context);
    void setSchema(Schema schema);
    void setDictionaries(Iterable<Dictionary> dictionaries);
    void document(Document document);
}
