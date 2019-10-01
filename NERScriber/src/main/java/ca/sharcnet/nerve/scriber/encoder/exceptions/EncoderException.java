package ca.sharcnet.nerve.scriber.encoder.exceptions;

import ca.sharcnet.nerve.scriber.context.Context;

public class EncoderException extends RuntimeException{
    private final Context context;
    
    public EncoderException(Context context){
        this.context = context;
    }
    
    public EncoderException(String message, Context context){
        super(message);
        this.context = context;
    }    
    
    Context getContext(){
        return context;
    }
    
}
