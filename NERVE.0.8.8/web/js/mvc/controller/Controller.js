/* global selected, model, search, TaggedEntity, this.factory, Utility, trace, cD, Range, DOMException, Function, HTMLDivElement, FileOperations, Storage, EntityValues */

/**
 * Events: userMessage
 * @type type
 */

const Utility = require("../../util/Utility");
const FileOperations = require("../../util/FileOperations");

class Controller {
    constructor(model, scriber) {
        Utility.log(Controller, "constructor");
        // Utility.enforceTypes(arguments, Model, Scriber);

        this.model = model;
        this.scriber = scriber;
//        this.storage = new Storage("NERVE_CONTROLLER");
        model.addListener(this);
    }

    async mergeSelectedEntities() {
        Utility.log(Controller, "mergeSelectedEntities");
        // Utility.enforceTypes(arguments);

        let entity = await this.model.mergeEntities(this.collection);
        this.model.getCollection().set(entity);
        this.model.saveState();
    }
    async tagSelectedRange() {
        Utility.log(Controller, "tagSelectedRange");
        await this.model.tagSelection(window.getSelection());
        this.model.saveState();
    }
    untagAll() {        
        this.model.notifyListeners("requestUntagAll");
        this.isSaved = false;
        this.model.saveState();
    }
    async loadDocument(filename, text, action) {
        Utility.log(Controller, "loadDocument");
        // Utility.enforceTypes(arguments, String, String, String);

        let encodeResponse = null;
        switch (action) {
            case "OPEN":
                encodeResponse = await this.scriber.encode(text);
                break;
            case "EDIT":
                encodeResponse = await this.scriber.edit(text);
                break;
            case "TAG":
                encodeResponse = await this.scriber.tag(text);
                break;
        }

        encodeResponse.setFilename(filename);
        await this.model.setDocument(encodeResponse.text, encodeResponse.context, encodeResponse.filename, encodeResponse.schemaURL);
        this.isSaved = true;
    }
//    async saveContents() {
//        Utility.log(Controller, "saveContents");
//        // Utility.enforceTypes(arguments, ["optional", Function], ["optional", Function]);
//
////        let contents = "<doc>" + $(this.model.getDocument()).html() + "</doc>";
//        let contents = "<doc>" + this.model.getDocument() + "</doc>";
//        console.log(contents);
//        let result = await this.scriber.decode(contents);
//        FileOperations.saveToFile(result, this.model.getFilename());
//        this.isSaved = true;
//    }
    goLink() {
        Utility.log(Controller, "goLink");
        // Utility.enforceTypes(arguments);
        let url = $("#txtLink").val();
        if (url.length === 0) return;
        if (!url.startsWith("http") && !url.startsWith("https")) {
            url = "http://" + $("#txtLink").val();
        }
        var win = window.open(url, '_blank');
        win.focus();
    }
}

module.exports = Controller;