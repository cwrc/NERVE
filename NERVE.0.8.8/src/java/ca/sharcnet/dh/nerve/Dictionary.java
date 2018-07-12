package ca.sharcnet.dh.nerve;
import ca.frar.utility.console.Console;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.ServerSide;
import ca.frar.jjjrmi.annotations.Transient;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.frar.utility.SQL.SQL;
import ca.frar.utility.SQL.SQLRecord;
import ca.frar.utility.SQL.SQLResult;
import ca.sharcnet.nerve.context.Context;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Properties;

@JJJ
public class Dictionary extends JJJObject {
    @Transient private final String DEFAULT_DICTIONARY = "custom";
    @Transient private final SQL sql;

    public Dictionary() throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException{
        Properties config = new Properties();
        config.load(Dictionary.class.getResourceAsStream("/res/config.txt"));
        sql = new SQL(config);
    }

    @ServerSide
    public int addEntity(EntityValues value) throws SQLException{
        String format = String.format("insert into %s values (\"%s\", \"%s\", \"%s\", \"%s\", \"%s\") "
                + "ON DUPLICATE KEY UPDATE lemma=\"%s\", link=\"%s\", tag=\"%s\", source=\"%s\""
                , DEFAULT_DICTIONARY
                , value.text()
                , value.lemma()
                , value.link()
                , value.tag()
                , DEFAULT_DICTIONARY
                , value.lemma()
                , value.link()
                , value.tag()
                , DEFAULT_DICTIONARY
        );
        
        return sql.update(format);
    }

    @ServerSide
    public void deleteEntity(EntityValues value) throws SQLException{
        sql.update("delete from custom where entity=%s", DEFAULT_DICTIONARY, value.text());
    }

    private String buildDictionaryQuery(String entityText) throws SQLException {
        StringBuilder builder = new StringBuilder();
        
        SQLResult dictionaries = sql.query("select * from dictionaries");
        
        for (SQLRecord record : dictionaries){
            String dictionary = record.getEntry("name").getValue();
            if (!dictionary.equals(dictionaries.get(0).getEntry("name").getValue())) builder.append(" union ");            
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
    public SQLResult lookup(String text, String lemma, String tag, String source) throws SQLException{
        StringBuilder builder = new StringBuilder();
        
        SQLResult dictionaries = sql.query("select * from dictionaries");
        
        for (SQLRecord record : dictionaries){
            String dictionary = record.getEntry("name").getValue();
            if (!dictionary.equals(dictionaries.get(0).getEntry("name").getValue())) builder.append(" union ");            
            builder.append("select * from ");
            builder.append(dictionary);
            builder.append(" where entity = '").append(text).append("'");
            if (lemma != null) builder.append(" and lemma = '").append(lemma).append("'");
            if (tag != null) builder.append(" and tag = '").append(tag).append("'");
            if (source != null) builder.append(" and source = '").append(source).append("'");
        }

        return sql.query(builder.toString());        
    }    
    
    @ServerSide
    public SQLResult getEntities(String entity) throws SQLException{
        return sql.query(buildDictionaryQuery(entity));
    }

    /**
     * Return the name of the dictionary if all other values are an exact match.
     * @param values
     * @return
     * @throws SQLException
     */
    @ServerSide
    public String lookupCollection(EntityValues values) throws SQLException{
        SQLResult query = sql.query("select * from dictionary where entity=%s and lemma=%s and link=%s and tag=%s", values.text(), values.lemma(), values.link(), values.tag());
        if (query.size() == 0) return "";
        for (SQLRecord record : query){
            if (record.getEntry("collection").getValue().equals(DEFAULT_DICTIONARY)){
                return DEFAULT_DICTIONARY;
            }
        }
        return query.get(0).getEntry("collection").getValue();
    }

    /**
    Return the most preferred result if it exists in dictionary.
    @param entity
    @return null if not found
    @throws SQLException
    */
    @ServerSide
    public EntityValues pollEntity(String entity) throws SQLException{
        SQLResult entities = getEntities(entity);
        if (entities.size() == 0) return null;
        for (SQLRecord record : entities){
            if (record.getEntry("collection").getValue().equals(DEFAULT_DICTIONARY)){
                return new EntityValues(record);
            }
        }
        return new EntityValues(entities.get(0));
    }
}