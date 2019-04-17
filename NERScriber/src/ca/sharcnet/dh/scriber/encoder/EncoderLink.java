/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.dh.scriber.encoder;

import ca.sharcnet.dh.scriber.context.TagInfo;
import ca.sharcnet.dh.sql.SQLRecord;
import ca.sharcnet.dh.sql.SQLResult;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.query.Query;
import java.io.IOException;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.logging.log4j.LogManager;

/**
 *
 * @author edward
 */
public class EncoderLink extends EncoderBase implements IEncoder{
    final static org.apache.logging.log4j.Logger LOGGER = LogManager.getLogger(EncoderLink.class);
        
    @Override
    public void run() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        for (TagInfo tagInfo : context.tags()) {
            Query query = document.query(tagInfo.getName());
            for (Node node : query) {
                this.lookupTaggedNode(node);
            }
        }
    }

    private void lookupTaggedNode(Node node) throws SQLException {
        String standardTag = context.getStandardTag(node.name());
        TagInfo tagInfo = context.getTagInfo(standardTag);
        String linkAttribute = tagInfo.getLinkAttribute();
        String lemmaAttribute = tagInfo.getLemmaAttribute();

        if (linkAttribute.isEmpty() || node.hasAttribute(linkAttribute)) {
            return;
        }
        
        String lemma = null;
        if (node.hasAttribute(lemmaAttribute)) lemma = node.getAttribute(lemmaAttribute).getValue();
        
        LOGGER.debug("Text : " + node.text());
        LOGGER.debug("Lemma : " + lemma);
        
        SQLResult sqlResult = dictionary.lookup(node.text(), lemma, node.name(), null);
        
        if (sqlResult.size() == 0) {
            return;
        }
        
        SQLRecord row = sqlResult.get(0);
        node.attr(lemmaAttribute, row.getEntry("lemma").getValue());
        node.attr(linkAttribute, row.getEntry("link").getValue());
    }

}
