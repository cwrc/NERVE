package ca.sharcnet.nerve.docnav.antlr;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import java.util.ArrayList;
import org.antlr.v4.runtime.Parser;
import org.antlr.v4.runtime.Token;
import org.antlr.v4.runtime.TokenStream;

public abstract class AbstractParser extends Parser{

    protected NodeList nodes = new NodeList();
    protected ArrayList<TokenNamePair> tagNames = new ArrayList<>();

    public AbstractParser(TokenStream input) {
        super(input);
    }

    public NodeList getNodes(){
        return nodes;
    }

    protected void pushTag(String tagName, Token token){
        tagNames.add(new TokenNamePair(tagName, token));
    }

    protected void popTag(String found, Token token){
        TokenNamePair removed = tagNames.remove(tagNames.size() - 1);
        String expected = removed.name;

        if (!expected.equals(found)) throw new TagMismatchException(expected, found, token, removed.token);
    }

    private class TokenNamePair{
        final String name;
        final Token token;

        TokenNamePair(String name, Token token){
            this.name = name;
            this.token = token;
        }
    }
}
