package ca.sharcnet.nerve.docnav;

import ca.sharcnet.nerve.docnav.antlr.ErrorStrategy;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.generated.EncodeLexer;
import ca.sharcnet.nerve.docnav.generated.EncodeParser;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.antlr.v4.runtime.ANTLRErrorStrategy;
import org.antlr.v4.runtime.ANTLRInputStream;
import org.antlr.v4.runtime.CommonTokenStream;

public class DocumentNavigator {

    public static Document documentFromStream(InputStream srcStream) throws IOException {
        EncodeLexer lexer = new EncodeLexer(new ANTLRInputStream(srcStream));
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        EncodeParser parser = new EncodeParser(tokens);

        ANTLRErrorStrategy handler = new ErrorStrategy();
        parser.setErrorHandler(handler);

        parser.start();

        Document root = new Document();
        root.addChildNodes(parser.getNodes());
        return root;
    }

    public static Document documentFromString(String string) throws IOException {
        InputStream srcStream = new ByteArrayInputStream( string.getBytes("UTF-8"));
        EncodeLexer lexer = new EncodeLexer(new ANTLRInputStream(srcStream));
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        EncodeParser parser = new EncodeParser(tokens);

        ANTLRErrorStrategy handler = new ErrorStrategy();
        parser.setErrorHandler(handler);

        parser.start();

        Document root = new Document();
        root.addChildNodes(parser.getNodes());
        return root;
    }
}
