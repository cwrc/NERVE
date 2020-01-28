package ca.sharcnet.nerve.scriber.query;

import static ca.sharcnet.nerve.scriber.Constants.LOG_NAME;
import ca.sharcnet.nerve.scriber.query.Query;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import org.w3c.dom.Document;
import org.w3c.dom.Node;

/**
 *
 * @author edward
 */
public class QueryPrinter {

    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger(LOG_NAME);

    /**
     * Replace all instances of escapable characters with their escape sequence.
     *
     * @param string
     * @return
     */
    public static String escape(String string) {
        string = string.replace("&", "&amp;");
        string = string.replace("<", "&lt;");
        string = string.replace(">", "&gt;");
        string = string.replace("'", "&apos;");
        return string.replace("\"", "&quot;");
    }

    /**
     * Replace all instances of escapable characters with their escape sequence.
     * This only applies to characters that would be invalid in the text portion
     * of the element.
     *
     * @param string
     */
    public static String escapeText(String string) {
        string = string.replace("&", "&amp;");
        return string.replace("<", "&lt;");
    }    
    
    private final Query query;

    QueryPrinter(Query query) {
        this.query = query;
    }

    void toStream(OutputStream outputStream) throws IOException {
        for (Node node : query) {
            if (node == query.getDocument()) toStream((Document) node, outputStream);
            else toStream(node, outputStream);
        }
    }

    @Override
    public String toString() {
        StringBuilder sBuilder = new StringBuilder();

        // Todo:refactor to allow other encodings and removal of OutputStream to simplify
        OutputStream os = new OutputStream() {
            @Override
            public void write(int b) throws IOException {
                sBuilder.append((char) b);
            }
            @Override
            public void write(byte[] b) throws IOException {
                LOGGER.trace(new String(b, "UTF-8"));
                sBuilder.append(new String(b, "UTF-8"));
            }
        };

        try {
            this.toStream(os);
            os.close();
        } catch (IOException ex) {
            throw new RuntimeException(); // really shouldn't ever get called
        }

        return sBuilder.toString();
    }

    private void toStream(Document document, OutputStream outputStream) throws IOException {
        StringBuilder sBuilder = new StringBuilder();
        sBuilder.append("<?xml version=\"");
        sBuilder.append(document.getXmlVersion());
        sBuilder.append("\" encoding=\"");
        sBuilder.append(query.getEncoding() != null ? query.getEncoding() : document.getXmlEncoding());
        sBuilder.append("\"");
        if (document.getXmlStandalone()) sBuilder.append(" standalone=\"yes\"");
        sBuilder.append("?>\n");
        outputStream.write(sBuilder.toString().getBytes());

        for (Node child : query.select(":doc").children(n -> true)) {
            toStream(child, outputStream);
        }
    }

    private void toStream(Node node, OutputStream outputStream) throws IOException {
        StringBuilder sBuilder;

        switch (node.getNodeType()) {
            case Node.ELEMENT_NODE:
                Query element = query.select(node);
                sBuilder = new StringBuilder();
                sBuilder.append("<").append(element.tagName());

                if (element.attributes().size() > 0) sBuilder.append(" ");
                for (String attr : element.attributes()) {
                    sBuilder.append(attr).append("=\"");
                    sBuilder.append(escape(element.attribute(attr)));
                    sBuilder.append("\" ");
                }
                if (element.attributes().size() > 0) sBuilder.deleteCharAt(sBuilder.length() - 1);

                sBuilder.append(">");
                LOGGER.trace(sBuilder.toString());
                outputStream.write(sBuilder.toString().getBytes());

                for (Node child : element.children(n -> true)) {
                    toStream(child, outputStream);
                }

                sBuilder = new StringBuilder();
                sBuilder.append("</").append(element.tagName()).append(">");
                LOGGER.trace(sBuilder.toString());
                outputStream.write(sBuilder.toString().getBytes());
                break;

            case Node.PROCESSING_INSTRUCTION_NODE:
                sBuilder = new StringBuilder();
                sBuilder.append("<?").append(node.getNodeName()).append(" ");
                sBuilder.append(node.getTextContent());
                sBuilder.append("?>\n");
                outputStream.write(sBuilder.toString().getBytes());
                break;
            case Node.TEXT_NODE:
                LOGGER.trace(escape(node.getTextContent()));
                outputStream.write(escape(node.getTextContent()).getBytes());
                break;
            case Node.COMMENT_NODE:
                outputStream.write(("<!--").getBytes());
                outputStream.write((node.getTextContent().getBytes()));
                outputStream.write(("-->").getBytes());
                break;
        }
    }

}
