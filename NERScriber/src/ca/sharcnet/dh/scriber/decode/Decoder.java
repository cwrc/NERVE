package ca.sharcnet.dh.scriber.decode;
import ca.sharcnet.dh.scriber.Constants;
import static ca.sharcnet.dh.scriber.Constants.*;
import ca.sharcnet.dh.scriber.HasStreams;
import ca.sharcnet.dh.progress.ProgressListener;
import ca.sharcnet.dh.scriber.ProgressPacket;
import ca.sharcnet.dh.scriber.ProgressStage;
import ca.sharcnet.dh.scriber.context.Context;
import ca.sharcnet.dh.scriber.context.ContextLoader;
import ca.sharcnet.dh.scriber.context.TagInfo;
import ca.sharcnet.docnav.DocNavException;
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
    private ProgressPacket progressPacket;

    /**
     * Decode a document using a 'HasStreams' object to load the context.
     *
     * @param document An encoded document.
     * @param contextName
     * @param hasStreams Class from which streams will be read.
     * @param listener Class to which output messages will be sent.
     * @return
     * @throws IllegalArgumentException
     * @throws IOException
     * @throws ClassNotFoundException
     * @throws InstantiationException
     * @throws IllegalAccessException
     * @throws SQLException
     * @throws ParserConfigurationException
     */
    public static Document decode(Document document, String contextName, HasStreams hasStreams, ProgressListener listener) throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ScriptException, NoSuchMethodException {
        ProgressPacket progressPacket = new ProgressPacket();
        if (listener != null) listener.start("Decoding Document");
                
        String contextPath = String.format("%s/%s.context.json", CONTEXT_PATH, contextName.toLowerCase());
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

        progressPacket.message("").stage(ProgressStage.COMPLETE);
        if (listener != null) listener.end();
        return decoded;
    }

    public static Document decode(Document document, String contextName, HasStreams hasStreams) throws IllegalArgumentException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ScriptException, NoSuchMethodException {
        return decode(document, contextName, hasStreams, null);
    }

    /**
     * Decode a document using a 'HasStreams' with a provided context.
     *
     * @param document
     * @param context
     * @param jsScript
     * @return
     * @throws IOException
     * @throws ClassNotFoundException
     * @throws InstantiationException
     * @throws IllegalAccessException
     * @throws SQLException
     * @throws ParserConfigurationException
     * @throws javax.script.ScriptException
     */
    public Document decode(Document document, Context context, Invocable jsScript) throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException, ScriptException, NoSuchMethodException {
        Query xmltag = document.queryf(".%s, .%s", HTML_NONENTITY, HTML_ENTITY);
        Collections.reverse(xmltag);

        for (Node node : xmltag) {
            JSONObject json = new JSONObject(node.attr(XML_ATTR_LIST));
            
            /* change html tag name to xml tag name, which is stored in ORG_TAGNAME attribute */
            switch (node.attr("class")){
                case HTML_NONENTITY:
                    node.name(node.attr(ORG_TAGNAME));
                    node.clearAttributes();
                break;
                case HTML_ENTITY:
                    String standardTag = node.attr(ORG_TAGNAME);
                    TagInfo tagInfo = context.getTagInfo(standardTag);
                    node.name(tagInfo.getName());                    
                    String lemmaValue = node.attr(DATA_LEMMA);
                    String linkValue = node.attr(DATA_LINK);
                    node.clearAttributes();
                    String lemmaAttribute = tagInfo.getLemmaAttribute();
                    String linkAttribute = tagInfo.getLinkAttribute();                     
                    node.attr(lemmaAttribute, lemmaValue);
                    node.attr(linkAttribute, linkValue);
                break;
            }

            try {
                for (String key : json.keySet()) {
                    if (key.equals(Constants.DICT_SRC_ATTR)) continue;
                    node.attr(key, json.getString(key));
                }
            } catch (DocNavException ex) {
                ex.setSource(json.toString());
            }

            /* set default values */
            if (context.isTagName(node.name())) {
                String standardTag = context.getStandardTag(node.name());
                TagInfo tagInfo = context.getTagInfo(standardTag);

                for (String key : tagInfo.defaults().keySet()) {
                    if (node.hasAttribute(key)) {
                        continue;
                    }
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
            for (String key : json.keySet()) {
                iNode.attr(key, json.getString(key));
            }
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
