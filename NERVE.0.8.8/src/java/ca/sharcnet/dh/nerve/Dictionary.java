package ca.sharcnet.dh.nerve;
import ca.frar.utility.console.Console;
import ca.frar.jjjrmi.annotations.JJJ;
import ca.frar.jjjrmi.annotations.ServerSide;
import ca.frar.jjjrmi.annotations.Transient;
import ca.frar.jjjrmi.socket.JJJObject;
import ca.frar.utility.SQL.SQL;
import ca.frar.utility.SQL.SQLRecord;
import ca.frar.utility.SQL.SQLResult;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Properties;

@JJJ
public class Dictionary extends JJJObject{
    @Transient private final String preferredCollection = "custom";
    @Transient private final SQL sql;

    public Dictionary() throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException{
        Properties config = new Properties();
        config.load(Dictionary.class.getResourceAsStream("/res/config.txt"));
        sql = new SQL(config);
    }

    @ServerSide
    public String addEntity(EntityValues value) throws SQLException{
        String collection = value.getCollection().isEmpty() ? "custom" : value.getCollection();

        sql.update("insert into dictionary values (%s, %s, %s, %s, %s) "
            + "ON DUPLICATE KEY UPDATE lemma=%s, link=%s, tag=%s"
            , value.getEntity()
            , value.getLemma()
            , value.getLink()
            , value.getTagName()
            , collection
            , value.getLemma()
            , value.getLink()
            , value.getTagName()
        );

        return collection;
    }

    @ServerSide
    public void deleteEntity(EntityValues value) throws SQLException{
        sql.update("delete from dictionary where entity=%s and collection=%s", value.getEntity(), value.getCollection());
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
        SQLResult query = sql.query("select * from dictionary where entity=%s and lemma=%s and link=%s and tag=%s", values.getEntity(), values.getLemma(), values.getLink(), values.getTagName());
        if (query.size() == 0) return "";
        for (SQLRecord record : query){
            if (record.getEntry("collection").getValue().equals(preferredCollection)){
                return preferredCollection;
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
            if (record.getEntry("collection").getValue().equals(preferredCollection)){
                return new EntityValues(record);
            }
        }
        return new EntityValues(entities.get(0));
    }
}