package ca.sharcnet.nerve.docnav.dom;

interface HasChildNodes {
    NodeList<? extends Node> childNodes();
    void setChildNodes(NodeList<? extends Node> childNodes);


}
