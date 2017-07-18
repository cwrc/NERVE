//package ca.sharcnet.nerve.docnav.selector;
//import ca.sharcnet.nerve.docnav.dom.Node;
//import ca.sharcnet.nerve.docnav.dom.NodeList;
//import ca.sharcnet.nerve.docnav.dom.NodeType;
//import static ca.sharcnet.nerve.docnav.dom.NodeType.*;
//import java.util.Collection;
//
//public class Select extends NodeList {
//    private final NodeList allNodes;
//
//    /**
//    Create a new Select object from an element node and all it's children recursively.
//    @param ele
//    */
//    public Select(Node ele) {
//        super();
//        allNodes = new NodeList();
//        addElement(ele);
//    }
//
//    public Select(Collection<? extends Node> list) {
//        super();
//        allNodes = new NodeList();
//        for (Node node : list) {
//            if (node.isType(NodeType.ELEMENT)){
//                allNodes.add((Node)node);
//            }
//        }
//    }
//
//
//    public void reset(){
//        this.clear();
//        this.all();
//    }
//
//    private void addElement(Node node) {
//        if (node.isType(ELEMENT)) allNodes.add((Node)node);
//        if (!node.isType(ELEMENT, DOCUMENT)) return;
//        for (Node child : ((Node)node).childNodes()) {
//            this.addElement(child);
//        }
//    }
//
//    public Select all() {
//        this.clear();
//        this.add(allNodes);
//        return this;
//    }
//
//    /**
//    Add the elements in 'eNodes' to this selection if they are child nodes
//    of the source element.
//    @param eNodes
//    @return
//     */
//    public Select elements(Node... eNodes) {
//        for (Node eNode : eNodes) {
//            if (allNodes.contains(eNode) && !this.contains(eNode)) {
//                this.add(eNode);
//            }
//        }
//        return this;
//    }
//
//    /**
//    Add the elements that match the names in 'names' to the selection.
//    @param eNodes
//    @return
//     */
//    public Select name(String... names) {
//        for (Node node : allNodes) {
//            for (String name : names) {
//                if (node.getName().equals(name) && !this.contains(node)) {
//                    this.add(node);
//                }
//            }
//        }
//        return this;
//    }
//
//    /**
//    Add the elements that contain the attribute 'key' to the selection.
//    @param eNodes
//    @return
//     */
//    public Select attribute(String key) {
//        for (Node node : allNodes) {
//            if (node.isType(ELEMENT, INSTRUCTION)) {
//                if (node.hasAttribute(key) && !this.contains(node)) {
//                    this.add(node);
//                }
//            }
//        }
//        return this;
//    }
//
//    /**
//    Add the elements that contain the attribute 'key' with value equal to
//    'value' to the selection.
//    @param eNodes
//    @return
//     */
//    public Select attribute(String key, Object value) {
//        for (Node node : allNodes) {
//            if (node.isType(ELEMENT, INSTRUCTION)) {
//                if (node.hasAttribute(key) && node.hasAttribute(key, value) && !this.contains(node)) {
//                    this.add(node);
//                }
//            }
//        }
//        return this;
//    }
//}
