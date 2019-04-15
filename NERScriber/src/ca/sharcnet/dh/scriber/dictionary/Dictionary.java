package ca.sharcnet.dh.scriber.dictionary;
import ca.frar.utility.console.Console;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.ServerSide;
import ca.frar.jjjrmi.annotations.Transient;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.sharcnet.dh.sql.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

@JJJ
public class Dictionary extends JJJObject {
    @Transient
    private String DEFAULT_DICTIONARY = "entities";
    @Transient
    private SQL sql;
    @Transient
    private String SQL_CONFIG = "WEB-INF/config.properties";

    public Dictionary(SQL sql) throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException {
        if (sql == null) throw new NullPointerException();
        this.sql = sql;
    }

    public void verifySQL() throws ClassNotFoundException, IllegalAccessException, IllegalAccessException, IOException, InstantiationException {
        try {
            SQLResult result = sql.tables();
            
            for (SQLRecord r : result) {
                Console.log(" - " + r.getEntry("TABLE_NAME").getValue());
            }
            Console.log(result.size() + " table" + (result.size() == 1 ? "" : "s") + " in database");
            if (result.size() == 0) this.addTable(DEFAULT_DICTIONARY);
        } catch (SQLException ex) {
            Logger.getLogger(Dictionary.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    @ServerSide
    public boolean addTable(String table) throws ClassNotFoundException, IllegalAccessException, IllegalAccessException, IOException, InstantiationException, SQLException {

        sql.update(String.format("CREATE TABLE %s ("
                + "entity varchar(255) NOT NULL,"
                + "lemma varchar(128) NOT NULL,"
                + "link varchar(255) NOT NULL,"
                + "tag varchar(16) NOT NULL,"
                + "source varchar(16) NOT NULL,"
                + "constraint pk primary key(lemma, tag, source) on conflict replace"
                + ");",
                table));
        
        return true;
    }

    @ServerSide
    public void addEntities(EntityValues[] values) throws SQLException{
        StringBuilder builder = new StringBuilder();

        builder.append(String.format("insert into %s values", DEFAULT_DICTIONARY));        
        for (int i = 0; i < values.length; i++){
            EntityValues value = values[i];
            builder.append(String.format("(%s, %s, %s, %s, %s)",
                SQL.sanitize(value.text()),
                SQL.sanitize(value.lemma()),
                SQL.sanitize(value.link()),
                SQL.sanitize(value.tag()),
                SQL.sanitize(value.source())
            ));
            if (i < values.length - 1) builder.append(",");
        }
        String update = builder.toString();
        Console.log(update);
        sql.update(update);
    }
    
    @ServerSide
    public int addEntity(EntityValues value) throws SQLException {
        String format = String.format("insert into %s values (%s, %s, %s, %s, %s) ",
                SQL.sanitize(DEFAULT_DICTIONARY),
                SQL.sanitize(value.text()),
                SQL.sanitize(value.lemma()),
                SQL.sanitize(value.link()),
                SQL.sanitize(value.tag()),
                SQL.sanitize(value.source())
        );
        return sql.update(format);
    }

    @ServerSide
    public int deleteEntity(EntityValues value) throws SQLException {
        String format = String.format("delete from %s where entity='%s'", DEFAULT_DICTIONARY, value.text());
        return sql.update(format);
    }
    
    @ServerSide
    public SQLResult getEntities(String ... textArray) throws SQLException {
        StringBuilder builder = new StringBuilder();
        
        builder.append("select * from ");
        builder.append(DEFAULT_DICTIONARY);
        builder.append(" where entity = ");
        
        for (int i = 0; i < textArray.length; i++){
            String text = textArray[i];
            builder.append("'").append(text).append("'");     
            if (i != textArray.length - 1) builder.append(" OR entity = ");
        }
        
        String query = builder.toString();
        Console.log(query);
        return sql.query(query);
    }

    @ServerSide
    public SQLResult lookup(String text, String lemma, String tag, String source) throws SQLException {
        StringBuilder builder = new StringBuilder();

        builder.append("select * from ");
        builder.append(DEFAULT_DICTIONARY);
        builder.append(" where entity = '").append(SQL.sanitize(text)).append("'");
        
        if (lemma != null) {
            builder.append(" and lemma = '").append(SQL.sanitize(lemma)).append("'");
        }
        
        if (tag != null) {
            builder.append(" and tag = '").append(SQL.sanitize(tag)).append("'");
        }
        
        if (source != null) {
            builder.append(" and source = '").append(SQL.sanitize(source)).append("'");
        }

        String query = builder.toString();

        try {
            SQLResult sqlResult = sql.query(query);
            return sqlResult;
        } catch (SQLException ex) {
            Console.log("SQL Query: " + query);
            throw ex;
        }
    }
}
