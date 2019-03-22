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
                + "constraint pk primary key(lemma, tag, source)"
                + ");",
                table));
        
        sql.update(String.format("insert into dictionaries values('%s')", table));
        return true;
    }

    @ServerSide
    public int addEntity(String table, EntityValues value) throws SQLException {
        String format = String.format("insert into %s values ('%s', '%s', '%s', '%s', '%s') "
                + "ON DUPLICATE KEY UPDATE entity='%s'",
                table,
                value.text(),
                value.lemma(),
                value.link(),
                value.tag(),
                table,
                value.text()
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
