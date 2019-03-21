/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package tests.manual;

import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.HasStreams;
import ca.sharcnet.dh.scriber.encoder.Encoder;
import ca.sharcnet.dh.sql.SQL;
import ca.sharcnet.dh.sql.SQLEntry;
import ca.sharcnet.dh.sql.SQLRecord;
import ca.sharcnet.dh.sql.SQLResult;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletContext;

/**
 *
 * @author Ed Armstrong
 */
public class TestSQL implements HasStreams {

    public static void main(String... args) {
        try {
            InputStream configStream = new TestSQL().getResourceStream("config.txt");
            Properties config = new Properties();
            config.load(configStream);
            SQL sql = new SQL(config);
            SQLResult result = sql.tables();
            
            Console.log(result.size() + " entries");
            for (SQLRecord r : result) {
                for (SQLEntry c : r) {
                    Console.log(c.getName() + ", " + c.getValue());
                }
            }
        } catch (Exception ex) {
            Logger.getLogger(TestSQL.class.getName()).log(Level.SEVERE, null, ex);
        }
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
}
