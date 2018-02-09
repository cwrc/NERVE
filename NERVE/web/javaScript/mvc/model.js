/* global trace, Utility, Listeners, Context, Collection */

/**
 * events: notifyContextChange, setDocument, setText,  , userMessage
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
        this.collection = new Collection();
        this.searchModel = new SearchModel("#entityPanel");
        this.clipboard = null;

        this.currentStateIndex = 0;
        this.maxStateIndex = 30;
        this.__resetState();
    }

    getSearchModel(){
        Utility.log(Model, "getSearchModel");
        Utility.enforceTypes(arguments);
        return this.searchModel;
    }

    getEntityDialog(){
        Utility.log(Model, "getEntityDialog");
        Utility.enforceTypes(arguments);
        return this.entityDialog;
    }

    addListener(listener) {
        Utility.log(Model, "addListener", listener.constructor.name);
        Utility.enforceTypes(arguments, Object);
        this.collection.addListener(listener);
        this.searchModel.addListener(listener);
        this.listeners.push(listener);
    }

    async notifyListeners(method){
        Utility.log(Model, "notifyListeners", method);

        Array.prototype.shift.apply(arguments);
        for (let listener of this.listeners){
            if (typeof listener[method] !== "function") continue;
            await listener[method].apply(listener, arguments);
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

        $("#entityPanel").html(text);

        await this.notifyListeners("notifyContextChange", context);
        await this.notifyListeners("setDocument", $("#entityPanel").get(0));
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

    async close(){
        Utility.log(Model, "close");
        Utility.enforceTypes(arguments);
        this.storage.setValue("document", null);
        this.storage.setValue("filename", null);
        this.storage.setValue("context", null);
        localStorage.clear();
        this.collection.clear();
        $("#entityPanel").html("");
        this.notifyListeners("notifyDocumentClosed");
    }

    untagAllSelected(){
        Utility.log(Model, "untagAllSelected");
        Utility.enforceTypes(arguments);
        let count = this.collection.size();
        if (this.collection.isEmpty()) return 0;
        for (let entityModel of this.collection) entityModel.untag();
        this.collection.clear();
        return count;
    }

    /**
     * Set the values of all selected tagged entities to 'dialogValues'.
     * This is triggered by the dialog box and cwrc dialogs.
     */
    async updateAllSelected(dialogValues = null) {
        Utility.log(Model, "updateAllSelected");
        Utility.enforceTypes(arguments);
        if (this.collection.isEmpty()) return 0;
        if (dialogValues === null) dialogValues = this.entityDialog.getValues();
        for (let e of this.collection) e.entityValues(dialogValues);
        return this.collection.size();
    }

    getCollection(){
        Utility.log(Model, "getCollection");
        Utility.enforceTypes(arguments);
        return this.collection;
    }

    async mergeEntities(){
        Utility.log(Model, "mergeEntities");
        let selection = window.getSelection();
        if (selection.rangeCount !== 0 && !selection.isCollapsed) {
            let newEntity = await this.tagSelectedRange();
            this.collection.add(newEntity);
        }

        let contents = $();
        for (let entity of this.collection){
            let contentElement = entity.getContentElement();
            $(entity.getElement()).replaceWith(contentElement);
            contents = contents.add(contentElement);
        }

        contents = contents.mergeElements();
        contents[0].normalize();
        return this.createTaggedEntity(contents[0]);
    }

    async createTaggedEntity(element){
        Utility.log(Model, "createTaggedEntity");
        let values = await this.dictionary.pollEntity($(element).text());
        if (values === null) values = this.getEntityDialog().getValues();
        let tagName = this.getEntityDialog().getValues().tagName;
        values.entity = "";

        let taggedEntity = new TaggedEntityModel(this, element, tagName);
        taggedEntity.entityValues(values);
        this.notifyListeners("notifyNewTaggedEntity", taggedEntity);
        return taggedEntity;
    }

    /* seperate so that the model isn't saved twice on merge */
    async tagSelection(selection) {
        Utility.log(Model, "tagSelection");
        if (selection.rangeCount === 0) return null;

        let range = selection.getRangeAt(0);
        range = this.__trimRange(range);

        let tagName = this.getEntityDialog().getValues().tagName;
        if (!this.schema.isValid(range.commonAncestorContainer, tagName)) {
            this.notifyListeners("userMessage", `Tagging "${tagName}" is not valid in the Schema at this location.`);
            return null;
        }

        var element = document.createElement("div");
        $(element).append(range.extractContents());
        let taggedEntity = this.createTaggedEntity(element);

        range.deleteContents();
        range.insertNode(element);

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

        this.currentStateIndex = this.currentStateIndex + 1;
        this.stateList[this.currentStateIndex] = $("#entityPanel").html();
        this.storage.setValue("document",  $("#entityPanel").html());

        if (this.currentStateIndex === this.maxStateIndex) {
            this.stateList = this.stateList.slice(1, this.currentStateIndex);
        } else {
            for (let i = this.currentStateIndex + 1; i < this.maxStateIndex; i++) {
                this.stateList[i] = null;
            }
        }
    }

    async revertState() {
        Utility.log(Model, "revertState");
        Utility.enforceTypes(arguments);

        if (this.currentStateIndex <= 0) return false;
        this.currentStateIndex = this.currentStateIndex - 1;
        let docHTML = this.stateList[this.currentStateIndex];

        $("#entityPanel").html(docHTML);

        $(".taggedentity").each((i, element) => {
            let taggedEntity = new TaggedEntityModel(this, element);
            this.notifyListeners("notifyNewTaggedEntity", taggedEntity);
        });

        this.storage.setValue("current", "document", docHTML);
        await this.notifyListeners("setDocument", document);
    }
    async advanceState() {
        Utility.log(Model, "advanceState");
        Utility.enforceTypes(arguments);

        if (typeof this.stateList[this.currentStateIndex + 1] === "undefined" || this.stateList[this.currentStateIndex + 1] === null) return;

        this.currentStateIndex = this.currentStateIndex + 1;
        let docHTML = this.stateList[this.currentStateIndex];
        $("#entityPanel").html(docHTML);

        $(".taggedentity").each((i, element) => {
            let taggedEntity = new TaggedEntityModel(this, element);
            this.notifyListeners("notifyNewTaggedEntity", taggedEntity);
        });

        this.storage.setValue("current", "document", docHTML);
        await this.notifyListeners("setDocument", document);
    }
    __resetState() {
        Utility.log(Model, "__resetState");
        Utility.enforceTypes(arguments);

        this.stateList = [];
        this.currentStateIndex = 0;
        this.stateList[0] = $("#entityPanel").html();
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
        return $("#entityPanel")[0];
    }

    getContext(){
        Utility.log(Model, "getContext");
        Utility.enforceTypes(arguments);
        return this.context;
    }

    copy(){
        this.clipboard = this.entityDialog.getValues();
        this.clipboard.entity = "";
        console.log(this.clipboard);
    }

    paste(){
        if (this.clipboard === null) return;
        console.log(this.clipboard);
        for (let entity of this.collection){
            entity.entityValues(this.clipboard);
        }
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

        this.model.notifyListeners("notifyEntityUpdate", this);
        return $(this.element).tagName();
    }
    lemma(value = undefined) {
        Utility.log(TaggedEntityModel, "lemma", value);
        if (value === undefined) return $(this.element).lemma();
        $(this.element).lemma(value);

        this.model.notifyListeners("notifyEntityUpdate", this);
        return $(this.element).lemma();
    }
    link(value = undefined) {
        Utility.log(TaggedEntityModel, "link", value);
        if (value === undefined) return $(this.element).link();
        $(this.element).link(value);

        this.model.notifyListeners("notifyEntityUpdate", this);
        return $(this.element).link();
    }
    text(value = undefined) {
        Utility.log(TaggedEntityModel, "text", value);

        if (value === undefined) return $(this.contents).text();
        $(this.contents).text(value);

        this.model.notifyListeners("notifyEntityUpdate", this);
        return $(this.element).link();
        return $(this.contents).text();
    }
    collection(value = undefined) {
        Utility.log(TaggedEntityModel, "collection", value);
        if (value === undefined) return $(this.element).attr("data-collection");
        $(this.element).attr("data-collection", value);

        this.model.notifyListeners("notifyEntityUpdate", this);
        return $(this.element).attr("data-collection");
    }
    entityValues(value = undefined) {
        Utility.log(TaggedEntityModel, "entityValues");
        if (value === undefined) return new EntityValues(this.text(), this.lemma(), this.link(), this.tagName(), this.collection());
        else {
            if (value.entity !== "") $(this.contents).text(value.entity);
            if (value.lemma !== "") $(this.element).lemma(value.lemma);
            if (value.link !== "")  $(this.element).link(value.link);
            if (value.collection !== "") $(this.element).attr("data-collection", value.collection);

            let tagInfo = this.context.getTagInfo(value.tagName, NameSource.NAME);
            $(this.markup).text(value.tagName);
            $(this.markup).attr("data-norm", tagInfo.getName(NameSource.DICTIONARY));
            $(this.element).tagName(value.tagName);

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
}

class EntityDialogModel{
    getValues() {
        Utility.log(EntityDialogModel, "getValues");
        Utility.enforceTypes(arguments);
        return new EntityValues($("#txtEntity").val(), $("#txtLemma").val(), $("#txtLink").val(), $("#selectTagName").val());
    }
}


//    async dictAdd() {
//        Utility.log(Controller, "dictAdd");
//        Utility.enforceTypes(arguments);
//
//        if (this.collection.isEmpty()) return;
//        this.view.pushThrobberMessage("Adding entity to dictionary");
//        this.view.showThrobber(true);
//        let entity = this.collection.getLast();
//        let values = EntityValues.extract(entity);
//        values.collection = "custom";
//        let collection = await this.dictionary.addEntity(values);
//        $(entity).collection(collection);
//        this.onChange(this.collection);
//        this.view.clearThrobber();
//    }
//    async dictRemove() {
//        Utility.log(Controller, "dictRemove");
//        Utility.enforceTypes(arguments);
//
//        if (this.collection.isEmpty()) return;
//        if (this.collection.isEmpty()) return;
//        this.view.pushThrobberMessage("Removing entity from dictionary");
//        let entity = this.collection.getLast();
//        let values = EntityValues.extract(entity);
//        await this.dictionary.deleteEntity(values);
//        let collection = await this.dictionary.lookupCollection(values);
//        $(entity).collection(collection);
//        this.onChange(this.collection);
//        this.view.clearThrobber();
//    }
