package ca.sharcnet.nerve.scriber.encoder.servicemodules;

import ca.sharcnet.nerve.scriber.context.TagInfo;
import ca.sharcnet.nerve.scriber.encoder.IClassifier;
import ca.sharcnet.nerve.scriber.encoder.ServiceModuleBase;
import ca.sharcnet.nerve.scriber.encoder.UnsetClassifierException;
import ca.sharcnet.nerve.scriber.encoder.UnsetContextException;
import ca.sharcnet.nerve.scriber.encoder.UnsetSchemaException;
import ca.sharcnet.nerve.scriber.query.Query;
import java.io.IOException;
import java.util.ArrayList;
import java.util.logging.Level;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

/**
 * Add entity tags to a document using NLP entity recognition. Entities will not
 * be added inside of already tagged entities, nor will they be added where they
 * will violate the document schema.
 *
 * @author Ed Armstrong
 */
public class EncoderNER extends ServiceModuleBase {
    final static Logger LOGGER = LogManager.getLogger(EncoderNER.class);
    private final IClassifier classifier;

    private static String oneLine(String s) {
        return s.replaceAll("\n", "[nl]").replaceAll("\t", "[T]");
    }

    /**
     * Public constructor.
     *
     * @param classifier classifier to use, not null.
     */
    public EncoderNER(IClassifier classifier) {
        if (classifier == null) throw new UnsetClassifierException();
        this.classifier = classifier;
    }

    @Override
    public void run() throws IOException {        
        try {
            Query root = this.query.select(":root");
            this.step(root);
        } catch (SAXException | ParserConfigurationException ex) {
            java.util.logging.Logger.getLogger(EncoderNER.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    private void step(Query current) throws IOException, SAXException, ParserConfigurationException {
        if (this.context.isTagName(current.tagName())) return;        
        
        for (Query q : current.children(null).split()) {
            switch (q.nodeType()) {
                case Node.ELEMENT_NODE:
                    step(q);
                    break;
                case Node.TEXT_NODE:
                    classify(q);
                    break;
            }
        };
    }

    private void classify(Query node) throws IOException, SAXException, ParserConfigurationException {
        LOGGER.trace("classify: '" + oneLine(node.text()) + "'");
        if (node.text().trim().isEmpty()) return;        
        Query nerList = applyNamedEntityRecognizer(node.text());
        if (nerList == null) return;
        
        /* for each element node in the list ensure the path is valid, if not convert it to a text node */
        for (Query nerNode : nerList.split()) {
            if (nerNode.nodeType() != Node.ELEMENT_NODE) {
                LOGGER.trace("skipping plain text: " + oneLine(node.text()));
                continue;
            }

            /* change the node name from standard to schema */
            TagInfo tagInfo = context.getTagInfo(nerNode.tagName());
            String schemaName = tagInfo.getName();
            LOGGER.trace("update node name: " + nerNode.tagName() + " -> " + schemaName);
            nerNode.tagName(schemaName);

            if (!schema.isValid(node.parent().get(0), nerNode.tagName())) {
                /* if the node isn't valid in the schema, remove markup */
                LOGGER.trace(String.format("node isn't valid in the schema, removing markup from '%s'", nerNode.toString()));
                Query textNode = this.query.newText(nerNode.text());
                nerList.set(nerList.indexOf(nerNode.get(0)), textNode.get(0));
            } else {
                /* if it is valid, set default lemma */
                LOGGER.trace("entity identitified: " + nerNode.tagName() + ":" + nerNode.text().replaceAll("\n[\n \t]*", "[nl]").replaceAll("\t", "[T]"));
                nerNode.attribute(tagInfo.getLemmaAttribute(), nerNode.text());
                this.setDefaultAttributes(nerNode);
            }
        }

        /* replace the current node with the node list */
        if (nerList.size() > 0) {
            node.replaceWith(nerList);
        }
    }

    /**
     * Classify provided text. Returns a list of nodes which may be either text
     * nodes (no entity found), or an element node (entity found).
     *
     * @param text
     * @return list of nodes
     * @throws IOException
     * @throws DocumentParseException
     */
    private Query applyNamedEntityRecognizer(String text) throws IOException, SAXException, ParserConfigurationException {
        LOGGER.trace("applyNamedEntityRecognizer: '" + oneLine(text) + "'");
        
        /* at least one alphabet character upper or lower case */
        String matchRegex = "([^a-zA-z]*[a-zA-z]+[^a-zA-z]*)+";

        /* if there is not at least one alphabet character, return an empty list */
        if (text == null || text.isEmpty() || !text.matches(matchRegex)) {
            LOGGER.trace("invalid text, short-circuit return");
            return null;
        }

        /* classify the text and put it in a fragment tag */
        String classified = this.classifier.classify(Query.escape(text));  
        LOGGER.trace("classified text: '" + oneLine(classified) + "'");

        /* create a document out of the text */
        Query newElement = this.query.newElement("<fragment>" + classified + "</fragment>");
        
        LOGGER.trace(String.format("new element: " + newElement.toString()));
        
        for (Node x : newElement.children(null)){
            LOGGER.debug(x.getNodeName() + " " + x.getNodeValue());
        }
        
        return newElement.children(null);
    }
}