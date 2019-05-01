package ca.sharcnet.dh.scriber.encoder;
import ca.sharcnet.dh.scriber.context.TagInfo;
import ca.sharcnet.dh.scriber.stringmatch.OnAccept;
import ca.sharcnet.dh.scriber.stringmatch.OnReject;
import ca.sharcnet.dh.scriber.stringmatch.StringMatch;
import ca.sharcnet.dh.sql.SQLRecord;
import ca.sharcnet.dh.sql.SQLResult;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.dom.TextNode;
import ca.sharcnet.nerve.docnav.query.Query;
import java.io.IOException;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 *
 * @author edward
 */
public class EncoderDictAll extends EncoderBase {
    final static Logger LOGGER = LogManager.getLogger(EncoderDictAll.class);
    
    @Override
    public void run() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {        
        LOGGER.log(Level.DEBUG, "EncoderDictionary.run()");   
        if (schema == null) throw new UnsetSchemaException();
        if (context == null) throw new UnsetContextException();
        if (dictionary == null) throw new UnsetDictionaryException();        
        seekEntities(document);
    }

    private void seekEntities(Document document) throws SQLException {
        Query textNodes = document.query(NodeType.TEXT);
        for (Node node : textNodes) {
            LOGGER.log(Level.DEBUG, "---------------------------------------------------------------------------");
            LOGGER.log(Level.DEBUG, "considering: '" + node.text().replaceAll("\n", "[nl]").replaceAll("\t", "[T]") + "'");            
            seekEntities((TextNode) node);
        }
    }

    private void seekEntities(TextNode child) throws SQLException {
        final NodeList newNodes = new NodeList();

        /* skip nodes that are already tagged */
        NodeList ancestorNodes = child.ancestorNodes(NodeType.ELEMENT);
        if (ancestorNodes.testAny(nd -> context.isTagName(nd.name()))) {
            LOGGER.log(Level.DEBUG, "skipping <" + child.name() + "> has tagged ancestor");
            return;
        }        
        
        /* choose the largest matching known entity */
        OnAccept onAccept = (string, row) -> {
            String standardTag = row.getEntry("tag").getValue();
            TagInfo tagInfo = context.getTagInfo(standardTag);
            String schemaTag = tagInfo.getName();
            String linkAttribute = tagInfo.getLinkAttribute();
            String lemmaAttribute = tagInfo.getLemmaAttribute();

            if (!schema.isValid(child.getParent(), schemaTag)) {
                newNodes.add(new TextNode(string));
            } else {
                Node elementNode = new ElementNode(schemaTag, string);
                if (!lemmaAttribute.isEmpty()) {
                    elementNode.attr(lemmaAttribute, row.getEntry("lemma").getValue());
                }
                if (!linkAttribute.isEmpty()) {
                    elementNode.attr(linkAttribute, row.getEntry("link").getValue());
                }
                
                LOGGER.log(Level.INFO, "entity identitified: " + elementNode.name() + ":" + elementNode.text().replaceAll("\n[\n \t]*", "[nl]").replaceAll("\t", "[T]"));
                newNodes.add(elementNode);
            }
        };

        OnReject onReject = (string) -> {
            newNodes.add(new TextNode(string));
        };

        StringMatch stringMatch = buildStringMatch(child.getText());
        stringMatch.seekLine(onAccept, onReject);
        child.replaceWith(newNodes);
    }

    /**
     * Create a new tagged entity for any text that is not already within a
     * tagged entity.
     *
     * @throws SQLException
     */
    private StringMatch buildStringMatch(String nodeText) throws SQLException {
        StringMatch stringMatch = new StringMatch();
        String[] candidates = stringMatch.setSource(nodeText);
        if (candidates.length == 0) {
            return stringMatch;
        }

        SQLResult sqlResult = this.dictionary.getEntities(candidates);

        LOGGER.log(Level.DEBUG, sqlResult.size() + " candidates found");
        for (int i = 0; i < sqlResult.size(); i++) {
            SQLRecord row = sqlResult.get(i);
            stringMatch.addCandidate(row.getEntry("entity").getValue(), row);
        }

        return stringMatch;
    }

}
