/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.dh.scriber.encoder;

import ca.sharcnet.dh.scriber.context.TagInfo;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.DocumentParseException;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.dom.TextNode;
import ca.sharcnet.nerve.docnav.query.Query;
import edu.stanford.nlp.ie.crf.CRFClassifier;
import edu.stanford.nlp.ling.CoreLabel;
import java.io.IOException;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class EncoderNER extends EncoderBase {
    final static Logger LOGGER = LogManager.getLogger(EncoderNER.class);
    private CRFClassifier<CoreLabel> classifier;

    public EncoderNER(CRFClassifier<CoreLabel> classifier){
        this.classifier = classifier;
    }
    
    /**
     * Process document.
     * @throws IOException
     */
    public void run() throws IOException, DocumentParseException {
        LOGGER.log(Level.DEBUG, "EncoderNER.run()");        
        if (schema == null) throw new UnsetSchemaException();
        if (context == null) throw new UnsetContextException();
        if (classifier == null) throw new UnsetClassifierException();
                
        Query textNodes = this.document.query(NodeType.TEXT);        
        
        for (Node node : textNodes) {
            if (node.text().trim().isEmpty()) {
                continue;
            }
            
            LOGGER.log(Level.DEBUG, "---------------------------------------------------------------------------");
            LOGGER.log(Level.DEBUG, "considering: '" + node.text().replaceAll("\n", "[nl]").replaceAll("\t", "[T]") + "'");

            /* skip nodes that are already tagged */
            NodeList ancestorNodes = node.ancestorNodes(NodeType.ELEMENT);
            if (ancestorNodes.testAny(nd -> context.isTagName(nd.name()))) {
                LOGGER.log(Level.DEBUG, "skipping <" + node.name() + "> has tagged ancestor");
                continue;
            }

            NodeList nerList = applyNamedEntityRecognizer(node.text());

            /* for each element node in the list ensure the path is valid, otherwise convert it to a text node */
            for (int i = 0; i < nerList.size(); i++) {
                Node nerNode = nerList.get(i);
                if (!nerNode.isType(NodeType.ELEMENT)) {
                    continue;
                }

                /* change the node name from standard to schema */
                TagInfo tagInfo = context.getTagInfo(nerNode.name());
                String schemaName = tagInfo.getName();
                LOGGER.log(Level.DEBUG, "update node name: " + nerNode.name() + " -> " + schemaName);
                nerNode.name(schemaName);                
                
                LOGGER.log(Level.DEBUG, "ancestors: " + nerNode.name() + "," + node.ancestorNodes().toString(n->n.name(), ","));
                
                if (!schema.isValid(node.getParent(), nerNode.name())) {
                    /* if the node isn't valid in the schema, remove markup */
                    LOGGER.log(Level.DEBUG, "node isn't valid in the schema, remove markup");
                    TextNode textNode = new TextNode(nerNode.text());
                    nerList.set(i, textNode);
                } else {
                    /* if it is valid, set default lemma */
                    LOGGER.log(Level.INFO, "entity identitified: " + nerNode.name() + ":" + nerNode.text().replaceAll("\n[\n \t]*", "[nl]").replaceAll("\t", "[T]"));
                    nerNode.attr(tagInfo.getLemmaAttribute(), nerNode.text());
                }
            }

            /* replace the current node with the node list */
            if (nerList.size() > 0) {
                node.replaceWith(nerList);
            }
        };
    }

    private NodeList applyNamedEntityRecognizer(String text) throws IOException, DocumentParseException  {
        /* at least one alphabet character upper or lower case */
        String matchRegex = "([^a-zA-z]*[a-zA-z]+[^a-zA-z]*)+";

        /* if there is not at least one alphabet character, retuern an empty list */
        if (text == null || text.isEmpty() || !text.matches(matchRegex)) {
            LOGGER.log(Level.DEBUG, "invalid text, short-circuit return");
            return new NodeList();
        }

        /* classify the text and put it in a fragment tag */
        String classifiedText = classifier.classifyWithInlineXML("<fragment>" + text + "</fragment>");
        LOGGER.log(Level.DEBUG, "classified text: " + classifiedText.replaceAll("\n", "[nl]").replaceAll("\t", "[T]"));
        if (classifiedText.isEmpty()) {
            return new NodeList();
        }

        /* create a document out of the text */
        Document localDoc = DocumentLoader.documentFromString(classifiedText);
        Node eNode = localDoc.childNodes().get(0);
        NodeList childNodes = eNode.childNodes();
        LOGGER.log(Level.DEBUG, "new nodes: " + childNodes.toString(n->n.name(), ", "));
        return childNodes;
    }

    public void setClassifier(CRFClassifier<CoreLabel> classifier) {
        this.classifier = classifier;
    }
}
