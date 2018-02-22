/**
 * events: notifyContextChange, setDocument, setText,  , userMessage
 */

Collection = require("./collection");
Schema = require("./schema");
SearchModel = require("./SearchModel");
TaggedEntityModel = require("./taggedEntityModel");
EntityDialogModel = require("./entityDialogModel");
Storage = require("../../util/storage");
HostInfo = require("../../util/hostinfo");
AbstractModel = require("./AbstractModel");
Utility = require("../../util/Utility");

class Model extends AbstractModel{
    constructor() {
        Utility.log(Model, "constructor");
        Utility.enforceTypes(arguments);

        super();

        this.hostInfo = new HostInfo();
        this.storage = new Storage("NERVE_CONTROLLER");

        this.entityDialog = new EntityDialogModel();
        this.collection = new Collection();
        this.searchModel = new SearchModel("#entityPanel");
        this.clipboard = null;

        this.currentStateIndex = 0;
        this.maxStateIndex = 30;
        this.__resetState();
    }

    addListener(listener) {
        super.addListener(listener);
        this.collection.addListener(listener);
        this.searchModel.addListener(listener);
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
        await this.notifyListeners("notifySetDocument", $("#entityPanel").get(0));
        await this.notifyListeners("notifySetFilename", filename);

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

        this.getCollection().clear();
        await this.notifyListeners("notifySetDocument", $("#entityPanel").get(0));
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
        this.getCollection().clear();
        await this.notifyListeners("notifySetDocument", $("#entityPanel").get(0));
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

module.exports = Model;