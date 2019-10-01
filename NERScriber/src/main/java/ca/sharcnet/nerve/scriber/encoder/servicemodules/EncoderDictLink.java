package ca.sharcnet.nerve.scriber.encoder.servicemodules;
import ca.sharcnet.nerve.scriber.context.TagInfo;
import ca.sharcnet.nerve.scriber.dictionary.Dictionary;
import ca.sharcnet.nerve.scriber.encoder.ServiceModuleBase;
import ca.sharcnet.nerve.scriber.encoder.UnsetContextException;
import ca.sharcnet.nerve.scriber.encoder.UnsetSchemaException;
import ca.sharcnet.nerve.scriber.query.Query;
import ca.sharcnet.nerve.scriber.sql.SQLRecord;
import ca.sharcnet.nerve.scriber.sql.SQLResult;
import java.io.IOException;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.logging.log4j.LogManager;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

/**
 * This module will link already tagged but unlinked entities.  Will fill in
 * the lemma attribute if not present.
 * @author edward
 */
public class EncoderDictLink extends ServiceModuleBase {
    final static org.apache.logging.log4j.Logger LOGGER = LogManager.getLogger(EncoderDictLink.class);

    @Override
    public void run() throws SQLException, IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        LOGGER.trace("EncoderDictLink.run()");
        if (schema == null) throw new UnsetSchemaException();
        if (context == null) throw new UnsetContextException();
        
        for (TagInfo tagInfo : context.tags()) {
            if (tagInfo.getLinkAttribute().isEmpty()) continue;
            String linkAttribute = tagInfo.getLinkAttribute();
                        
            Query tagged = this.getQuery().select(tagInfo.getName());
            tagged.removeIf(e->((Element)e).hasAttribute(linkAttribute));            
            
            for (Node n : tagged) lookupTaggedNode(n, tagInfo);
        }
    }
    
    private void lookupTaggedNode(Node node, TagInfo tagInfo) throws SQLException {
        LOGGER.trace(String.format("lookupTaggedNode(%s, %s)", node.getTextContent(), tagInfo.getStandard()));
        String linkAttribute = tagInfo.getLinkAttribute();
        String lemmaAttribute = tagInfo.getLemmaAttribute();
        Element element = (Element) node;
        
        String lemma = element.getAttribute(lemmaAttribute);
        if (lemma.isBlank()) lemma = null;
        
        for (Dictionary dictionary : this.getDictionaries()) {
            SQLResult sqlResult = dictionary.lookup(node.getTextContent(), lemma, node.getNodeName(), null);            
        
            if (sqlResult.isEmpty()) continue;
            
            SQLRecord row = sqlResult.get(0);            
            element.setAttribute(lemmaAttribute, row.getEntry("lemma").getValue());
            element.setAttribute(linkAttribute, row.getEntry("link").getValue());            
            return;
        }
    }
}