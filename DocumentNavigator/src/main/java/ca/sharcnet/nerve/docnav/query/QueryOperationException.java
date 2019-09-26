package ca.sharcnet.nerve.docnav.query;

public class QueryOperationException extends RuntimeException{

    QueryOperationException() {
        super();
    }

    QueryOperationException(NullPointerException ex) {
        super(ex);
    }

}
