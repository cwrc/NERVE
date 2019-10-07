package ca.sharcnet.nerve.scriber.sql;
import java.sql.SQLException;

public class ScriberSQLException extends SQLException{
    private final String sqlUpdateString;
    
    public ScriberSQLException(String sqlUpdateString){
        this.sqlUpdateString = sqlUpdateString;
    }
    
    public ScriberSQLException(Exception cause, String sqlUpdateString){
        super(cause.getMessage() + " : " + sqlUpdateString, cause);
        this.sqlUpdateString = sqlUpdateString;
    }    
}
