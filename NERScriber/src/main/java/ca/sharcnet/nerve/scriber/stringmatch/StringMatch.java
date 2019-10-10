package ca.sharcnet.nerve.scriber.stringmatch;
import ca.sharcnet.nerve.scriber.graph.Tree;
import ca.sharcnet.nerve.scriber.stringmatch.Token.TOKEN_TYPE;
import static ca.sharcnet.nerve.scriber.stringmatch.Token.TOKEN_TYPE.*;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import org.apache.logging.log4j.Level;

/**
 * Stores a candidate ({@link #addCandidate}) as a series of space delimited
 * tokens (a token by default is a word). Will attempt to match the maximum
 * number of tokens in a query ({@link #seekLine}).
 *
 * @author edward
 */
public class StringMatch <NODE> {
    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger("StringMatch");
    private final String tokenRegex;
    private final String matchRegex;
    private Tree <String, NODE> tree = new Tree();
    
    private ArrayList<String> tokens = new ArrayList<>();
    private ArrayList<String> allTokens = new ArrayList<>();

    
    public StringMatch() {
        this("[^a-zA-Z0-9']", "[a-zA-Z0-9']+");
    }

    /**
     *
     * @param deliminatorRegex The regular expression denoting word separators.
     */
    public StringMatch(String deliminatorRegex, String matchRegex) {
        this.tokenRegex = deliminatorRegex;
        this.matchRegex = matchRegex;
    }

    /**
     * Enter a candidate string. Tokens within the candidate are ignored. When
     * the seekLine method is called the original string is passed to the
     * consumer callback.
     *
     * @param entity
     * @param row The candidate string.
     */
    public void addCandidate(String entity, NODE row) {
        LOGGER.log(Level.DEBUG, "addCandidate (from db): " + entity);
        String[] split = entity.split(tokenRegex);
        if (split.length == 0) return;
        this.tree.addPath(split, row);
    }

    /**
     * Set the string from which matches will be sought.
     *
     * @param source
     * @return an array of tokens
     */
    public ArrayList<String> setSource(String source) {
        tokens = new ArrayList<>();
        allTokens = new ArrayList<>();
        
        String regex = String.format("(?=(?!^)%1$s)(?<!%1$s)|(?!%1$s)(?<=%1$s)", tokenRegex);
        String[] tokenArray = source.split(regex);

        /* create array of tokens, skipping regex matching pattern */
        for (int i = 0; i < tokenArray.length; i++) {
            if (tokenArray[i].matches(this.matchRegex)){
                if (i == 0) allTokens.add("");                
                if (i == tokenArray.length - 1) allTokens.add("");
                tokens.add(tokenArray[i]);
                allTokens.add(tokenArray[i]);
            } else {
                allTokens.add(tokenArray[i]);
            }
        }

        System.out.println(allTokens.size() + " tokens");
        return tokens;
    }

    /**
     * Tokenize the given line and call 'function' on all matches found.
     * constructor. Accept(matching entity, associated sql row)
     *
     * @param source
     * @param reject
     * @param accept
     */
    public void seekLine(OnAccept accept, OnReject reject) {
        if (accept == null) throw new NullPointerException();
        if (reject == null) throw new NullPointerException();

        Tokenizer <String> tokenizer = new Tokenizer(tree);
        List<Token> tokenized = tokenizer.tokenize(tokens);
        
        int state = 0;
        
        for (int i = 0; i < tokenized.size(); i++){
            Token t = tokenized.get(0);
            
        }
    }
    
    private int nextState(int currentState, TOKEN_TYPE tokenType){
        switch (currentState){
            case 0:
             
        }
    }
    
    private void accept(int start, int end, NODE value, OnAccept accept){
        System.out.println("accept " + start + " " + end);
        int s = (start * 2) + 1;
        int e = (end * 2) + 1;
        accept.accept(rebuild(s, e), value);
    }
    
    private void reject(int start, int end, OnReject reject){
        System.out.println("reject " + start + " " + end);
        int s = (start * 2);
        int e = (end * 2) + 2;
        reject.reject(rebuild(s, e));
    }
    
    public String rebuild(int start, int end){
        StringBuilder builder = new StringBuilder();
        for (int i = start; i <= end; i++){
            builder.append(allTokens.get(i));
        }
        return builder.toString();
    }
}
