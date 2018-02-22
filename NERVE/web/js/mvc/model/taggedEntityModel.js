let Model = require("./Model");

/**
 * All tagged entity elements get passed to a TaggedEntity constructor to provide functionality.
 * The TaggedEntity has a refrence to the element, and the element will ahve a reverence to the
 * tagged entity as 'element.entity'.  will throw an exception is the tagged text does not have
 * a tagname attribute and the tagName is not provided.
 * @type type
 */
module.exports = class TaggedEntityModel {
    constructor(model, element, tagName = null) {
        Utility.log(TaggedEntityModel, "constructor");
        Utility.enforceTypes(arguments, Model, HTMLDivElement, ["optional", String]);

        this.element = element;
        this.model = model;
        this.context = model.getContext();
        element.entity = this;

        $(element).addClass("taggedentity");

        if ($(element).contents().length === 0) {
            this.contents = document.createElement("div");
            $(this.contents).addClass("contents");
            $(element).prepend(this.contents);
        } else if ($(element).children().filter(".contents").length === 0) {
            this.contents = $(element).contents().wrap();
            this.contents.addClass("contents");
        } else {
            this.contents = $(this.element).children(".contents");
        }

        if ($(element).children().filter(".tagname-markup").length === 0) {
            this.markup = document.createElement("div");
            $(element).prepend(this.markup);
            $(this.markup).addClass("tagname-markup");
            this.tagName($(element).tagName());
        } else {
            this.markup = $(this.element).children(".tagname-markup");
        }

        /* default values - will throw an exception is the tagged text does not have a tagname attribute and
         * the tagName is not provided.
         */
        if (tagName !== null) this.tagName(tagName, true);
        this.lemma(this.text(), true);
        this.link("", true);
        this.collection("", true);
    }

    selectLikeEntitiesByLemma(){
        window.alert("TODO: select like entities by lemma");
    }

    getElement() {
        Utility.log(TaggedEntityModel, "getElement");
        Utility.enforceTypes(arguments);
        return this.element;
    }
    getContentElement() {
        Utility.log(TaggedEntityModel, "getElement");
        Utility.enforceTypes(arguments);
        return this.contents[0];
    }
    tagName(value = undefined, silent = false) {
        Utility.log(TaggedEntityModel, "tagName", value);
        if (value === undefined) return $(this.element).tagName();

        if (!this.context.isTagName(value, NameSource.NAME)) {
            throw new Error(`Tagname ${name} doesn't match any known name in context ${this.context.getName()}`);
        }

        let tagInfo = this.context.getTagInfo(value, NameSource.NAME);

        $(this.markup).text(value);
        $(this.markup).attr("data-norm", tagInfo.getName(NameSource.DICTIONARY));
        $(this.element).tagName(value);

        if (!silent) this.model.notifyListeners("notifyEntityUpdate", this);
        return $(this.element).tagName();
    }
    lemma(value = undefined, silent = false) {
        Utility.log(TaggedEntityModel, "lemma", value);
        if (value === undefined) return $(this.element).lemma();
        $(this.element).lemma(value);

        if (!silent) this.model.notifyListeners("notifyEntityUpdate", this);
        return $(this.element).lemma();
    }
    link(value = undefined, silent = false) {
        Utility.log(TaggedEntityModel, "link", value);
        if (value === undefined) return $(this.element).link();
        $(this.element).link(value);

        if (!silent) this.model.notifyListeners("notifyEntityUpdate", this);
        return $(this.element).link();
    }
    text(value = undefined, silent = false) {
        Utility.log(TaggedEntityModel, "text", value);

        if (value === undefined) return $(this.contents).text();
        $(this.contents).text(value);

        if (!silent) this.model.notifyListeners("notifyEntityUpdate", this);
        return $(this.element).link();
        return $(this.contents).text();
    }
    collection(value = undefined, silent = false) {
        Utility.log(TaggedEntityModel, "collection", value);
        if (value === undefined) return $(this.element).attr("data-collection");
        $(this.element).attr("data-collection", value);

        if (!silent) this.model.notifyListeners("notifyEntityUpdate", this);
        return $(this.element).attr("data-collection");
    }
    entityValues(value = undefined) {
        Utility.log(TaggedEntityModel, "entityValues");
        if (value === undefined) return new EntityValues(this.text(), this.lemma(), this.link(), this.tagName(), this.collection());
        else {
            if (value.entity !== null) this.text(value.entity, true);
            if (value.lemma !== null) this.lemma(value.lemma, true);
            if (value.link !== null) this.link(value.link, true);
            if (value.tagName !== null) this.tagName(value.tagName, true);
            if (value.collection !== null) this.collection(value.collection, true);
            this.model.notifyListeners("notifyEntityUpdate", this);
        }

        return new EntityValues(this.text(), this.lemma(), this.link(), this.tagName(), this.collection());
    }
    untag() {
        let children = $(this.contents).contents();
        $(this.element).replaceWith(children);
        this.model.notifyListeners("notifyUntaggedEntity", this);
        document.normalize();
    }
    addClass(classname) {
        $(this.element).addClass(classname);
    }
    removeClass(classname) {
        $(this.element).removeClass(classname);
    }
};