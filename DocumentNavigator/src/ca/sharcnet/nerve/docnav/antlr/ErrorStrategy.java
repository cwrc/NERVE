package ca.sharcnet.nerve.docnav.antlr;
import java.util.ArrayList;
import java.util.List;
import org.antlr.v4.runtime.DefaultErrorStrategy;
import org.antlr.v4.runtime.InputMismatchException;
import org.antlr.v4.runtime.Parser;

public class ErrorStrategy extends DefaultErrorStrategy {
    private final ArrayList<ParserError> list = new ArrayList<>();
    
    @Override
    public void reportInputMismatch(Parser parser, InputMismatchException re) {
        this.list.add(new ParserError("input mismatch", parser.getCurrentToken()));
    }

    @Override
    protected void reportUnwantedToken(Parser parser) {
        this.list.add(new ParserError("unwanted token", parser.getCurrentToken()));
    }

    @Override
    protected void reportMissingToken(Parser parser) {
        this.list.add(new ParserError("missing token", parser.getCurrentToken()));
    }
    
    public List<ParserError> getErrors(){
        return new ArrayList<>(this.list);
    }
}