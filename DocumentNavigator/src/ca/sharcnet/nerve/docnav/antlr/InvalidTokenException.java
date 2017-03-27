package ca.sharcnet.nerve.docnav.antlr;
import org.antlr.v4.runtime.Token;

public final class InvalidTokenException extends RuntimeException {

    public InvalidTokenException(Token token) {
        super(
            "unexpected token '" + token.getText() + "' at " + token.getLine() + ":" + token.getCharPositionInLine()
        );
    }
}