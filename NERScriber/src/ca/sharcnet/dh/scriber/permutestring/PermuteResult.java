package ca.sharcnet.dh.scriber.permutestring;

public class PermuteResult{
    private String result;

    public PermuteResult(String source){
        this.result = source;
    }

    public String toString(){
        return result;
    }

    public String toEntityClause(){
        return "entity = \"" + result + "\"";
    }

    public String toLemmaClause(){
        return "lemma = \"" + result + "\"";
    }
}