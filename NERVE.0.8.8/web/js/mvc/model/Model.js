/**
 * events: 
 *  - notifyDocumentClosed
 *  - notifyContextChange
 *  - setDocument 
 *  - setText
 *  - userMessage
 *  - notifyNewTaggedEntities(taggedEntityWidgetArray)
 * events from TaggedEntityWidget: 
 *  - notifyEntityUpdate(taggedEntityWidget, previousValues)
 *  - notifyUntaggedEntities(TaggedEntityWidget)
 * events from collection: 
 *  - notifyCollectionAdd
 *  - notifyCollectionClear
 *  - notifyCollectionRemove
 */

const Schema = require("./schema");
const SearchModel = require("./SearchModel");
const TaggedEntityWidget = require("./TaggedEntityWidget");
const Storage = require("../../util/storage");
const HostInfo = require("../../util/hostinfo");
const AbstractModel = require("./AbstractModel");
const Utility = require("../../util/Utility");
const ArrayList = require("jjjrmi").ArrayList;
const EntityValues = require("../../gen/nerve").EntityValues;
const FileOperations = require("../../util/fileOperations");

class Model extends AbstractModel {
    constructor(dragDropHandler) {
        Utility.log(Model, "constructor");
        super();

        this.hostInfo = new HostInfo();
        this.dragDropHandler = dragDropHandler;

        this.storage = new Storage("NERVE_MODEL");
        this.storage.registerPackage(require("nerscriber"));
        this.storage.registerClass(require("jjjrmi").ArrayList);
        this.storage.registerClass(require("jjjrmi").HashMap);

        this.selectedEntites = new ArrayList();
        this.searchModel = new SearchModel("#entityPanel");
        this.clipboard = null;

        this.latestValues = new EntityValues();
        this.taggedEntityList = new ArrayList();

        this.currentStateIndex = 0;
        this.maxStateIndex = 30;
        this.__resetState();

        this.reader = new FileReader();
        this.reader.model = this;
        this.reader.onload = async function (event) {
            await this.model.loadDocument(this.filename, event.target.result, this.action);
        }.bind(this.reader);

        /* file dialog event - related to menu open */
        $("#fileOpenDialog").change(async (event) => {
            if (this.hasOpenDocument) this.close();
            this.reader.filename = event.currentTarget.files[0].name;
            await this.reader.readAsText(event.currentTarget.files[0]);
            $("#fileOpenDialog").val("");
        });

        this.addListener(this);
    }

    async init(dictionary) {
        this.dictionary = dictionary;

        if (this.storage.hasValue("document")) {
            await this.setDocument(
                this.storage.getValue("document"),
                this.storage.getValue("context"),
                this.storage.getValue("filename"),
                this.storage.getValue("schemaURL")
            );
        }
    }

    async contextAddDict(taggedEntityWidget) {
        this.notifyListeners("showThrobber");
        let r = await this.dictionary.addEntity(taggedEntityWidget.values());
        if (r === 1) {
            this.notifyListeners("notifyMessage", "entity added to dictionary");
            taggedEntityWidget.datasource("custom");
        } else {
            this.notifyListeners("notifyMessage", "entity not added to dictionary: " + r);
        }
        this.notifyListeners("clearThrobber");
    }

    async contextRemoveDict(taggedEntityWidget){
        this.notifyListeners("showThrobber");
        let r = await this.dictionary.deleteEntity(taggedEntityWidget.values());
        if (r === 1) {
            this.notifyListeners("notifyMessage", "entity removed from dictionary");
            taggedEntityWidget.datasource("custom");
        } else {
            this.notifyListeners("notifyMessage", "entity not removed from dictionary: " + r);
        }
        this.notifyListeners("clearThrobber");        
    }

    async onMenuUndo() {
        this.revertState();
    }

    async onMenuRedo() {
        this.advanceState();
    }

    async onMenuClose() {
        await this.close();
    }

    async onMenuClear() {
        this.getCollection().clear();
    }

    async onMenuCopy() {
        this.copy();
    }

    async onMenuPaste() {
        this.paste();
        this.saveState();
    }

    async onMenuMerge() {
        let entity = await this.mergeEntities(this.collection);
        this.getCollection().set(entity);
        this.saveState();
    }

    async onMenuTag() {
        await this.tagSelection(window.getSelection());
        this.saveState();
    }

    async onMenuUntag() {
        this.notifyListeners("requestUntagAll");
        this.isSaved = false;
        this.saveState();
    }

    async loadDocument(filename, text, action) {
        Utility.log(Model, "loadDocument");

        let encodeResponse = null;
        switch (action) {
            case "OPEN": /* NER & dict */
                encodeResponse = await this.scriber.encode(text);
                break;
            case "EDIT": /* open no dict, no NER */
                encodeResponse = await this.scriber.edit(text);
                break;
            case "TAG": /* NER only */
                encodeResponse = await this.scriber.tag(text);
                break;
            case "LINK": /* NER only */
                encodeResponse = await this.scriber.link(text);
                break;
        }

        encodeResponse.setFilename(filename);
        await this.setDocument(encodeResponse.text, encodeResponse.context, encodeResponse.filename, encodeResponse.schemaURL);
        this.isSaved = true;
    }

    setScriber(scriber) {
        this.scriber = scriber;
    }

    async onMenuSave() {
        let contents = "<doc>" + this.getDocument() + "</doc>";
        let result = await this.scriber.decode(contents);
        FileOperations.saveToFile(result, this.getFilename());
        this.isSaved = true;
    }

    hasOpenDocument() {
        let filename = this.storage.getValue("filename");
        return (filename !== undefined && filename !== null);
    }

    async onMenuOpen(action) {
        this.reader.action = action;
        $("#fileOpenDialog").click();
    }

    /**
     * Return a string representing the current document.  Not the actual html
     * node.
     * @returns {String}
     */
    getDocument() {
        Utility.log(Model, "getDocument");

        let doc = $("#entityPanel").get(0);
        let clone = doc.cloneNode(true);

        let taggedEntities = $(clone).find(".taggedentity");
        taggedEntities.each((i, element) => {
            let contents = $(element).find(".contents").contents();
            $(element).empty();
            $(element).append(contents);
        });

        let docText = $(clone).html();
        console.log(docText);

        return docText;
    }

    notifyDialogChange(fieldID, value) {
        switch (fieldID) {
            case "entityText":
                this.latestValues.text(value);
                break;
            case "lemma":
                this.latestValues.lemma(value);
                break;
            case "link":
                this.latestValues.link(value);
                break;
            case "tagName":
                this.latestValues.tag(value);
                break;
        }
    }

    addListener(listener) {
        super.addListener(listener);
        this.searchModel.addListener(listener);
    }

    getSearchModel() {
        Utility.log(Model, "getSearchModel");
        // Utility.enforceTypes(arguments);
        return this.searchModel;
    }

    async setDocument(text, context, filename, schemaURL) {
        Utility.log(Model, "setDocument");
        // Utility.enforceTypes(arguments, String, Context, String, String);

        await this.notifyListeners("notifyUnsetDocument");

        this.context = context;
        this.schema = new Schema();
        await this.schema.load(schemaURL);

        $("#entityPanel").html(text);

        await this.notifyListeners("notifyContextChange", context);
        await this.notifyListeners("notifySetDocument", $("#entityPanel").get(0));
        await this.notifyListeners("notifySetFilename", filename);

        let taggedEntityArray = [];
        $(".taggedentity").each(async (i, element) => {
            let taggedEntity = new TaggedEntityWidget(this, this.dragDropHandler, element);
            taggedEntityArray.push(taggedEntity);
            this.taggedEntityList.add(taggedEntity);            
            let result = await this.dictionary.lookup(taggedEntity.text(), taggedEntity.lemma(), taggedEntity.tag());
            if (result.size() > 0){
                let first = result.get(0);
                let value = first.getEntry("source").getValue();
                taggedEntity.datasource(value, false);
            }
        });
        this.notifyListeners("notifyNewTaggedEntities", taggedEntityArray);

        this.storage.setValue("document", text);
        this.storage.setValue("filename", filename);
        this.storage.setValue("context", context);
        this.storage.setValue("schemaURL", schemaURL);
        this.__resetState();

//        await this.__addDictionaryAttribute();
    }

    debug() {
        let i = 0;
        for (let taggedEntityWidget of this.taggedEntityList) {
            console.log((i++) + " " + taggedEntityWidget.lemma() + " " + taggedEntityWidget.tag());
        }
        console.log("------------------------------------------");
        console.log(this.taggedEntityList.size() + " entities");
    }

    async untagAll() {
        let i = 0;
        while (!this.taggedEntityList.isEmpty()) {
            let taggedEntityWidget = this.taggedEntityList.remove(0);
            console.log("* UNTAG " + (i++) + "/" + this.taggedEntityList.size() + " " + taggedEntityWidget.lemma() + " " + taggedEntityWidget.tag());
            await taggedEntityWidget.untag();
        }
//        this.taggedEntityList.clear();                          
    }

    async close() {
        Utility.log(Model, "close");
        // Utility.enforceTypes(arguments);
        this.storage.setValue("document", null);
        this.storage.setValue("filename", null);
        this.storage.setValue("context", null);
        localStorage.clear();

        let i = 0;

        let taggedEntityWidgetArray = [];
        while (!this.taggedEntityList.isEmpty()) {
            let taggedEntityWidget = this.taggedEntityList.remove(0);
            taggedEntityWidgetArray.push(taggedEntityWidget);
            taggedEntityWidget.untag();
        }
        this.taggedEntityList.clear();
        this.notifyListeners("notifyUntaggedEntities", taggedEntityWidgetArray);

        $("#entityPanel").html("");
        this.notifyListeners("notifyDocumentClosed");
    }

    getCollection() {
        Utility.log(Model, "getCollection");
        // Utility.enforceTypes(arguments);
        return this.collection;
    }

    async mergeEntities() {
        Utility.log(Model, "mergeEntities");
        let selection = window.getSelection();
        if (selection.rangeCount !== 0 && !selection.isCollapsed) {
            let newEntity = await this.tagSelectedRange();
            this.collection.add(newEntity);
        }

        let contents = $();

        let taggedEntityArray = [];
        for (let entity of this.collection) {
            let contentElement = entity.getContentElement();
            $(entity.getElement()).replaceWith(contentElement);
            contents = contents.add(contentElement);
            taggedEntityArray.push(entity);
        }
        this.notifyListeners("notifyUntaggedEntities", taggedEntityArray);

        contents = contents.mergeElements();
        contents[0].normalize();
        return this.createTaggedEntity(contents[0]);
    }

    async createTaggedEntity(element) {
        Utility.log(Model, "createTaggedEntity");
//        let values = await this.dictionary.pollEntity(this.context, $(element).text());
//        if (values === null) values = this.latestValues;

        let values = this.latestValues;

        values.text(null);
        values.lemma(null);

        let taggedEntity = new TaggedEntityWidget(this, this.dragDropHandler, element, values.tag());
        taggedEntity.values(values, false);
        this.taggedEntityList.add(taggedEntity);
        
        let result = await this.dictionary.lookup(taggedEntity.text(), taggedEntity.lemma(), taggedEntity.tag(), null);
        if (result.size() > 0){            
            let first = result.get(0);
            taggedEntity.datasource(first.getEntry("source").getValue(), false);
            taggedEntity.link(first.getEntry("link").getValue(), false);
        }        

        this.notifyListeners("notifyNewTaggedEntities", [taggedEntity]);
        return taggedEntity;
    }

    notifyUntaggedEntities(taggedEntityWidgetArray) {
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            if (this.taggedEntityList.contains(taggedEntityWidget)) {
                this.taggedEntityList.remove(taggedEntityWidget);
            }
        }
    }

    /* seperate so that the model isn't saved twice on merge */
    async tagSelection(selection) {
        Utility.log(Model, "tagSelection");
        if (selection.rangeCount === 0) return null;

        let range = selection.getRangeAt(0);
        range = this.__trimRange(range);

        let tagName = this.latestValues.tag();

        if (!this.schema.isValid(range.commonAncestorContainer, tagName)) {
            this.notifyListeners("userMessage", `Tagging "${tagName}" is not valid in the Schema at this location.`);
            return null;
        }

        var element = document.createElement("div");
        $(element).append(range.extractContents());

        let taggedEntity = await this.createTaggedEntity(element);

        range.deleteContents();
        range.insertNode(element);

        selection.removeAllRanges();
        document.normalize();

        console.log(taggedEntity);

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
        // Utility.enforceTypes(arguments);

        this.currentStateIndex = this.currentStateIndex + 1;
        this.stateList[this.currentStateIndex] = $("#entityPanel").html();
        this.storage.setValue("document", $("#entityPanel").html());

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

        if (this.currentStateIndex <= 0) return false;
        this.currentStateIndex = this.currentStateIndex - 1;
        let docHTML = this.stateList[this.currentStateIndex];
        this.__setDocument(docHTML);
    }

    async advanceState() {
        Utility.log(Model, "advanceState");

        if (typeof this.stateList[this.currentStateIndex + 1] === "undefined" || this.stateList[this.currentStateIndex + 1] === null) return;
        this.currentStateIndex = this.currentStateIndex + 1;
        let docHTML = this.stateList[this.currentStateIndex];
        this.__setDocument(docHTML);
    }

    __setDocument(docHTML) {
        while (!this.taggedEntityList.isEmpty()) {
            let taggedEntityWidget = this.taggedEntityList.remove(0);
            taggedEntityWidget.untag();
        }
        this.taggedEntityList.clear();
        if (docHTML === undefined) return;

        $("#entityPanel").html(docHTML);

        $(".taggedentity").each((i, element) => {
            let taggedEntity = new TaggedEntityWidget(this, this.dragDropHandler, element);
            this.taggedEntityList.add(taggedEntity);
            this.notifyListeners("notifyNewTaggedEntities", [taggedEntity]);
        });

        this.storage.setValue("current", "document", docHTML);
    }

    __resetState() {
        Utility.log(Model, "__resetState");
        // Utility.enforceTypes(arguments);

        this.stateList = [];
        this.currentStateIndex = 0;
        this.stateList[0] = $("#entityPanel").html();
    }
    getFilename() {
        Utility.log(Model, "getFilename");
        // Utility.enforceTypes(arguments);
        return this.storage.getValue("filename");
    }

    getContext() {
        Utility.log(Model, "getContext");
        // Utility.enforceTypes(arguments);
        return this.context;
    }

    copy() {
        window.alert("TODO: copy");
    }

    paste() {
        window.alert("TODO: paste");
    }
}

module.exports = Model;