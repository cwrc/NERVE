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
public class Dictionary extends JJJObject implements EncodeListener{
    @Transient private final String DEFAULT_DICTIONARY = "custom";
    @Transient private final SQL sql;
    @Transient private Context context;

    public Dictionary() throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException{
        Properties config = new Properties();
        config.load(Dictionary.class.getResourceAsStream("/res/config.txt"));
        sql = new SQL(config);
    }

    @ServerSide
    public String addEntity(EntityValues value) throws SQLException{
        String collection = value.collection().isEmpty() ? "custom" : value.collection();

        sql.update("insert into %s values (%s, %s, %s, %s) "
            + "ON DUPLICATE KEY UPDATE lemma=%s, link=%s, tag=%s"
            , DEFAULT_DICTIONARY
            , value.text()
            , value.lemma()
            , value.link()
            , value.tag()
            , value.lemma()
            , value.link()
            , value.tag()
        );

        return collection;
    }

    @ServerSide
    public void deleteEntity(EntityValues value) throws SQLException{
        sql.update("delete from %s where entity=%s", DEFAULT_DICTIONARY, value.text());
    }

    private String buildDictionaryQuery() {
        List<String> dictionaries = context.readFromDictionary();

        StringBuilder builder = new StringBuilder();
        
        for (String dictionary : dictionaries){
            if (!dictionary.equals(dictionaries.get(0))) builder.append(" union ");            
            builder.append("select * from ");
            builder.append(dictionary);
        }

        String query = builder.toString();
        Console.log(query);
        return query;
    }
    
    
    @ServerSide
    public SQLResult getEntities(String entity) throws SQLException{
        SQLResult query = sql.query("select * from dictionary where entity=%s", entity);
        return query;
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

    @Override
    public void onEncode(EncodeResponse encodeResponse) {
        this.context = encodeResponse.getContext();
    }
}