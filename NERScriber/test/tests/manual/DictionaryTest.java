/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package tests.manual;

import ca.frar.utility.SQL.SQL;
import ca.frar.utility.SQL.SQLEntry;
import ca.frar.utility.SQL.SQLRecord;
import ca.frar.utility.SQL.SQLResult;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.ProgressStage;
import ca.sharcnet.dh.scriber.ScriberResource;
import ca.sharcnet.dh.scriber.encoder.StringMatch;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author edward
 */
public class DictionaryTest {
    private final SQL sql;

    public static void main(String ... args){
        try {
            DictionaryTest dictionaryTest = new DictionaryTest();
            dictionaryTest.getDictionaries();
        } catch (IOException | ClassNotFoundException | IllegalAccessException | SQLException | InstantiationException ex) {
            Logger.getLogger(DictionaryTest.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    public DictionaryTest() throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException{
        Properties config = new Properties();
        InputStream cfgStream = ScriberResource.getInstance().getResourceStream("config.txt");
        config.load(cfgStream);
        sql = new SQL(config);        
    }
    
    public void getDictionaries() throws SQLException{
        SQLResult sqlResult = sql.query("select * from dictionaries");

        for (int i = 0; i < sqlResult.size(); i++) {
            SQLRecord row = sqlResult.get(i);
            for (SQLEntry entry : row){
                Console.log(entry.getName() + ", " + entry.getValue());
            }
        }
    }
}
