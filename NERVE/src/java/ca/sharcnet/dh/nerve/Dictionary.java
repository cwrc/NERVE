package ca.sharcnet.dh.nerve;
import ca.fa.jjj.web.rmi.RMISocket;
import ca.fa.jjj.web.rmi.RMISocketMonitor;
import ca.fa.jjj.web.rmi.annotations.Remote;
import ca.fa.utility.Console;
import ca.fa.utility.SQL;
import ca.fa.utility.SQLResult;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Properties;

public class Dictionary extends RMISocket{
    private SQL sql;

    public Dictionary() throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException{
        Properties config = new Properties();
        config.load(Translate.class.getResourceAsStream("/res/config.txt"));
        sql = new SQL(config);
    }

    @Remote
    public void addEntity(String entity, String lemma, String link, String tag, String collection) throws SQLException{
        sql.update("insert into dictionary values (%s, %s, %s, %s, %s) "
            + "ON DUPLICATE KEY UPDATE lemma=%s, link=%s, tag=%s"
            , entity, lemma, link, tag, collection, lemma, link, tag);
    }

    @Remote
    public void deleteEntity(String entity, String dictionary) throws SQLException{
        sql.update("delete from dictionary where entity=%s and collection=%s", entity, dictionary);
    }

    @Remote
    public SQLResult getEntities(String entity) throws SQLException{
        return sql.query("select * from dictionary where entity=%s", entity);
    }
}
