DOCUMENT_POSITION_DISCONNECTED = 1;
DOCUMENT_POSITION_PRECEDING = 2;
DOCUMENT_POSITION_FOLLOWING = 4;
DOCUMENT_POSITION_CONTAINS = 8;
DOCUMENT_POSITION_CONTAINED_BY = 16;
DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32;

/* global selected, model, search, TaggedEntity, this.factory, Utility, trace, cD, Range, DOMException, Function, HTMLDivElement, FileOperations, Storage */

class Translator extends JJJAsyncSocket{
    constructor(view){
        super();
        this.view = view;
        this.phaseName = "";
    }

    phase(phaseName, i, max){
        this.view.setThrobberMessage(phaseName);
        this.phaseName = phaseName;
        this.view.showBaubles(i, max);
        console.log("phase " + i + " of " + max + " " + phaseName);
    }

    step(i, max){
        this.view.showPercent(Math.trunc(i / max * 100));
        console.log("step " + i + " of " + max);
    }
}

class Controller {
    /**
     * @param {View} view
     * @param {Model} model
     * @param {Context} context
     * @param {Storage} storage
     * @returns {Controller}
     */
    constructor(view, model, context, storage) {
        Utility.log(Controller, "constructor");
        Utility.enforceTypes(arguments, View, Model, Context, Storage);

        this.view = view;
        this.model = model;
        this.context = context;
        this.storage = storage;
    }

    async start() {
        Utility.log(Controller, "start");
        Utility.enforceTypes(arguments);

        if (this.storage.hasValue("context-name")) {
            let contextName = this.storage.getValue("context-name");
            this.view.setThrobberMessage("Loading Context...");
            await this.loadContext(contextName);
        }

        this.dialogs = new Dialogs(this);
        this.collection = new Collection();
        this.searchUtility = new SearchUtility("#entityPanel");
        this.searchUtility.setContext(this.context);

        let hostInfo = new HostInfo();
        this.dictionary = new JJJAsyncSocket();
        this.translator = new Translator(this.view);

        this.view.setThrobberMessage("Connecting Dictionary Socket...");
        await this.dictionary.connect(hostInfo.dictionarySocketAddress);

        this.view.setThrobberMessage("Connecting Encoder Socket...");
        await this.translator.connect(hostInfo.translateSocketAddress);

        this.dTimeout = null;
        this.copiedInfo = null;
        this.isSaved = false;

        return this;
    }
    /* active model changers */
    async updateAllSelected(dialogValues) {
        Utility.log(Controller, "updateAllSelected");
        Utility.enforceTypes(arguments, Object);

        this.collection.$().entityTag(dialogValues.tagName);
        this.collection.$().text(dialogValues.entity);
        this.collection.$().lemma(dialogValues.lemma);
        this.collection.$().link(dialogValues.link);

        this.model.setupTaggedEntity(this.collection.$());

        this.view.setSearchText("");
        this.searchUtility.reset();
        this.pollDialogs();
        await this.pollDictionary(this.collection.getLast());
        this.model.saveState();
    }
    pasteInfo() {
        Utility.log(Controller, "pasteInfo");
        Utility.enforceTypes(arguments);
        if (this.copiedInfo === null || this.collection.isEmpty()) return;
        this.model.setEntityValues(this.collection.$(), this.copiedInfo);
        this.model.setupTaggedEntity(this.collection.$());
        this.view.setDialogs(this.collection.getLast());
        this.view.setSearchText("");
        this.searchUtility.reset();
        this.isSaved = false;
        this.model.saveState();
    }
    mergeSelectedEntities() {
        Utility.log(Controller, "mergeSelectedEntities");
        Utility.enforceTypes(arguments);

        try {
            var ele = this.collection.$().mergeElements();
        } catch (error) {
            this.view.showUserMessage(error.message);
            return;
        }

        $(ele).attr($.fn.xmlAttr.defaults.attrName, "{}");
        $(ele).addClass("taggedentity");
        this.model.setEntityValues($(ele), this.view.getDialogs());
        this.model.setupTaggedEntity($(ele));
        this.collection.clear();
        this.addSelected(ele[0]);

        this.model.saveState();
        this.view.setSearchText("");
        this.searchUtility.reset();
        this.isSaved = false;

        this.view.tagnameManager.resetTagnames();
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
        let tagName = this.view.getDialogs().tagName;

        if (!this.context.schema.isValid(range.commonAncestorContainer, tagName)) {
            this.view.showUserMessage(`Tagging "${tagName}" is not valid in the Schema at this location.`);
            return;
        }

        let taggedEntity = this.__constructEntityFromRange(range, tagName);
        let values = await this.fillValues(taggedEntity, {tagName: tagName, lemma: $(taggedEntity).text(), link: ""});

        this.model.setEntityValues(taggedEntity, values);
        this.model.setupTaggedEntity(taggedEntity);
        selection.removeAllRanges();
        document.normalize();
        this.addSelected(taggedEntity);
        this.model.saveState();
        this.isSaved = false;
        this.view.showUserMessage(`New "${tagName}" entity created.`);
        this.view.setSearchText("");
    }

    /**
     *  Use when a new entity is created, (currently only with tagSelectedRange)
     *  Fills in the entity values with those from the dictionary.
     *  The default values are given with "values".  Preference will be givent to
     *  the 'custom' dictionary, otherwise dictionary preference is undefined.
     *  Returns the filled values;
     * @param {type} entity The taggedentity element in question.
     * @param {type} values Default values;
     * @returns {unresolved}
     */
    async fillValues(entity, values) {
        Utility.log(Controller, "fillValues");
        Utility.enforceTypes(arguments, HTMLDivElement, Object);

        let rows = await this.dictionary.getEntities($(entity).text());

        for (let row of rows) {
            values.tagName = this.context.getTagInfo(row.tag).name;
            values.lemma = row.lemma;
            values.link = row.link;
            $(entity).attr("data-dictionary", row.collection);
            if (row.collection === "custom") break;
        }

        return values;
    }

    untagAll() {
        Utility.log(Controller, "untagAll");
        Utility.enforceTypes(arguments);

        if (this.collection.isEmpty()) return new Response(false, "");

        let count = this.collection.size();
        this.collection.$().each((i, ele) => this.view.tagnameManager.clearTagnameElement(ele));
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

    /* other */
    setListener(listener) {
        Utility.log(Controller, "setListener");
        Utility.enforceTypes(arguments, Listeners);
        this.listener = listener;
    }
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

        let entity = this.collection.getLast();
        let text = $(entity).text();
        let lemma = $(entity).lemma();
        let link = $(entity).link();
        let entityTag = $(entity).entityTag();
        let collection = "custom";

        await this.dictionary.addEntity(text, lemma, link, entityTag, collection);
        this.view.setDictionary("custom");
        this.view.setDictionaryButton("remove");
    }
    async dictRemove() {
        Utility.log(Controller, "dictRemove");
        Utility.enforceTypes(arguments);

        if (this.collection.isEmpty()) return;
        let entity = this.collection.getLast();
        let text = $(entity).text();
        await this.dictionary.deleteEntity(text, "custom");
        await this.pollDictionary(this.collection.getLast());
        $(this.collection.getLast()).removeAttr("data-dictionary");
    }
    async dictUpdate() {
        Utility.log(Controller, "dictUpdate");
        Utility.enforceTypes(arguments);

        if (this.collection.isEmpty()) return;
        let entity = this.collection.getLast();
        let text = $(entity).text();
        let lemma = $(entity).lemma();
        let link = $(entity).link();
        let entityTag = $(entity).entityTag();
        let collection = "custom";

        await this.dictionary.addEntity(text, lemma, link, entityTag, collection);
        this.view.setDictionary("custom");
        this.view.setDictionaryButton("remove");
    }
    copyData(entityFrom, entityTo) {
        Utility.log(Controller, "addSelected");
        Utility.enforceTypes(arguments, HTMLDivElement, HTMLDivElement);

        entityTo.setLemma(entityFrom.getLemma());
        entityTo.setLink(entityFrom.getLink());
        entityTo.setTagName(entityFrom.getTagName());

        this.isSaved = false;
        return new Response(true, `Entity data copied`);
    }
    /**
     * Set the list of selected entities to a single entity.
     * @param {type} taggedEntity
     * @returns {undefined}
     */
    setSelected(taggedEntity) {
        Utility.log(Controller, "setSelected");
        Utility.enforceTypes(arguments, HTMLDivElement);

        this.collection.$().removeClass("selected");
        this.collection.clear();
        this.collection.add(taggedEntity);
        $(taggedEntity).addClass("selected");
        this.view.setDialogFade(false);
        this.setDialogs(taggedEntity, 0);
    }
    addSelected(taggedEntity) {
        Utility.log(Controller, "addSelected");
        Utility.enforceTypes(arguments, HTMLDivElement);

        this.collection.add(taggedEntity);
        $(taggedEntity).addClass("selected");
        this.view.setDialogFade(false);
        this.setDialogs(taggedEntity, 0);
    }
    toggleSelect(taggedEntity) {
        Utility.log(Controller, "toggleSelect");
        Utility.enforceTypes(arguments, HTMLDivElement);

        if (!this.collection.contains(taggedEntity)) {
            this.collection.add(taggedEntity);
            $(taggedEntity).addClass("selected");
            this.addSelected(taggedEntity);
            this.view.setDialogFade(false);
        } else {
            this.collection.remove(taggedEntity);
            $(taggedEntity).removeClass("selected");
            if (this.collection.isEmpty()) this.view.setDialogFade(true);
        }
    }
    unselectAll() {
        Utility.log(Controller, "unselectAll");
        Utility.enforceTypes(arguments);

        window.getSelection().removeAllRanges();
        this.collection.$().removeClass("selected");
        this.collection.clear();
        this.view.setDialogFade(true);
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
        this.copiedInfo = this.view.getDialogs();
    }
    async setDialogs(taggedEntity, delay) {
        Utility.log(Controller, "setDialogs");
        Utility.enforceTypes(arguments, HTMLDivElement, ["optional", Number]);
        if (typeof delay === "undefined") delay = 0;

        this.view.setDialogs(taggedEntity);
        await this.pollDictionary(taggedEntity);
        this.pollDialogs();
    }
    /* Set the BG of the entity dialog componets if not all of the collection */
    /* match on the respective value.                                         */
    pollDialogs() {
        Utility.log(Controller, "pollDialogs");
        Utility.enforceTypes(arguments);

        let first = this.collection.getFirst();
        this.view.clearDialogBG();

        this.collection.each((entity) => {
            if ($(entity).lemma() !== $(first).lemma()) this.view.setDialogBG("lemma");
            if ($(entity).link() !== $(first).link()) this.view.setDialogBG("link");
            if ($(entity).text() !== $(first).text()) this.view.setDialogBG("text");
            if ($(entity).entityTag() !== $(first).entityTag()) this.view.setDialogBG("tag");
        });
    }
    __constructEntityFromRange(range, tagName) {
        Utility.log(Controller, "__constructEntityFromRange");
        Utility.enforceTypes(arguments, Range, String);

        if (!this.__validifyTagRange(range)) return false;
        range = this.__trimRange(range);

        let contents = range.extractContents();
        var ele = document.createElement("div");

        $(ele).addClass("taggedentity");
        $(ele).attr($.fn.xmlAttr.defaults.attrName, "{}");
        $(ele).attr($.fn.xmlAttr.defaults.xmlTagName, tagName);
        $(ele).append(contents);
        $(ele).lemma($(ele).text());

        range.deleteContents();
        range.insertNode(ele);
        this.setDialogs(ele, 0);

        /* TODO set identifier */

        this.isSaved = false;
        return ele;
    }
    __validifyTagRange(range) {
        Utility.log(Controller, "__validifyTagRange");
        Utility.verifyArguments(arguments, 1);

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
    /* If no results are found set button to add.
     * If no results match (lemma, link, tag) set button to update.
     * If any result matches exactly set button to remove.
     */
    async pollDictionary(entity) {
        Utility.log(Controller, "pollDictionary");
        Utility.enforceTypes(arguments, HTMLDivElement);

        this.view.setDictionaryButton("none");
        $(entity).removeAttr("data-dictionary");
        this.view.setDictionary("");

        let rows = await this.dictionary.getEntities($(entity).text());

        if (rows.length === 0) {
            this.view.setDictionaryButton("add");
        } else {
            let dictTag = this.context.getTagInfo($(entity).entityTag()).dictionary;
            for (let row of rows) {
                if (row.lemma === $(entity).lemma() && row.link === $(entity).link() && row.tag === dictTag) {
                    $(entity).attr("data-dictionary", row.collection);
                    if (row.collection === "custom") break;
                }
            }
            if (typeof $(entity).attr("data-dictionary") === "undefined") {
                this.view.setDictionaryButton("add");
                for (let row of rows) {
                    if (row.collection === "custom") {
                        this.view.setDictionaryButton("update");
                        break;
                    }
                }
            } else {
                this.view.setDictionary($(entity).attr("data-dictionary"));
                if ($(entity).attr("data-dictionary") !== "custom") this.view.setDictionaryButton("add");
                else this.view.setDictionaryButton("remove");
            }
        }
    }
    showSearchDialog() {
        Utility.log(Controller, "showSearchDialog");
        Utility.enforceTypes(arguments);

        let tagName = this.view.getDialogs().tagName;
        let text = this.view.getDialogs().entity;

        this.dialogs.setQueryTerm(text);
        let tag = this.context.getTagInfo(tagName);
        this.dialogs.showDialog(tag.dialog);
    }
    __fillDialogsFromCollection() {
        Utility.log(Controller, "__fillDialogsFromCollection");
        Utility.enforceTypes(arguments);

        if (this.collection.isEmpty()) return;

        let e = this.collection.getFirst();
        this.setDialogs(e, 0);

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
                this.view.setDictionary(dictionary);
            }
        });
    }
    /* not in unit tests */
    async loadDocument(filename, text) {
        Utility.log(Controller, "loadDocument");
        Utility.enforceTypes(arguments, String, String);

        this.view.showThrobber(true);
        this.view.setThrobberMessage("Loading Document");

        let encoded = await this.translator.encode(text);
        this.model.setDocument(encoded, filename);
        this.view.tagnameManager.pollDocument();
        let schemaPath = $(`[xmltagname="xml-model"]`).xmlAttr("href");

        if (typeof schemaPath === "string") {
            let split = schemaPath.split("/");
            switch (split[split.length - 1]) {
                case "orlando_biography_v2.rng":
                    await this.loadContext("orlando");
                    break;
                case "cwrc_entry.rng":
                    await this.loadContext("cwrc");
                    break;
                case "cwrc_tei_lite.rng":
                    await this.loadContext("tei");
                    break;
            }
        }

        this.model.setupTaggedEntity($(".taggedentity"));
        this.isSaved = true;
        this.view.clearThrobber();
        setTimeout(() => this.view.tagnameManager.resetTagnames(), 500);
        this.view.showThrobber(false);
    }

    async loadContext(contextName) {
        let url = "resources/" + contextName.toLowerCase() + ".context.json";
        this.storage.setValue("context-name", contextName);

        try {
            let jsonText = await FileOperations.loadFromServer(url);
            let json = JSON.parse(jsonText);
            await this.context.load(json);
            this.storage.setValue("context-name", this.context.name);
            this.view.notifyContextChange();
        } catch (error) {
            window.alert("Unable to create context object : " + status);
            console.log(error);
        }
    }

    async saveContents() {
        Utility.log(Controller, "saveContents");
        Utility.enforceTypes(arguments, ["optional", Function], ["optional", Function]);

        this.view.showThrobber(true);
        this.unselectAll();
        let contents = "<doc>" + this.model.getDocument() + "</doc>";
        let result = await this.translator.decode(contents);
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
    }
    goLink() {
        Utility.log(Controller, "goLink");
        Utility.enforceTypes(arguments);
        let url = $("#txtLink").val();
        if (!url.startsWith("http") && !url.startsWith("https")) {
            url = "http://" + $("#txtLink").val();
        }
        var win = window.open(url, '_blank');
        win.focus();
    }
}