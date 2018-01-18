DOCUMENT_POSITION_DISCONNECTED = 1;
DOCUMENT_POSITION_PRECEDING = 2;
DOCUMENT_POSITION_FOLLOWING = 4;
DOCUMENT_POSITION_CONTAINS = 8;
DOCUMENT_POSITION_CONTAINED_BY = 16;
DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32;

/* global selected, model, search, TaggedEntity, this.factory, Utility, trace, cD, Range, DOMException, Function, HTMLDivElement, FileOperations, Storage, EntityValues */

/**
 * Events: userMessage
 * @type type
 */
class TaggedEntityController {
    constructor(controller, taggedEntityModel) {
        Utility.log(TaggedEntityController, "constructor");
        Utility.enforceTypes(arguments, Controller, TaggedEntityModel);

        this.controller = controller;
        this.taggedEntityModel = taggedEntityModel;
        $(this.taggedEntityModel.getElement()).click((event) => this.click(event));
        $(this.taggedEntityModel.getContentElement()).click((event) => this.click(event));
    }
    click(event) {
        Utility.log(TaggedEntityController, "click");
        event.stopPropagation();

        if (event.altKey) {
            console.log(this.element);
            window.lastTarget = this;
            return;
        }

        if (!event.ctrlKey) {
            this.controller.unselectAll();
            event.stopPropagation();
        }

        if (!event.ctrlKey && !event.metaKey) {
            this.controller.setSelected(this.taggedEntityModel);
        } else {
            this.controller.toggleSelect(this.taggedEntityModel);
        }
    }
}

class Controller {
    constructor(model, view, scriber) {
        Utility.log(Controller, "constructor");
        Utility.enforceTypes(arguments, Model, View, Scriber);

        this.model = model;
        this.scriber = scriber;

        this.collection = new Collection();
        this.collection.addListener(view);

        this.listeners = [];
        this.storage = new Storage("NERVE_CONTROLLER");
        model.addListener(this);
    }

    addListener(lst){
        this.collection.addListener(lst);
        this.listeners.push(lst);
    }

    async notifyListeners(method){
        Utility.log(Controller, "notifyListeners", method);

        Array.prototype.shift.apply(arguments);
        for (let view of this.listeners){
            if (typeof view[method] !== "function") continue;
            await view[method].apply(view, arguments);
        }
    }

    /**
     * Model event listener.
     * @param {type} taggedEntityModel
     * @returns {undefined}
     */
    notifyNewTaggedEntity(taggedEntityModel){
        Utility.log(Controller, "notifyNewTaggedEntity");
        Utility.enforceTypes(arguments, TaggedEntityModel);

        new TaggedEntityController(this, taggedEntityModel);
    }

    async init() {
        Utility.log(Controller, "init");
        Utility.enforceTypes(arguments);

        this.searchUtility = new SearchUtility("#entityPanel");

        let hostInfo = new HostInfo();
        await this.scriber.connect(hostInfo.scriberSocketAddress);
        this.copiedInfo = null;
        this.isSaved = false;

        return this;
    }

    /**
     * Set the values of all selected tagged entities to 'dialogValues'.
     * This is triggered by the dialog box and cwrc dialogs.
     */
    async updateAllSelected(dialogValues) {
        Utility.log(Controller, "updateAllSelected");
        Utility.enforceTypes(arguments, EntityValues);

        for (let e of this.collection) e.entityValues(dialogValues);
//        this.view.setSearchText("");
//        this.searchUtility.reset();
        this.model.saveState();
    }

    pasteInfo() {
        Utility.log(Controller, "pasteInfo");
        Utility.enforceTypes(arguments);
        if (this.copiedInfo === null || this.collection.isEmpty()) return;

        for (let e of this.collection) {
            e.entityValues(this.copiedInfo);
        }

        this.onChange(this.collection);
        this.model.saveState();
    }
    async mergeSelectedEntities() {
        Utility.log(Controller, "mergeSelectedEntities");
        Utility.enforceTypes(arguments);

        let selection = window.getSelection();
        if (selection.rangeCount !== 0) {
            await this.__tagSelectedRange();
        }

        if (this.collection.size() < 2) return;
        var ele = this.collection.$().mergeElements();
        let entityValues = this.view.getDialogValues();
        this.applyValuesToEntity(ele, entityValues);
        this.collection.set(ele);
        this.model.saveState();
        document.normalize();
    }

    async tagSelectedRange() {
        Utility.log(Controller, "tagSelectedRange");
        Utility.enforceTypes(arguments);

        let entity = await this.model.tagSelection(window.getSelection());
        this.collection.add(entity);
        this.model.saveState();
        this.isSaved = false;
        this.notifyListeners("userMessage", `New "${entity.tagName()}" entity created.`);
//        this.view.setSearchText("");
    }

    untagAll() {
        Utility.log(Controller, "untagAll");
        Utility.enforceTypes(arguments);

        if (this.collection.isEmpty()) return;

        let count = this.collection.size();
        for (let entity of this.collection) entity.untag();
        this.view.clearDialogs();
        this.view.setDialogFade(true);
        document.normalize();

        this.isSaved = false;
        this.model.saveState();
        this.notifyListeners("userMessage", count + " entit" + (count === 1 ? "y" : "ies") + " untagged");
        this.view.setSearchText("");
        this.searchUtility.reset();
    }
    revertState() {
        Utility.log(Controller, "revertState");
        Utility.enforceTypes(arguments);

        this.unselectAll();
        this.model.revertState();
    }
    advanceState() {
        Utility.log(Controller, "advanceState");
        Utility.enforceTypes(arguments);

        this.unselectAll();
        this.model.advanceState();
    }
    /* end of active model control */

    selectLikeEntitiesByLemma() {
        Utility.log(Controller, "selectLikeEntitiesByLemma");
        Utility.enforceTypes(arguments);

        if (this.collection.isEmpty()) return;
        let lastEle = this.collection.getLast();
        if (typeof $(lastEle).lemma() === "undefined") return;

        $(".taggedentity").each((i, ele) => {
            if ($(ele).lemma() === $(lastEle).lemma()) {
                this.collection.add(ele);
                $(ele).addClass("selected");
            }
        });

        this.pollDialogs();
        let count = this.collection.size();
        this.notifyListeners("userMessage", count + " entit" + (count === 1 ? "y" : "ies") + " selected");
    }
    async dictAdd() {
        Utility.log(Controller, "dictAdd");
        Utility.enforceTypes(arguments);

        if (this.collection.isEmpty()) return;
        this.view.pushThrobberMessage("Adding entity to dictionary");
        this.view.showThrobber(true);
        let entity = this.collection.getLast();
        let values = EntityValues.extract(entity);
        values.collection = "custom";
        let collection = await this.dictionary.addEntity(values);
        $(entity).collection(collection);
        this.onChange(this.collection);
        this.view.clearThrobber();
    }
    async dictRemove() {
        Utility.log(Controller, "dictRemove");
        Utility.enforceTypes(arguments);

        if (this.collection.isEmpty()) return;
        if (this.collection.isEmpty()) return;
        this.view.pushThrobberMessage("Removing entity from dictionary");
        let entity = this.collection.getLast();
        let values = EntityValues.extract(entity);
        await this.dictionary.deleteEntity(values);
        let collection = await this.dictionary.lookupCollection(values);
        $(entity).collection(collection);
        this.onChange(this.collection);
        this.view.clearThrobber();
    }
    /* iterface with listeners */
    setSelected(taggedEntity) {
        Utility.log(Controller, "setSelected");
        Utility.enforceTypes(arguments, TaggedEntityModel);
        this.collection.set(taggedEntity);
    }
    addSelected(taggedEntity) {
        Utility.log(Controller, "addSelected");
        Utility.enforceTypes(arguments, TaggedEntityModel);
        this.collection.add(taggedEntity);
    }
    toggleSelect(taggedEntity) {
        Utility.log(Controller, "toggleSelect");
        Utility.enforceTypes(arguments, TaggedEntityModel);

        if (!this.collection.contains(taggedEntity)) {
            this.collection.add(taggedEntity);
        } else {
            this.collection.remove(taggedEntity);
        }
    }
    unselectAll() {
        Utility.log(Controller, "unselectAll");
        Utility.enforceTypes(arguments);
//        window.getSelection().removeAllRanges();
        this.collection.clear();
    }
    fillFind() {
        Utility.log(Controller, "fillFind");
        Utility.enforceTypes(arguments);

        let selection = window.getSelection();
        if (selection.rangeCount !== 0 && window.getSelection().getRangeAt(0).toString().trim() !== "") {
            let text = window.getSelection().getRangeAt(0).toString().trim();
            this.view.setFindText(text);
            this.search(text, "next");
        } else if (!this.collection.isEmpty()) {
            let last = this.collection.getLast();
            this.view.setFindText($(last).text());
            this.search($(last).text(), "next");
        } else {
            this.view.setFindText("");
        }

        this.view.focusFind();
    }
    copyInfo() {
        Utility.log(Controller, "copyInfo");
        Utility.enforceTypes(arguments);
        if (this.collection.isEmpty()) return;
        this.copiedInfo = this.view.getDialogValues();
    }
    constructDivFromRange(range) {
        Utility.log(Controller, "constructDivFromRange");
        Utility.enforceTypes(arguments, Range);

        var ele = document.createElement("div");
        $(ele).append(range.extractContents());
        range.deleteContents();
        range.insertNode(ele);
        return ele;
    }
//    applyValuesToEntity(entity, entityValues) {
//        Utility.log(Controller, "applyValuesToEntity");
//        Utility.enforceTypes(arguments, TaggedEntity, EntityValues);
//
//        entity.tagName(entityValues.tagName);
//        entity.link(entityValues.link);
//        if (entityValues.lemma === "") entity.lemma(entity.text());
//        else entity.lemma(entityValues.lemma);
//        if (entityValues.collection !== "") entity.collection(entityValues.collection);
//        this.onChange(this.collection);
//    }
    __validifyTagRange(range) {
        Utility.log(Controller, "__validifyTagRange");

        if (range.collapsed) return false;
//        if (this.__checkForChildTags(range)) return false; /* TODO */

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
            if (i === 100) {
                throw "SANITY CHECK FAILED";
                break;
            }
        }

        return epFlag;
    }
    __checkForChildTags(range) {
        Utility.log(Controller, "__checkForChildTags");
        var flag = false;

        if (!range.commonAncestorContainer.getElementsByTagName) {
            return false;
        }

        var elements = range.commonAncestorContainer.getElementsByTagName("*");

        for (var i = 0; i < elements.length; i++) {
            if (range.intersectsNode(elements[i])) {
                if (elements[i].tagName.toLowerCase() === this.context.htmlLabels.tagged.toLowerCase()) {
                    flag = true;
                }
            }
        }

        return flag;
    }

    selectSameEntities(taggedEntity) {
        Utility.log(Controller, "selectSameEntities");
        Utility.enforceTypes(arguments, TaggedEntity);
    }
    __enableDictionaryUpdate(value) {
        Utility.log(Controller, "__enableDictionaryUpdate");
        Utility.enforceTypes(arguments, Boolean);

        this.dictionaryUpdate = value;
        this.view.enableDictionaryUpdate(value);
    }
    /** setup the value of the add-to-dictionary button
     * If no results are found set button to add.
     * If no results match (lemma, link, tag) set button to update.
     * If any result matches exactly set button to remove.
     */
    pollDictionary(entity) {
        Utility.log(Controller, "pollDictionary");
        Utility.enforceTypes(arguments, [jQuery, TaggedEntity]);

        switch ($(entity).collection()) {
            case "":
                this.view.setDictionaryButton("add");
                break;
            case "custom":
                this.view.setDictionaryButton("remove");
                break;
            default:
                this.view.setDictionaryButton("update");
                break;
        }
    }
    showSearchDialog() {
        Utility.log(Controller, "showSearchDialog");
        Utility.enforceTypes(arguments);

        let tagName = this.view.getDialogValues().tagName;
        let text = this.view.getDialogValues().entity;

        this.dialogs.setQueryTerm(text);
        let tag = this.context.getTagInfo(tagName);
        this.dialogs.showDialog(tag.getName(NameSource.DIALOG));
    }
    __fillDialogsFromCollection() {
        Utility.log(Controller, "__fillDialogsFromCollection");
        Utility.enforceTypes(arguments);

        if (this.collection.isEmpty()) return;

        this.collection.each((e) => {
            if (e.getEntity() !== this.currentEntity) {
                this.currentEntity = "";
                this.view.setEntity("");
            }
            if (e.getLemma() !== this.currentLemma) {
                this.currentLemma = "";
                this.view.setLemma("");
            }
            if (e.getLink() !== this.currentLink) {
                this.currentLink = "";
                this.view.setLink("");
            }
            if (e.getTagName() !== this.currentTagName) {
                this.currentTagName = "";
                this.view.setTagName("");
            }
            if (e.getDictionary() !== this.currentDict) {
                let dictionary = this.context.writeToDictionary();
                this.currentDict = dictionary;
//                this.view.setDictionary(dictionary);
            }
        });
    }
    /* not in unit tests */
    async loadDocument(filename, text, action) {
        Utility.log(Controller, "loadDocument");
        Utility.enforceTypes(arguments, String, String, String);

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

    async __addDictionaryAttribute() {
        Utility.log(Controller, "__addDictionaryAttribute");
        Utility.enforceTypes(arguments);
        /* lookup tags in dictionary */
        $(".taggedentity").each(async (i, ele) => {
            let values = ele.entity.entityValues();
            let collection = await this.dictionary.lookupCollection(values);
            $(ele).attr("data-collection", collection);
        });
    }
    async saveContents() {
        Utility.log(Controller, "saveContents");
        Utility.enforceTypes(arguments, ["optional", Function], ["optional", Function]);

        this.view.showThrobber(true);
        this.unselectAll();
        let contents = "<doc>" + this.model.getDocument() + "</doc>";
        let result = await this.scriber.decode(contents);
        FileOperations.saveToFile(result, this.model.getFilename());
        this.isSaved = true;
        this.view.showThrobber(false);
    }
    search(text, direction) {
        Utility.log(Controller, "search");
        Utility.enforceTypes(arguments, String, String);

        let count = this.searchUtility.search(text);
        if (count === 0) return;

        let r = null;
        if (direction === "next") r = this.searchUtility.next();
        if (direction === "prev") r = this.searchUtility.prev();

        this.unselectAll();
        window.getSelection().addRange(r);
        let parent = r.commonAncestorContainer.parentElement;
        this.view.scrollTo(parent);
        if ($(parent).hasClass("taggedentity")) {
            this.addSelected(parent);
        }
    }
    closeDocument() {
        Utility.log(Controller, "closeDocument");
        Utility.enforceTypes(arguments);
        this.view.clear();
        this.model.reset();
        this.storage.deleteValue("document");
        this.storage.deleteValue("context");
        this.storage.deleteValue("filename");
    }
    goLink() {
        Utility.log(Controller, "goLink");
        Utility.enforceTypes(arguments);
        let url = $("#txtLink").val();
        if (url.length === 0) return;
        if (!url.startsWith("http") && !url.startsWith("https")) {
            url = "http://" + $("#txtLink").val();
        }
        var win = window.open(url, '_blank');
        win.focus();
    }
}