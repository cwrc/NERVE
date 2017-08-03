package ca.sharcnet.nerve.decode;
import static ca.sharcnet.nerve.Constants.*;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.context.Context;
import static ca.sharcnet.nerve.context.Context.NameSource.NAME;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.context.TagInfo;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.InstructionNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import java.io.IOException;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;
import ca.sharcnet.nerve.docnav.dom.DoctypeNode;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import static ca.sharcnet.nerve.docnav.dom.NodeType.ELEMENT;
import ca.sharcnet.nerve.docnav.dom.extended.HTMLElement;
import ca.sharcnet.nerve.docnav.query.Query;
import org.json.JSONObject;

public class Decoder {
    private Context context = null;

    /**
    Decode a document using a 'HasStreams' object to load the context.
    @param document
    @param hasStreams
    @return
    @throws IllegalArgumentException
    @throws IOException
    @throws ClassNotFoundException
    @throws InstantiationException
    @throws IllegalAccessException
    @throws SQLException
    @throws ParserConfigurationException
    */
    public static Document decode(Document document, HasStreams hasStreams) throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException{
        Query selected = document.queryf("[%s]", CONTEXT_ATTRIBUTE);
        if (selected.isEmpty()) throw new RuntimeException("Context element not found.");
        String contextPath = String.format("/contexts/%s.context.json", selected.attr(CONTEXT_ATTRIBUTE).toLowerCase());
        Context context = ContextLoader.load(hasStreams.getResourceStream(contextPath));
        Document decoded = new Decoder().decode(document, context);
        return decoded;
    }

    /**
    Decode a document using a 'HasStreams' with a provided context.
    @param srcDoc
    @param context
    @return
    @throws IOException
    @throws ClassNotFoundException
    @throws InstantiationException
    @throws IllegalAccessException
    @throws SQLException
    @throws ParserConfigurationException
    */
    public Document decode(Document document, Context context) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        this.context = context;
        Query xmltag = document.queryf(".%s, .%s", HTML_NONENTITY, HTML_ENTITY);

        xmltag.forEach((Node node)->{
            /* change html tag name to xml tag name, which is stored in ORG_TAGNAME attribute */
            node.name(node.attr(ORG_TAGNAME));

            /* restore xml attribtes from JSON object stored in XML_ATTR_LIST */
            JSONObject json = new JSONObject(node.attr(XML_ATTR_LIST));
            node.clearAttributes();
            for (String key : json.keySet()) node.attr(key, json.getString(key));

            /* set default values */
            if (context.isTagName(node.name(), NAME)){
                TagInfo tagInfo = context.getTagInfo(node.name(), NAME);
                for (String key : tagInfo.defaults().keySet()) {
                    if (node.hasAttribute(key)) continue;
                    node.attr(key, tagInfo.getDefault(key));
                }
            }
        });

        /* restore all instruction nodes */
        document.queryf(".%s", HTML_PROLOG).forEach(n->{
            InstructionNode iNode = new InstructionNode(n.attr(ORG_TAGNAME));
            JSONObject json = new JSONObject(n.attr(XML_ATTR_LIST));
            for (String key : json.keySet()) iNode.attr(key, json.getString(key));
            n.replaceWith(iNode);
        });

        /* restore all doctype nodes */
        document.queryf(".%s", HTML_DOCTYPE).forEach(n->{
            DoctypeNode dNode = new DoctypeNode(n.attr(DOCTYPE_INNERTEXT));
            n.replaceWith(dNode);
        });

        return document;
    }
}