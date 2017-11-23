DOCUMENT_POSITION_DISCONNECTED = 1;
DOCUMENT_POSITION_PRECEDING = 2;
DOCUMENT_POSITION_FOLLOWING = 4;
DOCUMENT_POSITION_CONTAINS = 8;
DOCUMENT_POSITION_CONTAINED_BY = 16;
DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32;

/* global selected, model, search, TaggedEntity, this.factory, Utility, trace, cD, Range, DOMException, Function, HTMLDivElement, FileOperations, Storage, EntityValues */

class Controller {
    /**
     * @param {View} view
     * @param {Model} model
     * @param {Context} context
     * @param {Storage} storage
     * @returns {Controller}
     */
    constructor(view, model) {
        Utility.log(Controller, "constructor");
        Utility.enforceTypes(arguments, View, Model);

        this.view = view;
        this.model = model;
        this.storage = new Storage("NERVE_CONTROLLER");
    }
    async start() {
        Utility.log(Controller, "start");
        Utility.enforceTypes(arguments);

        this.dialogs = new Dialogs(this);
        this.collection = new Collection();
        this.collection.addListener(this);
        this.searchUtility = new SearchUtility("#entityPanel");

        let hostInfo = new HostInfo();

        this.view.setThrobberMessage("Connecting Dictionary Socket...");
        this.dictionary = new Dictionary();
        await this.dictionary.connect(hostInfo.dictionarySocketAddress);

        this.view.setThrobberMessage("Connecting Scriber Socket...");
        this.scriber = new Scriber();
        await this.scriber.connect(hostInfo.scriberSocketAddress);
        this.scriber.setView(this.view);

        if (this.storage.hasValue("document")){
            this.onLoad();
        }

        this.dTimeout = null;
        this.copiedInfo = null;
        this.isSaved = false;

        return this;
    }
    /**
     * Listener for collection change events;
     * @param {type} collection
     * @returns {undefined}
     */
    onChange(collection) {
        Utility.log(Controller, "onChange");
        Utility.enforceTypes(arguments, Collection);

        $(".taggedentity").removeClass("selected");

        if (collection.isEmpty()) {
            this.view.clearDialogs();
            this.view.setDialogFade(true);
        } else {
            this.view.setDialogFade(false);
            let values = EntityValues.extract(collection.getLast());
            this.view.setDialogs(values);
            this.pollDialogs();
            this.pollDictionary(collection.getLast());
        }

        collection.$().addClass("selected");
    }
    /* active model changers */

    /**
     * Set the values of all selected tagged entities to 'dialogValues'.
     * This is triggered by the dialog box and cwrc dialogs.
     */
    async updateAllSelected(dialogValues) {
        Utility.log(Controller, "updateAllSelected");
        Utility.enforceTypes(arguments, EntityValues);

        for (let e of this.collection) {
            this.applyValuesToEntity(e, dialogValues);
        }

        this.view.setSearchText("");
        this.searchUtility.reset();
        this.model.saveState();
    }
    pasteInfo() {
        Utility.log(Controller, "pasteInfo");
        Utility.enforceTypes(arguments);
        if (this.copiedInfo === null || this.collection.isEmpty()) return;

        for (let e of this.collection) {
            this.applyValuesToEntity(e, this.copiedInfo);
        }

        this.onChange(this.collection);
        this.model.saveState();
    }
    mergeSelectedEntities() {
        Utility.log(Controller, "mergeSelectedEntities");
        Utility.enforceTypes(arguments);

        if (this.collection.size() < 2) return;
        for (let ele of this.collection) this.view.tagnameManager.clearTagnameElement(ele);
        var ele = this.collection.$().mergeElements();
        let values = this.view.getDialogValues();
        this.applyValuesToEntity(ele, values);
        this.collection.set(ele);
        this.model.saveState();
    }
    async tagSelectedRange() {
        Utility.log(Controller, "tagSelectedRange");
        Utility.enforceTypes(arguments);

        let selection = window.getSelection();
        if (selection.rangeCount === 0) {
            this.view.showUserMessage("No text selected");
            return;
        }

        let range = selection.getRangeAt(0);
        range = this.__trimRange(range);
        let tagName = this.view.getDialogValues().tagName;

        if (!this.schema.isValid(range.commonAncestorContainer, tagName)) {
            this.view.showUserMessage(`Tagging "${tagName}" is not valid in the Schema at this location.`);
            return;
        }

        let values = await this.dictionary.pollEntity(range.toString());
        if (values === null) values = this.view.getDialogValues();

        let taggedElement = this.constructDivFromRange(range);
        this.applyValuesToEntity(taggedElement, values);

        selection.removeAllRanges();
        document.normalize();
        this.collection.set(taggedElement);
        this.model.saveState();
        this.isSaved = false;
        this.view.showUserMessage(`New "${tagName}" entity created.`);
        this.view.setSearchText("");
    }
    untagAll() {
        Utility.log(Controller, "untagAll");
        Utility.enforceTypes(arguments);

        if (this.collection.isEmpty()) return;

        let count = this.collection.size();
        for (let ele of this.collection) this.view.tagnameManager.clearTagnameElement(ele);
        this.collection.$().contents().unwrap();
        this.view.clearDialogs();
        this.view.setDialogFade(true);
        document.normalize();

        this.isSaved = false;
        this.model.saveState();
        this.view.showUserMessage(count + " entit" + (count === 1 ? "y" : "ies") + " untagged");
        this.view.setSearchText("");
        this.searchUtility.reset();
    }
    revertState() {
        Utility.log(Controller, "revertState");
        Utility.enforceTypes(arguments);

        this.unselectAll();
        this.model.revertState();
        this.view.tagnameManager.resetTagnames();
    }
    advanceState() {
        Utility.log(Controller, "advanceState");
        Utility.enforceTypes(arguments);

        this.unselectAll();
        this.model.advanceState();
        this.view.tagnameManager.resetTagnames();
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
        this.view.showUserMessage(count + " entit" + (count === 1 ? "y" : "ies") + " selected");
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
        Utility.enforceTypes(arguments, HTMLDivElement);
        this.collection.set(taggedEntity);
    }
    addSelected(taggedEntity) {
        Utility.log(Controller, "addSelected");
        Utility.enforceTypes(arguments, HTMLDivElement);
        this.collection.add(taggedEntity);
    }
    toggleSelect(taggedEntity) {
        Utility.log(Controller, "toggleSelect");
        Utility.enforceTypes(arguments, HTMLDivElement);

        if (!this.collection.contains(taggedEntity)) {
            this.collection.add(taggedEntity);
        } else {
            this.collection.remove(taggedEntity);
        }
    }
    unselectAll() {
        Utility.log(Controller, "unselectAll");
        Utility.enforceTypes(arguments);
        window.getSelection().removeAllRanges();
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
    /* Set the BG of the entity dialog componets if not all of the collection */
    /* match on the respective value.                                         */
    pollDialogs() {
        Utility.log(Controller, "pollDialogs");
        Utility.enforceTypes(arguments);

        let first = this.collection.getFirst();
        this.view.clearDialogBG();
        for (let entity of this.collection) {
            if ($(entity).lemma() !== $(first).lemma()) this.view.setDialogBG("lemma");
            if ($(entity).link() !== $(first).link()) this.view.setDialogBG("link");
            if ($(entity).text() !== $(first).text()) this.view.setDialogBG("text");
            if ($(entity).entityTag() !== $(first).entityTag()) this.view.setDialogBG("tag");
        }
        ;
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
    applyValuesToEntity(ele, entityValues) {
        Utility.log(Controller, "applyValuesToEntity");
        Utility.enforceTypes(arguments, [Element, jQuery], EntityValues);

        $(ele).addClass("taggedentity");
        if (entityValues.entity !== "") $(ele).text(entityValues.entity);
        $(ele).entityTag(entityValues.tagName);
        $(ele).link(entityValues.link);
        if (entityValues.lemma === "") $(ele).lemma($(ele).text());
        else $(ele).lemma(entityValues.lemma);
        if (entityValues.collection !== "") $(ele).collection(entityValues.collection);
        this.onChange(this.collection);
    }
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
    __trimRange(range) {
        Utility.log(Controller, "__trimRange");
        while (range.toString().charAt(range.toString().length - 1) === ' ') {
            range.setEnd(range.endContainer, range.endOffset - 1);
        }

        while (range.toString().charAt(0) === ' ') {
            range.setStart(range.startContainer, range.startOffset + 1);
        }

        return range;
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
        Utility.enforceTypes(arguments, [jQuery, HTMLDivElement]);

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
    async loadDocument(filename, text) {
        Utility.log(Controller, "loadDocument");
        Utility.enforceTypes(arguments, String, String);

        this.view.showThrobber(true);
        this.view.setThrobberMessage("Loading Document");

        let encodeResponse = await this.scriber.encode(text);
        encodeResponse.setFilename(filename);

        this.onLoad(encodeResponse.text, encodeResponse.context, encodeResponse.filename, encodeResponse.schemaURL);

        this.isSaved = true;
        this.view.clearThrobber();
        setTimeout(() => this.view.tagnameManager.pollDocument(), 500);
        this.view.showThrobber(false);
    }

    /* call when the program starts and when a document is loaded */
    async onLoad(text, context, filename, schemaURL) {
        Utility.log(Controller, "onLoad");

        if (typeof text !== "undefined"){
            this.storage.setValue("document", text);
            this.storage.setValue("context", context);
            this.storage.setValue("filename", filename);
            this.storage.setValue("schemaURL", schemaURL);
        } else {
            text = this.storage.getValue("document");
            context = this.storage.getValue("context");
            filename = this.storage.getValue("filename");
            schemaURL = this.storage.getValue("schemaURL");
        }

        this.schema = new Schema();
        await this.schema.load(schemaURL);

        this.view.notifyContextChange(context);
        $.fn.xmlAttr.defaults.context = context;
        this.context = context;
        this.model.setDocument(text, filename);

        this.onChange(this.collection);
        await this.__addDictionaryAttribute();
    }

    async __addDictionaryAttribute() {
        Utility.log(Controller, "__addDictionaryAttribute");
        Utility.enforceTypes(arguments);
        /* lookup tags in dictionary */
        $(".taggedentity").each(async (i, ele) => {
            let values = EntityValues.extract(ele);
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