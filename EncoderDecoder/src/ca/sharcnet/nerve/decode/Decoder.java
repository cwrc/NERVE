package ca.sharcnet.nerve.decode;

import ca.fa.utility.Console;
import static ca.sharcnet.nerve.Constants.*;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.context.Context;
import static ca.sharcnet.nerve.context.NameSource.NAME;
import ca.sharcnet.nerve.context.ContextLoader;
import ca.sharcnet.nerve.context.TagInfo;
import ca.sharcnet.nerve.docnav.dom.DocNavException;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.InstructionNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import java.io.IOException;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;
import ca.sharcnet.nerve.docnav.dom.DoctypeNode;
import ca.sharcnet.nerve.docnav.query.Query;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Collections;
import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import org.json.JSONObject;

public class Decoder {

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
    public static Document decode(Document document, HasStreams hasStreams) throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ScriptException, NoSuchMethodException {
        Query selected = document.queryf("[%s]", CONTEXT_ATTRIBUTE);
        if (selected.isEmpty()) throw new RuntimeException("Context element not found.");
        String contextPath = String.format("/contexts/%s.context.json", selected.attr(CONTEXT_ATTRIBUTE).toLowerCase());
        Context context = ContextLoader.load(hasStreams.getResourceStream(contextPath));

        ScriptEngine engine = null;
        if (context.hasScriptFilename()) {
            ScriptEngineManager manager = new ScriptEngineManager();
            engine = manager.getEngineByName("JavaScript");
            InputStream resourceAsStream = hasStreams.getResourceStream("/contexts/" + context.getScriptFilename());
            InputStreamReader inputStreamReader = new InputStreamReader(resourceAsStream);
            BufferedReader newBufferedReader = new BufferedReader(inputStreamReader);
            engine.eval(newBufferedReader);
        }

        Document decoded = new Decoder().decode(document, context, (Invocable) engine);
        return decoded;
    }

    /**
    Decode a document using a 'HasStreams' with a provided context.
    @param document
    @param context
    @param jsScript
    @return
    @throws IOException
    @throws ClassNotFoundException
    @throws InstantiationException
    @throws IllegalAccessException
    @throws SQLException
    @throws ParserConfigurationException
    @throws javax.script.ScriptException
     */
    public Document decode(Document document, Context context, Invocable jsScript) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ScriptException, NoSuchMethodException {
        Query xmltag = document.queryf(".%s, .%s", HTML_NONENTITY, HTML_ENTITY);
        Collections.reverse(xmltag);

        for (Node node : xmltag) {
            /* change html tag name to xml tag name, which is stored in ORG_TAGNAME attribute */
            node.name(node.attr(ORG_TAGNAME));

            /* restore xml attribtes from JSON object stored in XML_ATTR_LIST */
            JSONObject json = new JSONObject(node.attr(XML_ATTR_LIST));
            node.clearAttributes();

            try{
                for (String key : json.keySet()) node.attr(key, json.getString(key));
            } catch (DocNavException ex) {
                ex.setSource(json.toString());
            }

            /* set default values */
            if (context.isTagName(node.name(), NAME)) {
                TagInfo tagInfo = context.getTagInfo(node.name(), NAME);

                for (String key : tagInfo.defaults().keySet()) {
                    if (node.hasAttribute(key)) continue;
                    node.attr(key, tagInfo.getDefault(key));
                }

                if (tagInfo.hasDecodeScript()) {
                    String functionName = tagInfo.getDecodeScript();
                    Object outputText = jsScript.invokeFunction(functionName, node);
                }
            }
        };

        /* restore all instruction nodes */
        document.queryf(".%s", HTML_PROLOG).forEach(n -> {
            InstructionNode iNode = new InstructionNode(n.attr(ORG_TAGNAME));
            JSONObject json = new JSONObject(n.attr(XML_ATTR_LIST));
            for (String key : json.keySet()) iNode.attr(key, json.getString(key));
            n.replaceWith(iNode);
        });

        /* restore all doctype nodes */
        document.queryf(".%s", HTML_DOCTYPE).forEach(n -> {
            DoctypeNode dNode = new DoctypeNode(n.attr(DOCTYPE_INNERTEXT));
            n.replaceWith(dNode);
        });

        return document;
    }
}
