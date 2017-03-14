package ca.sharcnet.nerve.docnav.antlr;
import org.antlr.v4.runtime.DefaultErrorStrategy;
import org.antlr.v4.runtime.InputMismatchException;
import org.antlr.v4.runtime.Parser;

public class ErrorStrategy extends DefaultErrorStrategy {

    @Override
    public void reportInputMismatch(Parser parser, InputMismatchException re) {
        throw new InvalidTokenException(parser.getCurrentToken());
    }

    @Override
    protected void reportUnwantedToken(Parser parser) {
        throw new InvalidTokenException(parser.getCurrentToken());
    }

    @Override
    protected void reportMissingToken(Parser parser) {
        super.reportUnwantedToken(parser);
        System.exit(0);
    }
}