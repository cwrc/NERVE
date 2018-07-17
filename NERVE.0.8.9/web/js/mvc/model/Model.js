/**
 * events: 
 *  - notifyDocumentClosed
 *  - notifyContextChange
 *  - notifySetDocument
 *  - notifyNewTaggedEntities(taggedEntityWidgetArray)
 */

const Schema = require("./Schema");
const TaggedEntityWidget = require("./TaggedEntityWidget");
const Storage = require("../../util/storage");
const HostInfo = require("../../util/hostinfo");
const AbstractModel = require("./AbstractModel");
const ArrayList = require("jjjrmi").ArrayList;
const EntityValues = require("../../gen/nerve").EntityValues;
const FileOperations = require("../../util/fileOperations");
const Collection = require("./Collection");

class Model extends AbstractModel {
    constructor(dragDropHandler) {
        super();

        this.hostInfo = new HostInfo();
        this.dragDropHandler = dragDropHandler;
        this.collection = new Collection();

        this.storage = new Storage("NERVE_MODEL");
        this.storage.registerPackage(require("nerscriber"));
        this.storage.registerClass(require("jjjrmi").ArrayList);
        this.storage.registerClass(require("jjjrmi").HashMap);
        this.clipboard = null;

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

    async onMenuUntag() {
        this.notifyListeners("requestUntagAll");
        this.isSaved = false;
        this.saveState();
    }

    async loadDocument(filename, text, action) {
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

    async setDocument(text, context, filename, schemaURL) {
        await this.notifyListeners("notifyUnsetDocument");

        this.context = context;
        this.schema = new Schema();
        await this.schema.load(schemaURL);

        $("#entityPanel").html(text);

        await this.notifyListeners("notifyContextChange", context, this.schema);
        await this.notifyListeners("notifySetDocument", $("#entityPanel").get(0));
        await this.notifyListeners("notifySetFilename", filename);

        let taggedEntityArray = [];
        $(".taggedentity").each(async (i, element) => {
            let taggedEntity = new TaggedEntityWidget(this.dragDropHandler, element);
            taggedEntityArray.push(taggedEntity);
            this.taggedEntityList.add(taggedEntity);            
        });
        this.notifyListeners("notifyNewTaggedEntities", taggedEntityArray);

        this.storage.setValue("document", text);
        this.storage.setValue("filename", filename);
        this.storage.setValue("context", context);
        this.storage.setValue("schemaURL", schemaURL);
        this.__resetState();

//        await this.__addDictionaryAttribute();
    }

    async close() {
        this.storage.setValue("document", null);
        this.storage.setValue("filename", null);
        this.storage.setValue("context", null);
        localStorage.clear();

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

    notifyUntaggedEntities(taggedEntityWidgetArray) {
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            if (this.taggedEntityList.contains(taggedEntityWidget)) {
                this.taggedEntityList.remove(taggedEntityWidget);
            }
        }
    }

    /**
     * Call 'saveState()' after any change that you want to be able to recover
     * to.  This is typically any change in the model that can be seen by the
     * user.
     * @returns {undefined}
     */
    saveState() {
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
        if (this.currentStateIndex <= 0) return false;
        this.currentStateIndex = this.currentStateIndex - 1;
        let docHTML = this.stateList[this.currentStateIndex];
        this.__setDocument(docHTML);
    }

    async advanceState() {
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
            let taggedEntity = new TaggedEntityWidget(this.dragDropHandler, element);            
            this.notifyListeners("notifyNewTaggedEntities", [taggedEntity]);
        });

        this.storage.setValue("current", "document", docHTML);
    }

    notifyNewTaggedEntities(taggedEntityArray){
        for (let taggedEntity of taggedEntityArray){
            this.taggedEntityList.add(taggedEntity);
        }
    }

    __resetState() {
        this.stateList = [];
        this.currentStateIndex = 0;
        this.stateList[0] = $("#entityPanel").html();
    }
    getFilename() {
        return this.storage.getValue("filename");
    }

    getContext() {
        return this.context;
    }
}

module.exports = Model;