package ca.sharcnet.dh.nerve;
import ca.frar.utility.console.Console;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.ServerSide;
import ca.frar.jjjrmi.annotations.Transient;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.sharcnet.dh.sql.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

@JJJ
public class Dictionary extends JJJObject {
    @Transient
    private String DEFAULT_DICTIONARY = "custom";
    @Transient
    private SQL sql;
    @Transient
    private String SQL_CONFIG = "WEB-INF/config.properties";

    public Dictionary(SQL sql) throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException {
        this.sql = sql;
    }

    public void verifySQL(Properties config) throws ClassNotFoundException, IllegalAccessException, IllegalAccessException, IOException, InstantiationException {
        try {
            SQLResult result = sql.tables();
            
            for (SQLRecord r : result) {
                Console.log(" - " + r.getEntry("TABLE_NAME").getValue());
            }
            Console.log(result.size() + " table" + (result.size() == 1 ? "" : "s") + " in database");
            if (result.size() == 0) this.addTable("custom");
        } catch (SQLException ex) {
            Logger.getLogger(NerveSocket.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    @ServerSide
    public boolean addTable(String table) throws ClassNotFoundException, IllegalAccessException, IllegalAccessException, IOException, InstantiationException, SQLException {
        String q = String.format("select * from dictionaries where name = '%s'", table);
        SQLResult result = sql.query(q);
        if (result.size() != 0) {
            return false;
        }

        sql.update(String.format("CREATE TABLE %s ("
                + "entity varchar(255) NOT NULL,"
                + "lemma varchar(128) NOT NULL,"
                + "link varchar(255) NOT NULL,"
                + "tag varchar(16) NOT NULL,"
                + "source varchar(16) NOT NULL,"
                + "constraint pk primary key(lemma, tag, source) on conflict replace"
                + ");",
                table));
        
        sql.update(String.format("insert into dictionaries values('%s')", table));
        return true;
    }

    @ServerSide
    public void addEntities(String table, EntityValues[] values) throws SQLException{
        StringBuilder builder = new StringBuilder();

        builder.append(String.format("insert into %s values", SQL.sanitize(table)));        
        for (int i = 0; i < values.length; i++){
            EntityValues value = values[i];
            builder.append(String.format("(%s, %s, %s, %s, %s)",
                SQL.sanitize(value.text()),
                SQL.sanitize(value.lemma()),
                SQL.sanitize(value.link()),
                SQL.sanitize(value.tag()),
                SQL.sanitize(table)
            ));
            if (i < values.length - 1) builder.append(",");
        }
        String update = builder.toString();
        Console.log(update);
        sql.update(update);
    }
    
    @ServerSide
    public int addEntity(String table, EntityValues value) throws SQLException {
        String format = String.format("insert into %s values (%s, %s, %s, %s, %s) ",
                SQL.sanitize(table),
                SQL.sanitize(value.text()),
                SQL.sanitize(value.lemma()),
                SQL.sanitize(value.link()),
                SQL.sanitize(value.tag()),
                SQL.sanitize(table)
        );
        return sql.update(format);
    }

    @ServerSide
    public int deleteEntity(EntityValues value) throws SQLException {
        String format = String.format("delete from %s where entity='%s'", DEFAULT_DICTIONARY, value.text());
        return sql.update(format);
    }

    private String buildDictionaryQuery(String entityText) throws SQLException {
        StringBuilder builder = new StringBuilder();

        SQLResult dictionaries = sql.query("select * from dictionaries");

        for (SQLRecord record : dictionaries) {
            String dictionary = record.getEntry("name").getValue();
            if (!dictionary.equals(dictionaries.get(0).getEntry("name").getValue())) {
                builder.append(" union ");
            }
            builder.append("select * from ");
            builder.append(dictionary);
            builder.append(" where entity = '");
            builder.append(entityText);
            builder.append("'");
        }

        String query = builder.toString();
        return query;
    }

    @ServerSide
    public SQLResult lookup(String text, String lemma, String tag, String source) throws SQLException {
        StringBuilder builder = new StringBuilder();

        SQLResult dictionaries = sql.query("select * from dictionaries");

        String fixedText = text.replaceAll("'", "\\\\'");
        String fixedLemma = lemma == null ? null : lemma.replaceAll("'", "\\\\'");
        String fixedTag = tag == null ? null : tag.replaceAll("'", "\\\\'");
        String fixedSource = source == null ? null : source.replaceAll("'", "\\\\'");

        for (SQLRecord record : dictionaries) {
            String dictionary = record.getEntry("name").getValue();
            if (!dictionary.equals(dictionaries.get(0).getEntry("name").getValue())) {
                builder.append(" union ");
            }
            builder.append("select * from ");
            builder.append(dictionary);
            builder.append(" where entity = '").append(fixedText).append("'");
            if (fixedLemma != null) {
                builder.append(" and lemma = '").append(fixedLemma).append("'");
            }
            if (fixedTag != null) {
                builder.append(" and tag = '").append(fixedTag).append("'");
            }
            if (fixedSource != null) {
                builder.append(" and source = '").append(fixedSource).append("'");
            }
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

    @ServerSide
    public SQLResult getEntities(String entity) throws SQLException {
        return sql.query(buildDictionaryQuery(entity));
    }

    /**
     * Return the name of the dictionary if all other values are an exact match.
     *
     * @param values
     * @return
     * @throws SQLException
     */
    @ServerSide
    public String lookupCollection(EntityValues values) throws SQLException {
        SQLResult query = sql.query("select * from dictionary where entity=%s and lemma=%s and link=%s and tag=%s", values.text(), values.lemma(), values.link(), values.tag());
        if (query.size() == 0) {
            return "";
        }
        for (SQLRecord record : query) {
            if (record.getEntry("collection").getValue().equals(DEFAULT_DICTIONARY)) {
                return DEFAULT_DICTIONARY;
            }
        }
        return query.get(0).getEntry("collection").getValue();
    }

    /**
     * Return the most preferred result if it exists in dictionary.
     *
     * @param entity
     * @return null if not found
     * @throws SQLException
     */
    @ServerSide
    public EntityValues pollEntity(String entity) throws SQLException {
        SQLResult entities = getEntities(entity);
        if (entities.size() == 0) {
            return null;
        }
        for (SQLRecord record : entities) {
            if (record.getEntry("collection").getValue().equals(DEFAULT_DICTIONARY)) {
                return new EntityValues(record);
            }
        }
        return new EntityValues(entities.get(0));
    }
}
