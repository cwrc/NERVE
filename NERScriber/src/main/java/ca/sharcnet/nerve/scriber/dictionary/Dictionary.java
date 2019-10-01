package ca.sharcnet.nerve.scriber.dictionary;
import static ca.sharcnet.nerve.scriber.Constants.LOG_NAME;
import ca.sharcnet.nerve.scriber.sql.SQLRecord;
import ca.sharcnet.nerve.scriber.sql.SQL;
import ca.sharcnet.nerve.scriber.sql.SQLResult;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;

public class Dictionary {
    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger(LOG_NAME);
    
    private static String DEFAULT_DICTIONARY = "default";
    private String dictionary = DEFAULT_DICTIONARY;
    private final SQL sql;
    private String SQL_CONFIG = "WEB-INF/config.properties";

    public Dictionary(SQL sql) throws IOException, ClassNotFoundException, IllegalAccessException, SQLException, InstantiationException{
        this.sql = sql;
    }

    public Dictionary setTable(String table){
        this.dictionary = table;
        return this;
    }
    
    public boolean verifySQL() throws ClassNotFoundException, IllegalAccessException, IllegalAccessException, IOException, InstantiationException, SQLException {
        for (SQLRecord record : sql.tables()){
            String tableName = record.getEntry("TABLE_NAME").getValue();
            LOGGER.debug(tableName);
            if (tableName.equals(this.dictionary)) return true;
        }

        addTable(this.dictionary);
        
        for (SQLRecord record : sql.tables()){
            String tableName = record.getEntry("TABLE_NAME").getValue();
            if (tableName.equals(this.dictionary)) return true;
        }
        return false;
    }

    public boolean hasTable(String table) throws SQLException{
        SQLResult tables = sql.tables();
        for (SQLRecord record : tables){
            String tableName = record.getEntry("TABLE_NAME").getValue();
            if (tableName.equals(table)) return true;
        }
        return false;
    }
    
    public boolean addTable(String table) throws ClassNotFoundException, IllegalAccessException, IllegalAccessException, IOException, InstantiationException, SQLException {
        if (hasTable(table)) return false;
        
        sql.update(String.format("CREATE TABLE %s ("
                + "entity varchar(255) NOT NULL,"
                + "lemma varchar(128) NOT NULL,"
                + "link varchar(255) NOT NULL,"
                + "tag varchar(16) NOT NULL,"
                + "source varchar(16) NOT NULL,"
                + "constraint pk primary key(entity, lemma, tag) on conflict replace"
                + ");",
                table));

        return true;
    }

    public int addEntities(Iterable<EntityValues> values) throws SQLException {
        int count = 0;
        StringBuilder builder = new StringBuilder();

        ArrayList<EntityValues> list = new ArrayList<>();
        for (EntityValues v : values) {
            if (v.hasText() && v.hasTag()) {
                count++;
                list.add(v);
                if (!v.hasLemma()) {
                    v.lemma(v.text());
                }
                if (!v.hasSource()) {
                    v.source("default");
                }
            }
        }

        builder.append(String.format("insert into %s values", this.dictionary));
        for (int i = 0; i < list.size(); i++) {
            EntityValues value = list.get(i);
            builder.append(String.format("(%s, %s, %s, %s, %s)",
                    SQL.sanitize(value.text()),
                    SQL.sanitize(value.lemma()),
                    SQL.sanitize(value.link()),
                    SQL.sanitize(value.tag()),
                    SQL.sanitize(value.source())
            ));
            if (i < list.size() - 1) {
                builder.append(",");
            }
        }
        String update = builder.toString();
        LOGGER.debug(update);        
        sql.update(update);
        return count;
    }

    public int addEntity(EntityValues value) throws SQLException {
        String format = String.format("insert into %s values (%s, %s, %s, %s, %s) ",
                SQL.sanitize(this.dictionary),
                SQL.sanitize(value.text()),
                SQL.sanitize(value.lemma()),
                SQL.sanitize(value.link()),
                SQL.sanitize(value.tag()),
                SQL.sanitize(value.source())
        );
        return sql.update(format);
    }

    public int deleteAll() throws SQLException {
        String format = String.format("delete from %s ", this.dictionary);
        return sql.update(format);
    }

    public void deleteEntity(EntityValues value) throws SQLException {
        StringBuilder builder = new StringBuilder();

        builder.append("delete from ");
        builder.append(this.dictionary);
        String connector = " WHERE ";

        LOGGER.debug(value);

        if (value.hasText()) {
            builder.append(connector);
            builder.append("entity = ").append(SQL.sanitize(value.text()));
            connector = " and ";
        }

        if (value.hasLemma()) {
            builder.append(connector);
            builder.append("lemma = ").append(SQL.sanitize(value.lemma()));
            connector = " and ";
        }

        if (value.hasTag()) {
            builder.append(connector);
            builder.append("tag = ").append(SQL.sanitize(value.tag()));
            connector = " and ";
        }

        if (value.hasLink()) {
            builder.append(connector);
            builder.append("link = ").append(SQL.sanitize(value.link()));
            connector = " and ";
        }

        if (value.hasSource()) {
            builder.append(connector);
            builder.append("source = ").append(SQL.sanitize(value.source()));
            connector = " and ";
        }

        String query = builder.toString();
        LOGGER.debug(query);

        try {
            sql.update(query);
        } catch (SQLException ex) {
            LOGGER.error("SQLException on query: " + query);
            throw ex;
        }
    }

    public SQLResult getEntities(String... textArray) throws SQLException {
        StringBuilder builder = new StringBuilder();

        builder.append("select * from ");
        builder.append(this.dictionary);
        builder.append(" where entity = ");

        for (int i = 0; i < textArray.length; i++) {
            String text = textArray[i];
            builder.append("'").append(text).append("'");
            if (i != textArray.length - 1) {
                builder.append(" OR entity = ");
            }
        }

        LOGGER.debug("dictioanry.getEntities()");
        LOGGER.debug(builder.toString());
        String query = builder.toString();
        return sql.query(query);
    }

    /**
     * Look for matching entities in the db. Null parameters are ignored.  For
     * example is lemma and source are null, text is "Steve", and tag is "Name".
     * All entries with entity=steve and tag=name will be returned, without
     * lookup refinement for source and lemma.
     *
     * @param text
     * @param lemma
     * @param tag
     * @param source
     * @return All matched results.
     * @throws SQLException
     */
    public SQLResult lookup(String text, String lemma, String tag, String source) throws SQLException {
        StringBuilder builder = new StringBuilder();

        builder.append("select * from ");
        builder.append(this.dictionary);
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

    /**
     * Look for matching entities in the db. Null values are ignored.
     *
     * @param text
     * @param lemma
     * @param tag
     * @param source
     * @return
     * @throws SQLException
     */
    public SQLResult lookupEntities(EntityValues value, int offset, int count) throws SQLException {
        StringBuilder builder = new StringBuilder();

        builder.append("select * from ");
        builder.append(this.dictionary);
        String connector = " WHERE ";

        LOGGER.debug(value);

        if (value.hasText()) {
            builder.append(connector);
            builder.append("entity LIKE ").append(SQL.sanitize(value.text()));
            connector = " and ";
        }

        if (value.hasLemma()) {
            builder.append(connector);
            builder.append("lemma LIKE ").append(SQL.sanitize(value.lemma()));
            connector = " and ";
        }

        if (value.hasTag()) {
            builder.append(connector);
            builder.append("tag LIKE ").append(SQL.sanitize(value.tag()));
            connector = " and ";
        }

        if (value.hasLink()) {
            builder.append(connector);
            builder.append("link LIKE ").append(SQL.sanitize(value.link()));
            connector = " and ";
        }

        if (value.hasSource()) {
            builder.append(connector);
            builder.append("source LIKE ").append(SQL.sanitize(value.source()));
            connector = " and ";
        }

        if (count > -1) {
            builder.append(" LIMIT ").append(count);
            if (offset > -1) {
                builder.append(",").append(offset);
            }
        }

        String query = builder.toString();
        LOGGER.debug(query);

        try {
            SQLResult sqlResult = sql.query(query);
            return sqlResult;
        } catch (SQLException ex) {
            LOGGER.error("SQLException on query: " + query);
            throw ex;
        }
    }
}
