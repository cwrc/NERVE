package ca.sharcnet.nerve.scriber.sql;
import java.sql.SQLException;

public class UpdateException extends SQLException{
    private final String sqlUpdateString;
    
    public UpdateException(String sqlUpdateString){
        this.sqlUpdateString = sqlUpdateString;
    }
}
