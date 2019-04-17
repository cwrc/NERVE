package ca.sharcnet.dh.scriber.encoder;

import static ca.sharcnet.dh.scriber.Constants.DATA_LEMMA;
import static ca.sharcnet.dh.scriber.Constants.DATA_LINK;
import static ca.sharcnet.dh.scriber.Constants.DOCTYPE_INNERTEXT;
import static ca.sharcnet.dh.scriber.Constants.HTML_DOCTYPE;
import static ca.sharcnet.dh.scriber.Constants.HTML_ENTITY;
import static ca.sharcnet.dh.scriber.Constants.HTML_NONENTITY;
import static ca.sharcnet.dh.scriber.Constants.HTML_PROLOG;
import static ca.sharcnet.dh.scriber.Constants.HTML_TAGNAME;
import static ca.sharcnet.dh.scriber.Constants.ORG_TAGNAME;
import static ca.sharcnet.dh.scriber.Constants.XML_ATTR_LIST;
import ca.sharcnet.dh.scriber.context.TagInfo;
import ca.sharcnet.nerve.docnav.dom.Attribute;
import ca.sharcnet.nerve.docnav.dom.DoctypeNode;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import java.io.IOException;
import java.sql.SQLException;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;

/**
 *
 * @author edward
 */
public class EncoderHTML extends EncoderBase implements IEncoder {
    final static Logger LOGGER = LogManager.getLogger(EncoderHTML.class);

    @Override
    public void run() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        wrapNode(document);
    }

    /**
     * Convert an xml node into an html node
     *
     * @param node the node to wrap
     * @param allowEntities if false wrap all child tags as if they are
     * non-entity tags
     * @throws ClassNotFoundException
     * @throws InstantiationException
     * @throws IllegalAccessException
     * @throws IOException
     * @throws SQLException
     */
    private void wrapNode(Node node) throws ClassNotFoundException, InstantiationException, IllegalAccessException, IOException, SQLException {
        if (node.isType(NodeType.DOCTYPE)) {
            Node eNode = new ElementNode(HTML_TAGNAME);
            eNode.attr("class", HTML_DOCTYPE);
            DoctypeNode dNode = (DoctypeNode) node;
            eNode.attr(new Attribute(DOCTYPE_INNERTEXT, dNode.toString()));
            node.replaceWith(eNode);
            return;
        }

        JSONObject jsonObj = new JSONObject();
        for (Attribute attr : node.getAttributes()) {
            jsonObj.put(attr.getKey(), attr.getValue());
        }

        Node eNode = node;
        String schemaTag = node.name();

        /* if the node is a tagged entity, copy the lemma / link attributes   */
        /* to the html node as data attributes. These are removed from the    */
        /* attribute object.  All remaining attributes are then removed from  */
        /* the node                                                           */
        if (context.isTagName(schemaTag)) {
            String standardTag = context.getStandardTag(schemaTag);
            TagInfo tagInfo = context.getTagInfo(standardTag);
            String lemmaAttribute = tagInfo.getLemmaAttribute();
            String linkAttribute = tagInfo.getLinkAttribute();
            String lemmaValue = node.attr(lemmaAttribute);
            String linkValue = node.attr(linkAttribute);
            node.clearAttributes();
            node.attr(DATA_LEMMA, lemmaValue);
            node.attr(DATA_LINK, linkValue);
            jsonObj.remove(lemmaAttribute);
            jsonObj.remove(linkAttribute);
        } else {
            node.clearAttributes();
        }

        if (node.isType(NodeType.INSTRUCTION)) {
            eNode = new ElementNode(HTML_TAGNAME);
            node.replaceWith(eNode);
            eNode.attr("class", HTML_PROLOG);
        } else if (context.isTagName(schemaTag)) {
            node.attr("class", HTML_ENTITY);
            for (Node child : eNode.childNodes()) {
                wrapNode(child);
            }
        } else {
            node.attr("class", HTML_NONENTITY);
            for (Node child : eNode.childNodes()) {
                wrapNode(child);
            }
        }

        /* save the xml tagname, either as the standard name if it's a tagged */
        /* entity, else as the declared name of the xml node                  */
        if (context.isTagName(schemaTag)) {
            String standardTag = context.getStandardTag(schemaTag);
            eNode.attr(ORG_TAGNAME, standardTag);
        } else {
            eNode.attr(ORG_TAGNAME, node.name());
        }

        eNode.attr(XML_ATTR_LIST, jsonObj.toString());
        eNode.name(HTML_TAGNAME);
    }

}
