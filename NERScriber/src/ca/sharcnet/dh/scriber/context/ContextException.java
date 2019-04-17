package ca.sharcnet.dh.scriber.context;

public class ContextException extends RuntimeException{
    private final Context context;

    ContextException(String string, Context context) {
        super(string);
        this.context = context;
    }

    public Context getContext(){
        return this.context;
    }    
}
