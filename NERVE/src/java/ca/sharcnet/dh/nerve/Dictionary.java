package ca.sharcnet.dh.nerve;
import ca.fa.jjjrmi.annotations.NativeJS;
import ca.fa.jjjrmi.annotations.ServerSide;
import ca.fa.jjjrmi.annotations.SkipJS;
import ca.fa.jjjrmi.annotations.Transient;
import ca.fa.jjjrmi.socket.RMISocket;
import ca.fa.SQL.SQL;
import ca.fa.SQL.SQLRecord;
import ca.fa.SQL.SQLResult;
import ca.fa.utility.Console;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Properties;

@NativeJS
public class Dictionary extends RMISocket{
    @Transient private final String preferredCollection = "custom";
    @Transient private final SQL sql;

    @SkipJS
    public Dictionary() throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException{
//        this.setRMISocketMonitor(new StreamRMISocketMonitor(System.out));
        Properties config = new Properties();
        config.load(Dictionary.class.getResourceAsStream("/res/config.txt"));
        sql = new SQL(config);

        Console.log("new dictionary");
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
        Console.logMethod(entity);
        SQLResult entities = getEntities(entity);
        Console.log("SANITY " + entities.size());
        if (entities.size() == 0) return null;
        for (SQLRecord record : entities){
            if (record.getEntry("collection").getValue().equals(preferredCollection)){
                return new EntityValues(record);
            }
        }
        return new EntityValues(entities.get(0));
    }
}