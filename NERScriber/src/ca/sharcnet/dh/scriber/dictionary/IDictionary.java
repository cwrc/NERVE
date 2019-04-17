package ca.sharcnet.dh.scriber.dictionary;
import ca.sharcnet.dh.sql.SQLResult;
import java.sql.SQLException;

/**
 *
 * @author edward
 */
public interface IDictionary {
    void addEntities(EntityValues[] values) throws SQLException;
    int deleteEntity(EntityValues value) throws SQLException;
    SQLResult getEntities(String... textArray) throws SQLException;
    SQLResult lookup(String text, String lemma, String tag, String source) throws SQLException;    
}
