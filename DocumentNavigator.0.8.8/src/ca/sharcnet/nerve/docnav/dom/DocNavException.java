package ca.sharcnet.nerve.docnav.dom;

public class DocNavException extends RuntimeException{
    String source = "";

    DocNavException(){
        super();
    }

    DocNavException(String string) {
        super(string);
    }

    @Override
    public String getMessage(){
        return super.getMessage() + " : " + this.source;
    }

    public void setSource(String source){
        this.source = source;
    }
}
