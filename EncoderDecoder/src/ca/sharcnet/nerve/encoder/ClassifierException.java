package ca.sharcnet.nerve.encoder;

public class ClassifierException extends Exception{
    public ClassifierException(Throwable cause){
        super(cause.getMessage(), cause);
    }

    public ClassifierException(String msg){
        super(msg);
    }
}
