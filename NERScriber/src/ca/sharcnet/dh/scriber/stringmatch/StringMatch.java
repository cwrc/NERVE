package ca.sharcnet.dh.scriber.stringmatch;

import ca.sharcnet.dh.sql.*;
import ca.frar.utility.console.Console;
import ca.sharcnet.dh.scriber.graph.PathResult;
import ca.sharcnet.dh.scriber.graph.Tree;
import java.util.ArrayList;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
Stores a candidate ({@link #addCandidate}) as a series of space deliminated tokens (a token by default is a word).
Will attempt to match the maximum number of tokens in a query ({@link #seekLine}).
@author edward
 */
public class StringMatch {
    final static Logger LOGGER = LogManager.getLogger(Logger.class);
    final Tree<String, SQLRecord> candidates = new Tree<>();
    private final String tokenRegex;
    private final String matchRegex;
    private String[] tokens;

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
        Enter a candidate string.  If `case sensitive` is set to false the
        candidate is first converted to lower case.  Tokens within the candidate
        are ignored.  When the seekLine method is called the original string is
        passed to the consumer callback.
        @param entity
        @param row The candidate string.
     */
    public void addCandidate(String entity, SQLRecord row) {
        LOGGER.log(Level.DEBUG, "addCandidate (from db): " + entity);
        String[] split = entity.split(tokenRegex);
        if (split.length == 0) return;
        this.candidates.addPath(split, row);
    }

    /**
     * Set the string from which matches will be sought.
     * @param source 
     * @return an array of all candidate strings
     */
    public String[] setSource(String source){
        ArrayList<String> strings = new ArrayList<>();
        String regex = String.format("(?=(?!^)%1$s)(?<!%1$s)|(?!%1$s)(?<=%1$s)", tokenRegex);
        this.tokens = source.split(regex);

        for (int i = 0; i < tokens.length; i++){
            if (!tokens[i].matches(this.matchRegex)) continue;
            
            String s = tokens[i];
            if (!strings.contains(s)) strings.add(s);
            
            for (int j = i + 1; j < tokens.length; j++){
                if (!tokens[j].matches(this.matchRegex)) continue;
                s = s + " " + tokens[j];
                if (!strings.contains(s)) strings.add(s);               
            }
        }
        
        strings.sort((String a, String b)->(b.length() - a.length()));        
        return strings.toArray(new String[strings.size()]);
    }
    
    /**
        Tokenize the given line and call 'function' on all matches found.  
        constructor.  Accept(matching entity, associated sql row)
        @param source
        @param reject
        @param accept
     */
    public void seekLine(OnAccept accept, OnReject reject) {
        if (accept == null) throw new NullPointerException();
        if (reject == null) throw new NullPointerException();

        Iterable<PathResult<String, SQLRecord>> allPaths = candidates.allPaths(tokens, 0, 1);

        int current = 0;

        for (PathResult<String, SQLRecord> path : allPaths) {
            if (current < path.getStart()) {
                reject.reject(rebuild(current, path.getStart() - 1, tokens));
                accept.accept(rebuild(path.getStart(), path.getEnd(), tokens), path.getValue());
                current = path.getEnd() + 1;
            } else {
                accept.accept(rebuild(path.getStart(), path.getEnd(), tokens), path.getValue());
                current = path.getEnd() + 1;
            }
        }

        if (current < tokens.length) {
            reject.reject(rebuild(current, tokens.length - 1, tokens));
        }
    }

    private String rebuild(int start, int end, String[] sourceTokens) {
        StringBuilder builder = new StringBuilder();
        for (int i = start; i <= end; i++) {
            builder.append(sourceTokens[i]);
        }
        return builder.toString();
    }
}
