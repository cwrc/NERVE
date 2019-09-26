package ca.sharcnet.nerve.docnav.antlr;
import org.antlr.v4.runtime.Token;

public final class TagMismatchException extends RuntimeException {
    private final String found, expected;
    private final Token fToken, eToken;

    TagMismatchException(String expected, String found, Token fToken, Token eToken) {
        super(
            "closing tag '" + found + "' at " + fToken.getLine() + ":" + fToken.getCharPositionInLine()
            + " does not match opening tag '" + expected + "' at " + eToken.getLine() + ":" + eToken.getCharPositionInLine()
        );

        this.found = found;
        this.expected = expected;
        this.fToken = fToken;
        this.eToken = eToken;
    }

    public String getFound() {
        return found;
    }

    public String getExpected() {
        return expected;
    }

    public Token getFoundToken() {
        return fToken;
    }

    public Token getExpectedToken() {
        return eToken;
    }
}
