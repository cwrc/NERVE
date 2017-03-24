/* global Utility, HTMLElement, Context, TaggedEntity */

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

class Decoder {
    constructor(context) {
        Utility.log(Decoder, "constructor");
        Utility.enforceTypes(arguments, Context);

        this.context = context;
    }
    decode(source) {
        Utility.log(Decoder, "decode");
        Utility.enforceTypes(arguments, String);
        let xmlDoc = new DOMParser().parseFromString("<xml>" + source + "</xml>", "text/xml");
        this.__unwrapTaggedEntities(xmlDoc, xmlDoc);
        this.__unprefixAllTags(xmlDoc, xmlDoc);
//        this.__uncommentMeta();

        let resultString = new XMLSerializer().serializeToString(xmlDoc);
        resultString = resultString.substring(5, resultString.length - 6);
        return resultString;
    }

    __unwrapTaggedEntities(xmlDoc, element) {
        Utility.log(Decoder, "__unwrapTaggedEntities");
        Utility.enforceTypes(arguments, Object, Object);

        let taggedLabel = this.context.getHTMLLabel("tagged");
        let childNodes = element.childNodes;

        for (let node of childNodes) {
            if (node.nodeType !== nodeTypeEnum.element) continue;
            if (node.nodeName === taggedLabel) {
                let decodedNode = this.__unwrapNode(xmlDoc, node, this.context);
                node.parentNode.replaceChild(decodedNode, node);
            } else {
                this.__unwrapTaggedEntities(xmlDoc, node);
            }
        }
    }

    __unwrapNode(xmlDoc, element, context) {
        Utility.enforceTypes(arguments, XMLDocument, Element, Context);

        let entity = element.getElementsByTagName(context.getHTMLLabel("entity"))[0];
        entity = entity.cloneNode(true);

        let tagName = element.getElementsByTagName(context.getHTMLLabel("tagName"));
        tagName = tagName[0].textContent;

        let tagLink = element.getElementsByTagName(context.getHTMLLabel("taglink"))[0];
        let lemma = element.getElementsByTagName(context.getHTMLLabel("lemma"))[0];

        let newElement = xmlDoc.createElement(tagName);
        newElement.innerHTML = entity.innerHTML;

        let linkAttr = context.getLinkAttribute(tagName);
        let lemmaAttr = context.getLemmaAttribute(tagName);

        if (typeof tagLink !== "undefined" && linkAttr !== "") newElement.setAttribute(linkAttr, tagLink.textContent);
        if (typeof lemma !== "undefined" && lemmaAttr !== "") newElement.setAttribute(lemmaAttr, lemma.textContent);

        return newElement;
    }

    __unprefixAllTags(xmlDoc, element) {
        for (let node of element.childNodes) {
            if (node.nodeType === nodeTypeEnum.element) {
                this.__unprefixAllTags(xmlDoc, node);
                this.__unprefixTag(xmlDoc, node);
            }
        }
    }

    __unprefixTag(xmlDoc, element) {
        let tagName = element.tagName;
        let prefix = this.context.getTagNameRule("prefix");
        if (tagName.startsWith(prefix)) {
            let newTagName = tagName.substring(prefix.length, tagName.length);
            let newElement = xmlDoc.createElement(newTagName);
            newElement.innerHTML = element.innerHTML;
            element.parentNode.replaceChild(newElement, element);
            this.__unprefixAttributes(element, newElement);
        }
    }
    __unprefixAttributes(sourceElement, destElement) {
        let sourceAttributes = sourceElement.attributes;
        let prefix = this.context.getTagNameRule("attribute")

        for (let attribute of sourceAttributes) {
            if (attribute.name.startsWith(prefix)) {
                let newAttrName = attribute.value;
                let newAttrValue = sourceElement.getAttribute(newAttrName.toLowerCase());
                destElement.setAttribute(newAttrName, newAttrValue);
            }
        }
    }
    __uncommentMeta() {
    }
}