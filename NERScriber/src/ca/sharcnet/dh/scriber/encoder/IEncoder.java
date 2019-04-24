/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.dh.scriber.encoder;

import ca.sharcnet.dh.scriber.context.Context;
import ca.sharcnet.dh.scriber.dictionary.IDictionary;
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
    void run() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException;
    void context(Context context);
    void schema(Schema schema);
    void dictionary(IDictionary dictionary);
    void document(Document document);
}
