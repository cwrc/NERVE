/* global Utility, trace, HTMLElement */

notEmptyEquals = function (s1, s2) {
    if (s1 === "")
        return false;
    if (s2 === "")
        return false;
    return (s1 === s2);
};

class TaggedEntity {
    constructor(factory, element, hasContext, events) {
        TaggedEntity.traceLevel = 0;
        Utility.log(TaggedEntity, "constructor");

        /* set factory to during construction of unbound tagged entity for testing */
        if (factory === null) return;
        Utility.enforceTypes(arguments, TaggedEntityFactory, HTMLElement, HasContext, Events);

        this.hasContext = hasContext;
        this.factory = factory;
        this.element = element;
        element.addEventListener('click', event => events.taggedEntityClick(event, this), false);
        element.addEventListener('dblclick', event => events.taggedEntityDoubleClick(event, this), false);
        this.markupUnselect();
        this.factory.add(this);
        $(element).data("entityObject", this);

        $(element).draggable({
            helper: 'clone',
            appendTo: 'body',
            stop: (event, ui)=>{
                let targets = document.elementsFromPoint(event.clientX, event.clientY);
                for (let ele of targets){
                    if (ele.tagName === "TAGGED" && typeof $(ele).data("entityObject") !== "undefined"){
                        let entityObject = $(ele).data("entityObject");
                        console.log(this);
                        console.log(ele);
                        events.copyData(this, entityObject);
                        break;
                    }
                }
            },
        });
    }
    __getContext() {
        Utility.enforceTypes(arguments);
        return Utility.assertType(this.hasContext.getContext(), Context);
    }
    /**
     * Returns a clone of the encapsulated element.
     * @returns {unresolved}
     */
    cloneElement() {
        Utility.log(TaggedEntity, "cloneElement");
        Utility.enforceTypes(arguments);
        return this.element.clone(true);
    }
    deconstruct() {
        Utility.log(TaggedEntity, "deconstruct");
        Utility.enforceTypes(arguments);

        this.factory.remove(this);
        return TaggedEntity.deconstruct(this.element, this.__getContext());
    }
    markupSelect() {
        Utility.log(TaggedEntity, "markupSelect");
        Utility.enforceTypes(arguments);

        this.element.className = "selected";
    }
    markupUnselect() {
        Utility.log(TaggedEntity, "markupUnselect");
        Utility.enforceTypes(arguments);

        if (this.getLink() === "") this.element.className = "notLinked";
        else this.element.className = "notSelected";
    }
    setEntity(value) {
        Utility.log(TaggedEntity, "setEntity");
        Utility.verifyArguments(arguments, 1);

        this.setProperty(value, "entity");
    }
    setTagName(value) {
        Utility.log(TaggedEntity, "setTagName");
        Utility.verifyArguments(arguments, 1);

        this.setProperty(value, "tagName");
    }
    setLemma(value) {
        Utility.log(TaggedEntity, "setLemma");
        Utility.verifyArguments(arguments, 1);

        this.setProperty(value, "lemma");
    }
    setLink(value) {
        Utility.log(TaggedEntity, "setLink");
        Utility.verifyArguments(arguments, 1);

        this.setProperty(value, "taglink");
    }
    /*
     * Retrieve the innerText of the HTMLElement containing the entity;
     * @returns {TaggedEntity.getProperty.element@call;getElementsByTagName.innerHTML|String}
     */
    getEntity() {
        Utility.log(TaggedEntity, "getEntity");
        Utility.enforceTypes(arguments);
        return this.getProperty("entity");
    }
    getTagName() {
        Utility.log(TaggedEntity, "getTagName");
        Utility.enforceTypes(arguments);

        return this.getProperty("tagName");
    }
    getLemma() {
        Utility.log(TaggedEntity, "getLemma");
        Utility.enforceTypes(arguments);

        return this.getProperty("lemma");
    }
    getLink() {
        Utility.log(TaggedEntity, "getLink");
        Utility.enforceTypes(arguments);

        return this.getProperty("taglink");
    }
    /* wrapper for 'set' methods */
    setProperty(value, property) {
        Utility.log(TaggedEntity, "setProperty");
        Utility.verifyArguments(arguments, 2);

        var elements = this.element.getElementsByTagName(this.__getContext().getHTMLLabel(property));
        var element;
        if (elements.length === 0) {
            element = document.createElement(this.__getContext().getHTMLLabel(property));
            this.element.appendChild(element);
        } else {
            element = elements[0];
        }

        element.innerHTML = value;
    }
    /* wrapper for 'get' methods */
    getProperty(property) {
        Utility.log(TaggedEntity, "getProperty");
        Utility.verifyArguments(arguments, 1);

        var elements = this.element.getElementsByTagName(this.__getContext().getHTMLLabel(property));
        if (elements.length === 0) {
            return "";
        } else {
            return elements[0].innerText;
        }
    }
    hasDictionary() {
        Utility.log(TaggedEntity, "hasDictionary");
        Utility.enforceTypes(arguments);

        return this.element.hasAttribute(this.__getContext().getDictionaryAttribute());
    }
    getDictionary() {
        Utility.log(TaggedEntity, "getDictionary");
        Utility.enforceTypes(arguments);

        return this.element.getAttribute(this.__getContext().getDictionaryAttribute());
    }
    setDictionary(dictionary) {
        Utility.log(TaggedEntity, "setDictionary");
        Utility.enforceTypes(arguments, String);
        $(this.element).data("dictionary", dictionary);
    }
    setIdentifier(identifier) {
        Utility.log(TaggedEntity, "setIdentifier");
        Utility.enforceTypes(arguments, String);

        var elements = this.element.getElementsByTagName(this.__getContext().getHTMLLabel("entity"));
        if (elements.length === 0) return;
        var element = elements[0];
        var idAttribute = this.__getContext().getIDAttribute();
        var prefix = this.__getContext().getAttributePrefix();
        element.setAttribute(idAttribute, identifier);
        element.setAttribute(prefix + idAttribute, idAttribute);
    }
    getIdentifier() {
        Utility.log(TaggedEntity, "getIdentifier");
        Utility.enforceTypes(arguments);

        var elements = this.element.getElementsByTagName(this.__getContext().getHTMLLabel("entity"));
        if (elements.length === 0) return "";
        var element = elements[0];
        var idAttribute = this.__getContext().getIDAttribute();
        return element.getAttribute(idAttribute);
    }
    elementSharesParent(taggedEntity) {
        Utility.log(TaggedEntity, "elementSharesParent");
        Utility.enforceTypes(arguments, TaggedEntity);

        return (this.element.parentNode === taggedEntity.element.parentNode);
    }
}

TaggedEntity.deconstruct = function (element, context) {
    Utility.enforceTypes(arguments, HTMLElement, Context);

    var parent = element.parentNode;
    var entity = element.getElementsByTagName(context.getHTMLLabel("entity"))[0];

    let start = null;
    let end = null;

    /* remove all child nodes from entity and add them to the parent node */
    while (entity.firstChild) {
        let insertedNode = parent.insertBefore(entity.firstChild, element);
        if (start === null) start = insertedNode;
        end = insertedNode;
    }

    let range = new Range();
    range.setStartBefore(start);
    range.setEndAfter(end);
    parent.removeChild(element);

    return range;
};

/* create a new decoded element from element */
/* does not unprefix */
TaggedEntity.decode = function (element, context) {
    Utility.enforceTypes(arguments, Element, Context);

    console.log(element);

    let entity = element.getElementsByTagName(context.getHTMLLabel("entity"))[0];
    entity = entity.cloneNode(true);

    let tagName = element.getElementsByTagName(context.getHTMLLabel("tagName"));
    tagName = tagName[0].textContent;

    let tagLink = element.getElementsByTagName(context.getHTMLLabel("taglink"))[0];
    let lemma = element.getElementsByTagName(context.getHTMLLabel("lemma"))[0];

    let newElement = document.createElement(tagName);
    newElement.innerHTML = entity.innerHTML;

    if (typeof tagLink !== "undefined") newElement.setAttribute(context.getLinkAttribute(tagName), tagLink.innerText);
    if (typeof lemma !== "undefined") newElement.setAttribute(context.getLemmaAttribute(tagName), lemma.innerText);

    return newElement;
};

class TaggedEntityFactory extends Collection {
    constructor() {
        super();
        TaggedEntityFactory.traceLevel = 0;
        Utility.log(TaggedEntityFactory, "constructor");
        Utility.enforceTypes(arguments);
    }
    /**
     * Add all "tagged" elements from the passed in htmlELement.
     * @param {type} htmlElement
     * @returns {undefined}
     */
    addElementTree(htmlElement) {
        Utility.log(TaggedEntityFactory, "addElementTree");
        Utility.enforceTypes(arguments, HTMLElement);

        var taggedElements = htmlElement.getElementsByTagName("tagged");
        for (var i = 0; i < taggedElements.length; i++) {
            this.fromValidElement(taggedElements[i]);
        }
    }
    __getContext() {
        Utility.enforceTypes(arguments);
        return Utility.assertType(this.hasContext.getContext(), Context);
    }
    getEntityByID(identifier) {
        Utility.log(TaggedEntityFactory, "getEntityByID");
        Utility.enforceTypes(arguments, String);

        this.forEach(entity => {
            if (entity.getIdentifier() === identifier) {
                return entity;
            }
        });

        return null; /* TODO don't return null */
    }
    setContextSource(hasContext) {
        Utility.log(TaggedEntityFactory, "setContextSource");
        Utility.enforceTypes(arguments, HasContext);
        this.hasContext = hasContext;
    }
    setEventHandler(events) {
        Utility.log(TaggedEntityFactory, "setEventHandler");
        Utility.enforceTypes(arguments, Events);
        this.events = events;
    }
    fromValidElement(element) {
        Utility.log(TaggedEntityFactory, "fromValidElement");
        Utility.enforceTypes(arguments, HTMLElement);

        return new TaggedEntity(this, element, this.hasContext, this.events);
    }
    __getUnusedIdentifier(identifier = - 1) {
        Utility.log(TaggedEntityFactory, "__getUnusedIdentifier");
        Utility.enforceTypes(arguments, ["optional", Number]);

        if (identifier === -1) {
            identifier = Math.random() * 100000;
            identifier = Math.floor(identifier);
        }

        while (this.__hasIdentifer(identifier)) {
            identifier = Math.random() * 100000;
            identifier = Math.floor(identifier);
        }

        return identifier;
    }
    __hasIdentifer(identifier) {
        Utility.log(TaggedEntityFactory, "__hasIdentifer");
        Utility.enforceTypes(arguments, Number);

        this.forEach(taggedEntity => {
            if (taggedEntity.getIdentifier() === "NV" + identifier) {
                return true;
            }
        });

        return false;
    }
    /**
     * Create a new tagged element from an element, disposing of the previous
     * outer tags.
     * @param {type} element
     * @param {type} tagName
     * @returns {Boolean}
     */
    constructFromElement(element, tagName, identifier = - 1) {
        Utility.log(TaggedEntityFactory, "constructFromElement");
        Utility.enforceTypes(arguments, HTMLElement, String, ["optional", Number]);

        var taggedElement = document.createElement(this.__getContext().getHTMLLabel("tagged"));
        var tagNameElement = document.createElement(this.__getContext().getHTMLLabel("tagName"));
        var lemmaElement = document.createElement(this.__getContext().getHTMLLabel("lemma"));
        var entityElement = document.createElement(this.__getContext().getHTMLLabel("entity"));

        tagNameElement.innerHTML = tagName;

        for (let child of element.childNodes) {
            entityElement.appendChild(child.cloneNode());
        }

        taggedElement.appendChild(entityElement);
        taggedElement.appendChild(tagNameElement);
        taggedElement.appendChild(lemmaElement);

        element.parentNode.replaceChild(taggedElement, element);
        let taggedEntity = new TaggedEntity(this, taggedElement, this.hasContext, this.events);
        identifier = this.__getUnusedIdentifier(identifier);
        taggedEntity.setIdentifier("NV" + identifier);
        return taggedEntity;
    }
    constructFromRange(range, tagName, identifier = - 1) {
        Utility.log(TaggedEntityFactory, "constructFromRange");
        Utility.enforceTypes(arguments, Range, String, ["optional", Number]);

        if (!this.__validifyTagRange(range)) {
            return false;
        }

        range = this.__trimRange(range);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);

        var taggedElement = document.createElement(this.__getContext().getHTMLLabel("tagged"));
        var tagNameElement = document.createElement(this.__getContext().getHTMLLabel("tagName"));
        var lemmaElement = document.createElement(this.__getContext().getHTMLLabel("lemma"));
        var entityElement = document.createElement(this.__getContext().getHTMLLabel("entity"));

        tagNameElement.innerHTML = tagName;
        taggedElement.appendChild(entityElement);
        taggedElement.appendChild(tagNameElement);
        taggedElement.appendChild(lemmaElement);

        entityElement.innerHTML = range;
        lemmaElement.innerHTML = entityElement.innerText;


        range.deleteContents();
        range.insertNode(taggedElement);

        let taggedEntity = new TaggedEntity(this, taggedElement, this.hasContext, this.events);
        identifier = this.__getUnusedIdentifier(identifier);
        taggedEntity.setIdentifier("NV" + identifier);
        return taggedEntity;
    }
    __validifyTagRange(range) {
        Utility.log(TaggedEntityFactory, "__validifyTagRange");
        Utility.verifyArguments(arguments, 1);

        if (range.collapsed) return false;
//        if (this.__checkForChildTags(range)) return false;

        /* ensure entire range is withen the Entity Panel */
        var epFlag = false;
        var current = range.commonAncestorContainer;

        var i = 0;
        while (typeof current !== "undefined" && current !== null) {
            if (typeof current.getAttribute !== "undefined" && current.getAttribute('id') === "entityPanel") {
                epFlag = true;
                break;
            }
            current = current.parentElement;
            i++;
            if (i === 100)
                break;
        }

        return epFlag;
    }
    __checkForChildTags(range) {
        Utility.log(TaggedEntityFactory, "__checkForChildTags");
        var flag = false;

        if (!range.commonAncestorContainer.getElementsByTagName) {
            return false;
        }

        var elements = range.commonAncestorContainer.getElementsByTagName("*");

        for (var i = 0; i < elements.length; i++) {
            if (range.intersectsNode(elements[i])) {
                if (elements[i].tagName.toLowerCase() === this.__getContext().htmlLabels.tagged.toLowerCase()) {
                    flag = true;
                }
            }
        }

        return flag;
    }
    __trimRange(range) {
        Utility.log(TaggedEntityFactory, "__trimRange");
        while (range.toString().charAt(range.toString().length - 1) === ' ') {
            range.setEnd(range.endContainer, range.endOffset - 1);
        }

        while (range.toString().charAt(0) === ' ') {
            range.setStart(range.startContainer, range.startOffset + 1);
        }

        return range;
    }
}

class UnboundTaggedEntity extends TaggedEntity {
    constructor() {
        super(null);
        this.link = "";
        this.entity = "";
        this.lemma = "";
        this.dictionary = "";
        this.tagName = "";
    }
    markupSelect() {
        Utility.enforceTypes(arguments);
        return this;
    }
    markupUnselect() {
        Utility.enforceTypes(arguments);
        return this;
    }
    setEntity(value) {
        Utility.verifyArguments(arguments, 1);
        this.entity = value;
        return this;
    }
    setTagName(value) {
        Utility.verifyArguments(arguments, 1);
        this.tagName = value;
        return this;
    }
    setLemma(value) {
        Utility.verifyArguments(arguments, 1);
        this.lemma = value;
        return this;
    }
    setLink(value) {
        Utility.enforceTypes(arguments, String);
        this.link = value;
        return this;
    }
    getEntity() {
        Utility.enforceTypes(arguments);
        return this.entity;
    }
    getTagName() {
        Utility.enforceTypes(arguments);
        return this.tagName;
    }
    getLemma() {
        Utility.enforceTypes(arguments);
        return this.lemma;
    }
    getLink() {
        Utility.enforceTypes(arguments);
        return this.link;
    }
    hasDictionary() {
        Utility.enforceTypes(arguments);
        return this.dictionary !== "";
    }
    getDictionary() {
        Utility.enforceTypes(arguments);
        return this.dictionary;
    }
    setDictionary(dictionary) {
        Utility.enforceTypes(arguments, String);
        this.dictionary = dictionary;
        return this;
    }
}
