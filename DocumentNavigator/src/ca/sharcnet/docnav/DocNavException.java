package ca.sharcnet.docnav;

public class DocNavException extends RuntimeException{
    String source = "";

    public DocNavException(){
        super();
    }

    public DocNavException(String string) {
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
