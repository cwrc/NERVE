package ca.sharcnet.nerve.docnav;
import ca.sharcnet.nerve.docnav.antlr.ErrorStrategy;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.generated.EncodeLexer;
import ca.sharcnet.nerve.docnav.generated.EncodeParser;
import java.io.InputStream;
import java.io.IOException;
import org.antlr.v4.runtime.ANTLRErrorStrategy;
import org.antlr.v4.runtime.ANTLRInputStream;
import org.antlr.v4.runtime.CommonTokenStream;

/**
 * Utility class for loading and parsing documents from sources.
 * @author edward
 */

public class DocumentLoader {
    public static Document documentFromStream(InputStream srcStream) throws IOException {
        return parseDocument(new ANTLRInputStream(srcStream));
    }

    public static Document documentFromString(String string) throws IOException {
        return parseDocument(new ANTLRInputStream(string));
    }

    private static Document parseDocument(ANTLRInputStream stream){
        EncodeLexer lexer = new EncodeLexer(stream);
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        EncodeParser parser = new EncodeParser(tokens);

        ANTLRErrorStrategy handler = new ErrorStrategy();
        parser.setErrorHandler(handler);

        parser.start();

        Document root = new Document();
        root.addChild(parser.getNodes());
        return root;
    }

    public DocumentLoader() {}
}
