/* global Utility */

if (typeof nodeTypeEnum === "undefined") {
    var nodeTypeEnum = {
        element: 1,
        attribute: 2,
        text: 3,
        cdata: 4,
        reference: 5,
        entity: 6,
        instruction: 7,
        comment: 8,
        document: 9,
        doctype: 10,
        docfrag: 11,
        notation: 12
    };
}

class Encoder {
    constructor(context) {
        Utility.log(Encoder, "constructor");
        Utility.enforceTypes(arguments, Context);
        this.context = context;
    }
    encode(source) {
        Utility.log(Encoder, "encode");
        Utility.enforceTypes(arguments, String);

        this.xmlDoc = new DOMParser().parseFromString("<xml>" + source + "</xml>", "text/xml");
        this.htmlDoc = document.createElement("div");

        this.__prefixAllNodes(this.xmlDoc.children[0], this.htmlDoc);
        return this.htmlDoc;
    }
    __prefixAllNodes(xmlElement, htmlElement) {
        for (let node of xmlElement.childNodes) {
            if (node.nodeType === nodeTypeEnum.element) {
                if (this.context.isTagName(node.tagName)) {
                    let newHTMLNode = this.__wrapTaggedEntity(node);
                    htmlElement.appendChild(newHTMLNode);
                } else {
                    let newHTMLNode = this.__prefixNode(node);
                    this.__prefixAttributes(node, newHTMLNode);
                    this.__prefixAllNodes(node, newHTMLNode);
                    htmlElement.appendChild(newHTMLNode);
                }
            } else if (node.nodeType === nodeTypeEnum.text) {
                let newHTMLNode = document.createTextNode(node.textContent);
                htmlElement.appendChild(newHTMLNode);
            }
        }
    }
    __prefixNode(node) {
        let prefix = this.context.getTagNameRule("prefix");
        let newNode = document.createElement(prefix + node.nodeName);
        newNode.setAttribute(prefix, node.tagName);
        return newNode;
    }
    __prefixAttributes(source, destination) {
        let sourceAttributes = source.attributes;
        let prefix = this.context.getTagNameRule("attribute");

        for (let attribute of sourceAttributes) {
            destination.setAttribute(prefix + attribute.name, attribute.name);
            destination.setAttribute(attribute.name, attribute.value);
        }
    }
    __wrapTaggedEntity(node) {
        let taggedLabel = this.context.getHTMLLabel("tagged");
        let entityLabel = this.context.getHTMLLabel("entity");
        let tagNameLabel = this.context.getHTMLLabel("tagName");
        let lemmaLabel = this.context.getHTMLLabel("lemma");
        let linkLabel = this.context.getHTMLLabel("taglink");

        let taggedNode = document.createElement(taggedLabel);
        let entityNode = document.createElement(entityLabel);
        let tagNameNode = document.createElement(tagNameLabel);
        let lemmaNode = document.createElement(lemmaLabel);
        let linkNode = document.createElement(linkLabel);

        let linkAttribute = this.context.getLinkAttribute(node.tagName);
        let lemmaAttribute = this.context.getLemmaAttribute(node.tagName);

        if (node.hasAttribute(lemmaAttribute)) lemmaNode.innerHTML = node.getAttribute(lemmaAttribute);
        if (node.hasAttribute(linkAttribute)) linkNode.innerHTML = node.getAttribute(linkAttribute);
        tagNameNode.innerHTML = node.tagName;

        this.__prefixAllNodes(node, entityNode);

        taggedNode.appendChild(entityNode);
        taggedNode.appendChild(tagNameNode);
        taggedNode.appendChild(lemmaNode);
        taggedNode.appendChild(linkNode);

        return taggedNode;
    }
}