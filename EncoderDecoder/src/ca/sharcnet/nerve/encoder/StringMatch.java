package ca.sharcnet.nerve.encoder;

import ca.sharcnet.graph.PathResult;
import ca.sharcnet.graph.Tree;
import ca.fa.SQL.SQLRecord;

/**
Stores a candidate ({@link #addCandidate}) as a series of space deliminated tokens (a token by default is a word).
Will attempt to match the maximum number of tokens in a query ({@link #seekLine}).
@author edward
 */
public class StringMatch {
    final Tree<String, SQLRecord> candidates = new Tree<>();
    private final String tokenRegex;

    public StringMatch() {
        this("[^a-zA-Z0-9]");
    }

    public StringMatch(String tokenRegex) {
        this.tokenRegex = tokenRegex;
    }

    /**
        Enter a candidtate string.  If 'case sensative' was set to false the
        candidate is first converted to lower case.  Tokens within the candidate
        are ignored.  When the seekLine method is called the original string is
        passed to the consumer callback.
        @param entity
        @param row The candidate string.
     */
    public void addCandidate(String entity, SQLRecord row) {
        String[] tokens = entity.split(tokenRegex);
        this.candidates.addPath(tokens, row);
    }

    /**
        Tokenize the given line and call 'function' on all matches found.  Will
        convert line to lower case if 'case sensative' was set to true in the
        constructor.
        @param source
        @param reject
        @param accept
     */
    public void seekLine(String source, OnAccept accept, OnReject reject) {
        String regex = String.format("(?=(?!^)%1$s)(?<!%1$s)|(?!%1$s)(?<=%1$s)", tokenRegex);
        String[] tokens = source.split(regex);

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
