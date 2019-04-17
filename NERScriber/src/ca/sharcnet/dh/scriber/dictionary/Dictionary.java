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
import org.apache.logging.log4j.LogManager;

@JJJ
public class Dictionary extends JJJObject implements IDictionary {
    @Transient
    final static org.apache.logging.log4j.Logger LOGGER = LogManager.getLogger(Dictionary.class);    
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
    @Override
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
    @Override
    public int deleteEntity(EntityValues value) throws SQLException {
        String format = String.format("delete from %s where entity='%s'", DEFAULT_DICTIONARY, value.text());
        return sql.update(format);
    }
    
    @ServerSide
    @Override
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
        return sql.query(query);
    }

    /**
     * Look for matching entities in the db.  Null values are ignored.
     * @param text
     * @param lemma
     * @param tag
     * @param source
     * @return
     * @throws SQLException 
     */
    @ServerSide
    @Override    
    public SQLResult lookup(String text, String lemma, String tag, String source) throws SQLException {
        StringBuilder builder = new StringBuilder();

        builder.append("select * from ");
        builder.append(DEFAULT_DICTIONARY);
        builder.append(" where entity = ").append(SQL.sanitize(text));
        
        if (lemma != null) {
            builder.append(" and lemma = ").append(SQL.sanitize(lemma));
        }
        
        if (tag != null) {
            builder.append(" and tag = ").append(SQL.sanitize(tag));
        }
        
        if (source != null) {
            builder.append(" and source = ").append(SQL.sanitize(source));
        }

        String query = builder.toString();

        try {
            SQLResult sqlResult = sql.query(query);
            return sqlResult;
        } catch (SQLException ex) {
            LOGGER.error("SQLException on query: " + query);
            throw ex;
        }
    }
}
