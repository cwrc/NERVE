/* global trace, Utility, Listeners, Context */

/**
 * events: notifyContextChange, setDocument, setText, notifyNewTaggedEntity, userMessage
 * @type type
 */

class Model {
    constructor() {
        Utility.log(Model, "constructor");
        Utility.enforceTypes(arguments);

        this.hostInfo = new HostInfo();
        this.storage = new Storage("NERVE_CONTROLLER");
        this.listeners = [];

        this.entityDialog = new EntityDialogModel();

        /* refers to the index of the last saved state -1 if never saved */
        this.stateIndex = -1;
        this.maxStateIndex = 30;
        this.__resetState();
    }

    getEntityDialog(){
        Utility.log(Model, "getEntityDialog");
        Utility.enforceTypes(arguments);
        return this.entityDialog;
    }

    addListener(listener) {
        Utility.log(Model, "addListener");
        Utility.enforceTypes(arguments, Object);
        this.listeners.push(listener);
    }

    async notifyListeners(method){
        Utility.log(Model, "notifyListeners", method);

        Array.prototype.shift.apply(arguments);
        for (let view of this.listeners){
            if (typeof view[method] !== "function") continue;
            await view[method].apply(view, arguments);
        }
    }

    async init(){
        Utility.log(Model, "init");
        Utility.enforceTypes(arguments);

        this.dictionary = new Dictionary();
        await this.dictionary.connect(this.hostInfo.dictionarySocketAddress);

        if (this.storage.hasValue("document")){
            await this.setDocument(
                this.storage.getValue("document"),
                this.storage.getValue("context"),
                this.storage.getValue("filename"),
                this.storage.getValue("schemaURL")
            );
        }
    }

    async setDocument(text, context, filename, schemaURL){
        Utility.log(Model, "setDocument");
        Utility.enforceTypes(arguments, String, Context, String, String);

        this.context = context;
        this.schema = new Schema();
        await this.schema.load(schemaURL);

        await this.notifyListeners("notifyContextChange", context);
        await this.notifyListeners("setDocument", text);
        await this.notifyListeners("setFilename", filename);

        $(".taggedentity").each((i, element) => {
            let taggedEntity = new TaggedEntityModel(this, element);
            this.notifyListeners("notifyNewTaggedEntity", taggedEntity);
        });

        this.storage.setValue("document", text);
        this.storage.setValue("filename", filename);
        this.storage.setValue("context", context);
        this.storage.setValue("schemaURL", schemaURL);
        this.__resetState();

//        await this.__addDictionaryAttribute();
    }

    async mergeEntities(collection){
        let contents = $();
        for (let entity of collection){
            let contentElement = entity.getContentElement();
            $(entity.getElement()).replaceWith(contentElement);
            contents = contents.add(contentElement);
        }

        contents = contents.mergeElements();
        contents[0].normalize();
        return this.createTaggedEntity(contents[0]);
    }

    async createTaggedEntity(element){
        let values = await this.dictionary.pollEntity($(element).text());
        if (values === null) values = this.getEntityDialog().getValues();
        let tagName = this.getEntityDialog().getValues().tagName;

        let taggedEntity = new TaggedEntityModel(this, element, tagName);
        taggedEntity.entityValues(values);
        this.notifyListeners("notifyNewTaggedEntity", taggedEntity);
        return taggedEntity;
    }

    /* seperate so that the model isn't saved twice on merge */
    async tagSelection(selection) {
        Utility.log(Model, "tagSelection");
        if (selection.rangeCount === 0) return;

        let range = selection.getRangeAt(0);
        range = this.__trimRange(range);

        let tagName = this.getEntityDialog().getValues().tagName;
        if (!this.schema.isValid(range.commonAncestorContainer, tagName)) {
            this.notifyListeners("userMessage", `Tagging "${tagName}" is not valid in the Schema at this location.`);
            return;
        }

        var element = document.createElement("div");
        $(element).append(range.extractContents());
        range.deleteContents();
        range.insertNode(element);
        let taggedEntity = this.createTaggedEntity(element);

        selection.removeAllRanges();
        document.normalize();

        return taggedEntity;
    }

    __trimRange(range) {
        Utility.log(Model, "__trimRange");
        while (range.toString().charAt(range.toString().length - 1) === ' ') {
            range.setEnd(range.endContainer, range.endOffset - 1);
        }

        while (range.toString().charAt(0) === ' ') {
            range.setStart(range.startContainer, range.startOffset + 1);
        }

        return range;
    }

    /**
     * Call 'saveState()' after any change that you want to be able to recover
     * to.  This is typically any change in the model that can be seen by the
     * user.
     * @returns {undefined}
     */
    saveState() {
        Utility.log(Model, "saveState");
        Utility.enforceTypes(arguments);

        if (this.stateIndex === this.maxStateIndex) {
            this.stateList = this.stateList.slice(1, this.stateIndex);
        } else {
            this.stateIndex = this.stateIndex + 1;
            for (let i = this.stateIndex; i < this.maxStateIndex; i++) {
                this.stateList[i] = null;
            }
        }

//        this.storage.setValue("document", this.getDocument());
        this.stateList[this.stateIndex] = this.getDocument();
    }
    revertState() {
        Utility.log(Model, "revertState");
        Utility.enforceTypes(arguments);

        if (this.stateIndex <= 0) return false;

        console.log(this.stateIndex + " " + (this.stateIndex - 1));

        this.stateIndex = this.stateIndex - 1;
        let document = this.stateList[this.stateIndex];

//        this.storage.setValue("document", this.getDocument());
        this.view.setDocument(document);
    }
    advanceState() {
        Utility.log(Model, "advanceState");
        Utility.enforceTypes(arguments);

        if (typeof this.stateList[this.stateIndex + 1] === "undefined" || this.stateList[this.stateIndex + 1] === null) return;

        this.stateIndex = this.stateIndex + 1;
        let document = this.stateList[this.stateIndex];

        this.storage.setValue("current", "document", document);
        this.view.setDocument(document);

        $(".taggedentity").removeClass("selected");
    }
    __resetState() {
        Utility.log(Model, "__resetState");
        Utility.enforceTypes(arguments);

        this.stateList = [];
        this.stateIndex = 0;

        for (let i = 0; i < this.maxStateIndex; i++) {
            this.stateList[i] = null;
        }

        this.stateList[0] = this.getDocument();
    }
    getFilename() {
        Utility.log(Model, "getFilename");
        Utility.enforceTypes(arguments);
        return this.storage.getValue("filename");
    }
    /**
     * Return a string representing the current document.
     * @returns {String}
     */
    getDocument() {
        Utility.log(Model, "getDocument");
        Utility.enforceTypes(arguments);
        return $("#entityPanel").html();
    }

    getContext(){
        Utility.log(Model, "getContext");
        Utility.enforceTypes(arguments);
        return this.context;
    }
}

/**
 * All tagged entity elements get passed to a TaggedEntity constructor to provide functionality.
 * The TaggedEntity has a refrence to the element, and the element will ahve a reverence to the
 * tagged entity as 'element.entity'.  will throw an exception is the tagged text does not have
 * a tagname attribute and the tagName is not provided.
 * @type type
 */
class TaggedEntityModel {
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
        if (tagName !== null) this.tagName(tagName);
        this.lemma(this.text());
        this.link("");
        this.collection("");
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
    tagName(value = undefined) {
        Utility.log(TaggedEntityModel, "tagName", value);
        if (value === undefined) return $(this.element).tagName();

        if (!this.context.isTagName(value, NameSource.NAME)) {
            throw new Error(`Tagname ${name} doesn't match any known name in context ${this.context.getName()}`);
        }

        let tagInfo = this.context.getTagInfo(value, NameSource.NAME);

        $(this.markup).text(value);
        $(this.markup).attr("data-norm", tagInfo.getName(NameSource.DICTIONARY));
        $(this.element).tagName(value);

        this.model.notifyListeners("notifyEntityUpdate", "tagName", this);
        return $(this.element).tagName();
    }
    lemma(value = undefined) {
        Utility.log(TaggedEntityModel, "lemma", value);
        if (value === undefined) return $(this.element).lemma();
        $(this.element).lemma(value);

        this.model.notifyListeners("notifyEntityUpdate", "lemma", this);
        return $(this.element).lemma();
    }
    link(value = undefined) {
        Utility.log(TaggedEntityModel, "link", value);
        if (value === undefined) return $(this.element).link();
        $(this.element).link(value);

        this.model.notifyListeners("notifyEntityUpdate", "link", this);
        return $(this.element).link();
    }
    text(value = undefined) {
        Utility.log(TaggedEntityModel, "text", value);
        if (value === undefined) return $(this.contents).text();
        $(this.contents).text(value);

        this.model.notifyListeners("notifyEntityUpdate", "text", this);
        return $(this.element).link();
        return $(this.contents).text();
    }
    collection(value = undefined) {
        Utility.log(TaggedEntityModel, "collection", value);
        if (value === undefined) return $(this.element).attr("data-collection");
        $(this.element).attr("data-collection", value);

        this.model.notifyListeners("notifyEntityUpdate", "collection", this);
        return $(this.element).attr("data-collection");
    }
    entityValues(value = undefined) {
        Utility.log(TaggedEntityModel, "entityValues", value);
        if (value === undefined) return new EntityValues(this.text(), this.lemma(), this.link(), this.tagName(), this.collection());
        else {
            if (value.text !== "") this.text(value.text);
            if (value.lemma !== "") this.lemma(value.lemma);
            if (value.link !== "") this.link(value.link);
            if (value.tagName !== "") this.tagName(value.tagName);
            if (value.collection !== "") this.collection(value.collection);
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
}

class EntityDialogModel{
    getValues() {
        Utility.log(EntityDialogModel, "getValues");
        Utility.enforceTypes(arguments);
        return new EntityValues($("#txtEntity").val(), $("#txtLemma").val(), $("#txtLink").val(), $("#selectTagName").val());
    }
}