//package ca.sharcnet.nerve.scriber.encoder.servicemodules;
//import ca.sharcnet.nerve.scriber.context.TagInfo;
//import ca.sharcnet.nerve.scriber.encoder.IClassifier;
//import ca.sharcnet.nerve.scriber.encoder.ServiceModuleBase;
//import ca.sharcnet.nerve.scriber.encoder.UnsetClassifierException;
//import ca.sharcnet.nerve.scriber.encoder.UnsetContextException;
//import ca.sharcnet.nerve.scriber.encoder.UnsetSchemaException;
//import ca.sharcnet.nerve.scriber.query.Query;
//import java.io.IOException;
//import java.util.ArrayList;
//import org.apache.logging.log4j.LogManager;
//import org.apache.logging.log4j.Logger;
//import org.w3c.dom.Node;
//
///**
// * Add entity tags to a document using NLP entity recognition. Entities will not
// * be added inside of already tagged entities, nor will they be added where they
// * will violate the document schema.
// * @author Ed Armstrong
// */
//public class EncoderNER extends ServiceModuleBase {
//    final static Logger LOGGER = LogManager.getLogger(EncoderNER.class);
//    private final IClassifier classifier;
//
//    /**
//     * Public constructor.
//     * @param classifier classifier to use, not null.
//     */
//    public EncoderNER(IClassifier classifier){
//        if (classifier == null) throw new UnsetClassifierException();
//        this.classifier = classifier;
//    }
//    
//    /**
//     * Entry point to begin processing document.
//     * @throws IOException
//     * @throws ca.sharcnet.nerve.docnav.DocumentParseException
//     */
//    @Override
//    public void run() throws IOException {
//        LOGGER.trace("EncoderNER.run()");        
//        if (schema == null) throw new UnsetSchemaException();
//        if (context == null) throw new UnsetContextException();
//        
//        Query textNodes = this.getQuery().allChildren(n->{
//            return n.getNodeType() == Node.TEXT_NODE;
//        });       
//        
//        for (Node node : textNodes) {
//            if (node.getTextContent().trim().isEmpty()) {
//                continue;
//            }
//            
//            LOGGER.debug("considering: '" + node.getTextContent().replaceAll("\n", "[nl]").replaceAll("\t", "[T]") + "'");
//
//            /* skip nodes that are already tagged */
//            this.getQuery().select(node).ancestors();  
//
//            NodeList nerList = applyNamedEntityRecognizer(node.getTextContents());
//            LOGGER.debug(nerList.size() + " nodes returned by classifier.");
//            
//            /* for each element node in the list ensure the path is valid, if not convert it to a text node */
//            for (int i = 0; i < nerList.size(); i++) {
//                Node nerNode = nerList.get(i);
//                if (!nerNode.isType(NodeType.ELEMENT)) {
//                    LOGGER.debug("skipping plain text: " + nerNode.text().replaceAll("\n[\n \t]*", "[nl]").replaceAll("\t", "[T]"));
//                    continue;
//                }
//
//                /* change the node name from standard to schema */
//                TagInfo tagInfo = context.getTagInfo(nerNode.name());
//                String schemaName = tagInfo.getName();
//                LOGGER.debug("update node name: " + nerNode.name() + " -> " + schemaName);
//                nerNode.name(schemaName);                
//                
//                LOGGER.debug("ancestors: " + nerNode.name() + "," + node.ancestorNodes().toString(n->n.name(), ","));                
//                if (!schema.isValid(node.getParent(), nerNode.name())) {
//                    /* if the node isn't valid in the schema, remove markup */
//                    LOGGER.debug("node isn't valid in the schema, removing markup");
//                    TextNode textNode = new TextNode(nerNode.text());
//                    nerList.set(i, textNode);
//                } else {
//                    /* if it is valid, set default lemma */
//                    LOGGER.debug("entity identitified: " + nerNode.name() + ":" + nerNode.text().replaceAll("\n[\n \t]*", "[nl]").replaceAll("\t", "[T]"));
//                    nerNode.attr(tagInfo.getLemmaAttribute(), nerNode.text());
//                    this.setDefaultAttributes(nerNode);
//                }
//            }
//
//            /* replace the current node with the node list */
//            if (nerList.size() > 0) {
//                node.replaceWith(nerList);
//            }
//            LOGGER.debug("----- ----- ----- ----- ----- ----- ----- ----- ");
//        };
//    }
//    
//    /**
//     * Classify provided text.  Returns a list of nodes which may be either
//     * text nodes (no entity found), or an element node (entity found).
//     * @param text
//     * @return list of nodes
//     * @throws IOException
//     * @throws DocumentParseException 
//     */
//    private ArrayList applyNamedEntityRecognizer(String text) throws IOException  {
//        /* at least one alphabet character upper or lower case */
//        String matchRegex = "([^a-zA-z]*[a-zA-z]+[^a-zA-z]*)+";
//
//        /* if there is not at least one alphabet character, return an empty list */
//        if (text == null || text.isEmpty() || !text.matches(matchRegex)) {
//            LOGGER.debug("invalid text, short-circuit return");
//            return new ArrayList<Node>();
//        }
//
//        /* classify the text and put it in a fragment tag */
//        String classifiedText = classifier.classify("<fragment>" + text + "</fragment>");
//        LOGGER.debug("classified text: " + classifiedText.replaceAll("\n", "[nl]").replaceAll("\t", "[T]"));
//
//        /* create a document out of the text */
//        Document localDoc = DocumentLoader.documentFromString(classifiedText);
//        Node eNode = localDoc.childNodes().get(0);
//        NodeList childNodes = eNode.childNodes();
//        LOGGER.debug("new nodes: " + childNodes.toString(n->n.name(), ", "));
//        return childNodes;
//    }
//}
