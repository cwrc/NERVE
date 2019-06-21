/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.dh.scriber.encoder.servicemodules;

import ca.sharcnet.dh.scriber.Constants;
import static ca.sharcnet.dh.scriber.Constants.DATA_LEMMA;
import static ca.sharcnet.dh.scriber.Constants.DATA_LINK;
import static ca.sharcnet.dh.scriber.Constants.DOCTYPE_INNERTEXT;
import static ca.sharcnet.dh.scriber.Constants.HTML_DOCTYPE;
import static ca.sharcnet.dh.scriber.Constants.HTML_ENTITY;
import static ca.sharcnet.dh.scriber.Constants.HTML_NONENTITY;
import static ca.sharcnet.dh.scriber.Constants.HTML_PROLOG;
import static ca.sharcnet.dh.scriber.Constants.ORG_TAGNAME;
import static ca.sharcnet.dh.scriber.Constants.XML_ATTR_LIST;
import ca.sharcnet.dh.scriber.context.TagInfo;
import ca.sharcnet.dh.scriber.encoder.ServiceModuleBase;
import ca.sharcnet.docnav.DocNavException;
import ca.sharcnet.nerve.docnav.dom.DoctypeNode;
import ca.sharcnet.nerve.docnav.dom.InstructionNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.query.Query;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Collections;
import javax.xml.parsers.ParserConfigurationException;
import org.json.JSONObject;

/**
 *
 * @author edward
 */
public class EncoderXML extends ServiceModuleBase {

    @Override
    public void run() throws IOException, ClassNotFoundException, InstantiationException, IllegalAccessException, SQLException, ParserConfigurationException {
        Query xmltag = document.queryf(".%s, .%s", HTML_NONENTITY, HTML_ENTITY);
        Collections.reverse(xmltag);

        for (Node node : xmltag) {
            JSONObject json = new JSONObject(node.attr(XML_ATTR_LIST));

            /* change html tag name to xml tag name, which is stored in ORG_TAGNAME attribute */
            switch (node.attr("class")) {
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
                    if (key.equals(Constants.DICT_SRC_ATTR)) {
                        continue;
                    }
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
    }
}