package ca.sharcnet.docnav;

import ca.sharcnet.nerve.docnav.dom.Document;

public class StartNodeException extends DocNavException{
    String source = "";
    private Document document;

    public StartNodeException(Document document){
        super("Could not find schema start node.");
        this.document = document;
    }

    /**
     * Return the document that the schema is based on.
     * @return 
     */
    public Document getDocument(){
        return this.document;
    }
    
    @Override
    public String getMessage(){
        return super.getMessage() + " : " + this.source;
    }

    public void setSource(String source){
        this.source = source;
    }
}
