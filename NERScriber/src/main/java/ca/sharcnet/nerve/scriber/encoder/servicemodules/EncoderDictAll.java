package ca.sharcnet.nerve.scriber.encoder.servicemodules;
import ca.sharcnet.nerve.scriber.stringmatch.OnAccept;
import ca.sharcnet.nerve.scriber.stringmatch.OnReject;
import ca.sharcnet.nerve.scriber.sql.SQLRecord;
import ca.sharcnet.nerve.scriber.sql.SQLResult;
import ca.sharcnet.nerve.scriber.query.Query;
import static ca.sharcnet.nerve.scriber.Constants.LOG_NAME;
import ca.sharcnet.nerve.scriber.context.TagInfo;
import ca.sharcnet.nerve.scriber.dictionary.Dictionary;
import ca.sharcnet.nerve.scriber.encoder.*;
import ca.sharcnet.nerve.scriber.stringmatch.*;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import javax.xml.parsers.ParserConfigurationException;
import org.w3c.dom.Node;

public class EncoderDictAll extends ServiceModuleBase {
    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger(LOG_NAME);
    
    private static String oneLine(String s){
        return s.replaceAll("\n", "[nl]").replaceAll("\t", "[T]");
    }
    
    @Override
    public void run() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {        
        LOGGER.trace("EncoderDictionary.run()");
        if (schema == null) throw new UnsetSchemaException();
        if (context == null) throw new UnsetContextException();
        
        Query textNodes = this.getQuery().allChildren(n->{
            return n.getNodeType() == Node.TEXT_NODE;
        });
        LOGGER.trace("textNodes.size() : " + textNodes.size());
        
        for (int i = 0; i < textNodes.size(); i++) {
            seekEntitiesInText(textNodes.select(i));
        }
    }

    private void seekEntitiesInText(Query textQuery) throws SQLException {
        LOGGER.trace(String.format("EncoderDictionary.seekEntitiesInText(%s)", oneLine(textQuery.get(0).getTextContent())));        
        if (textQuery.text().isBlank()) return;
        Query newNodes = this.getQuery().newQuery();
        
        /* skip nodes that are already tagged */
        Query ancestors = textQuery.ancestors();
        if (ancestors.stream().anyMatch(n -> context.isTagName(n.getNodeName()))){
            return;
        }
        
        /* choose the largest matching known entity */
        OnAccept<SQLRecord> onAccept = (string, row) -> {
            LOGGER.trace("EncoderDictionary.onAccept()");
            String standardTag = row.getEntry("tag").getValue();
            TagInfo tagInfo = context.getTagInfo(standardTag);
            String schemaTag = tagInfo.getName();
            String linkAttribute = tagInfo.getLinkAttribute();
            String lemmaAttribute = tagInfo.getLemmaAttribute();

            if (schema.isValid(textQuery.parent().get(0), schemaTag)) {                
                Query newElement = this.getQuery().newElement(schemaTag, string);
                
                if (!lemmaAttribute.isEmpty()) {
                    newElement.attribute(lemmaAttribute, row.getEntry("lemma").getValue());
                }
                if (!linkAttribute.isEmpty() && !row.getEntry("link").getValue().isEmpty()) {
                    newElement.attribute(linkAttribute, row.getEntry("link").getValue());
                }
                
                newNodes.add(newElement);
                this.setDefaultAttributes(newElement);
            } else {
                /* not valid in schema */
                newNodes.add(textQuery.newText(string));
            }
        };

        OnReject onReject = (string) -> {
            LOGGER.trace(String.format("EncoderDictionary.onReject(%s)", oneLine(string)));
            newNodes.add(textQuery.newText(string));
        };

        StringMatch stringMatch = buildStringMatch(textQuery.get(0).getTextContent());
        stringMatch.seekLine(onAccept, onReject);
        textQuery.replaceWith(newNodes);
    }
    
    /**
     * Create a new tagged entity for any text that is not already within a
     * tagged entity.
     *
     * @throws SQLException
     */
    private StringMatch buildStringMatch(String nodeText) throws SQLException {
        LOGGER.trace("EncoderDictionary.buildStringMatch()");
        StringMatch stringMatch = new StringMatch();
//        
//        ArrayList<String> candidates = stringMatch.setSource(nodeText);
//        
//        if (candidates.length == 0) {
//            return stringMatch;
//        }
//
//        for (Dictionary dictionary : this.getDictionaries()){            
//            SQLResult sqlResult = dictionary.getEntities(candidates);
//
//            LOGGER.trace(sqlResult.size() + " candidates found");
//            for (int i = 0; i < sqlResult.size(); i++) {
//                SQLRecord row = sqlResult.get(i);
//                stringMatch.addCandidate(row.getEntry("entity").getValue(), row);
//            }
//        }

        return stringMatch;
    }
}