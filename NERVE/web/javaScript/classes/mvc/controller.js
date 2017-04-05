DOCUMENT_POSITION_DISCONNECTED = 1;
DOCUMENT_POSITION_PRECEDING = 2;
DOCUMENT_POSITION_FOLLOWING = 4;
DOCUMENT_POSITION_CONTAINS = 8;
DOCUMENT_POSITION_CONTAINED_BY = 16;
DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32;

/* global selected, model, search, TaggedEntity, this.factory, Utility, trace, cD, Range, DOMException, Function, HTMLDivElement */
/* (^[ ]+)([a-zA-z]+)(\(.*\)[ ]?\{) */
/* $1$2$3\nUtility.log(Events, "$2"); */

class Controller {
    /**
     * @param {View} view
     * @param {Model} model
     * @param {FileOperations} fileOps
     * @param {ContextLoader} loader
     * @returns {Controller}
     */
    constructor(view, model, fileOps, loader) {
        Utility.log(Controller, "constructor");
        Utility.enforceTypes(arguments, View, Model, FileOperations, ContextLoader);

        this.view = view;
        this.model = model;
        this.fileOps = fileOps;
        this.contextLoader = loader;

        this.dialogs = new Dialogs(this);
        this.selected = new Collection();
        this.dictionary = new Dictionary();
        this.settings = new Storage("controller");
        this.searchUtility = new SearchUtility("#entityPanel");

        this.dTimeout = null;
        this.copiedInfo = null;
        this.isSaved = false;
    }

    /* active model changers */
    pasteInfo(){
        Utility.log(Controller, "pasteInfo");
        Utility.enforceTypes(arguments);
        if (this.copiedInfo === null || this.selected.isEmpty()) return;
        this.model.setEntityValues(this.selected.$(), this.copiedInfo);
        this.model.setupTaggedEntity(this.selected.$());
        this.view.setDialogs(this.selected.getLast());
        this.view.setSearchText("");
        this.searchUtility.reset();
        this.isSaved = false;
        this.model.saveState();
    }

    mergeSelectedEntities() {
        Utility.log(Controller, "mergeSelectedEntities");
        Utility.enforceTypes(arguments);

        try{
            var ele = this.selected.$().mergeElements();
        } catch (error){
            this.view.showUserMessage(error.message);
            return;
        }

        $(ele).attr($.fn.xmlAttr.defaults.attrName, "{}");
        $(ele).addClass("taggedentity");
        this.model.setEntityValues($(ele), this.view.getDialogs());
        this.model.setupTaggedEntity($(ele));
        this.selected.clear();
        this.addSelected(ele[0]);

        this.model.saveState();
        this.view.setSearchText("");
        this.searchUtility.reset();
        this.isSaved = false;
    }

    tagSelectedRange() {
        Utility.log(Controller, "tagSelectedRange");
        Utility.enforceTypes(arguments);

        let selection = window.getSelection();
        if (selection.rangeCount === 0) return new Response(false, "No text selected");
        let range = selection.getRangeAt(0);
        let tagName = this.view.getDialogs().tagName;

        if (!this.context.schema.isValid(range.commonAncestorContainer, tagName)){
            let message = `Tagging "${tagName}" is not valid in the Schema at this location.`;
            this.view.showUserMessage(message);
            return;
        }

        let taggedEntity = this.__constructEntityFromRange(range, tagName);

        let callback = (values)=>{
            this.model.setEntityValues(taggedEntity, values);
            this.model.setupTaggedEntity(taggedEntity);
            selection.removeAllRanges();
            document.normalize();
            this.addSelected(taggedEntity);
            this.model.saveState();
            this.isSaved = false;
            this.view.showUserMessage(`New "${tagName}" entity created.`);
            this.view.setSearchText("");
//            this.searchUtility.reset();
        };
        this.getValues(taggedEntity, {tagName:tagName, lemma:$(taggedEntity).text(), link:""}, callback);
    }

    /**
     *  Use when a new entity is created, currently only with tagSelectedRange
     *  Fills in the entity values with those from the dictionary.
     *  The default values are given with "values".
     **/
    getValues(entity, values, callback){
        Utility.log(Controller, "getValues");
        Utility.enforceTypes(arguments, HTMLDivElement, Object, Function);

        this.dictionary.getEntities(entity, (rows) => {
            for (let row of rows) {
                values.tagName = this.context.getTagInfo(row.tag).name;
                values.lemma = row.lemma;
                values.link = row.link;
                $(entity).attr("data-dictionary", row.collection);
                if (row.collection === "custom") break;
            }
            callback(values);
        });
    }

    untagAll() {
        Utility.log(Controller, "untagAll");
        Utility.enforceTypes(arguments);

        if (this.selected.isEmpty()) return new Response(false, "");

        let count = this.selected.size();
        this.selected.$().contents().unwrap();
        this.view.clearDialogs();
        this.view.setDialogFade(true);
        document.normalize();

        this.isSaved = false;
        this.model.saveState();
        this.view.showUserMessage(count + " entit" + (count === 1 ? "y" : "ies") + " untagged");
        this.view.setSearchText("");
        this.searchUtility.reset();
    }

/* end of active model control */

    notifyDialogInput(dialog) {
        Utility.log(Controller, "notifyDialogInput");
        Utility.enforceTypes(arguments, String);

        let dialogValues = this.view.getDialogs();
        switch (dialog) {
            case "tag":
                this.selected.$().entityTag(dialogValues.tagName);
                break;
            case "text":
                this.selected.$().text(dialogValues.entity);
                break;
            case "lemma":
                this.selected.$().lemma(dialogValues.lemma);
                break;
            case "link":
                this.selected.$().link(dialogValues.link);
                break;
        }

        this.view.setSearchText("");
        this.searchUtility.reset();
        this.pollDialogs();
        this.pollDictionaryDelayed(this.selected.getLast(), 500);
    }

    /* other */
    setEventHandler(events) {
        Utility.log(Controller, "setEventHandler");
        Utility.enforceTypes(arguments, Events);
        this.dialogs = new Dialogs(this, events);
    }

    setListener(listener) {
        Utility.log(Controller, "setListener");
        Utility.enforceTypes(arguments, Listeners);
        this.listener = listener;
    }

    selectLikeEntitiesByLemma(){
        Utility.log(Controller, "selectLikeEntitiesByLemma");
        Utility.enforceTypes(arguments);

        if (this.selected.isEmpty()) return;
        let lastEle = this.selected.getLast();
        if (typeof $(lastEle).lemma() === "undefined") return;

        $(".taggedentity").each((i, ele)=>{
            if ($(ele).lemma() === $(lastEle).lemma()){
                this.selected.add(ele);
                $(ele).addClass("selected");
            }
        });

        this.pollDialogs();
        let count = this.selected.size();
        this.view.showUserMessage(count + " entit" + (count === 1 ? "y" : "ies") + " selected");
    }

    dictAdd(){
        Utility.log(Controller, "dictAdd");
        Utility.enforceTypes(arguments);
        if (this.selected.isEmpty()) return;
        this.dictionary.addEntity(this.selected.getLast());
        this.view.setDictionary("custom");
        this.view.setDictionaryButton("remove");
    }

    dictRemove(){
        Utility.log(Controller, "dictRemove");
        Utility.enforceTypes(arguments);
        if (this.selected.isEmpty()) return;
        this.dictionary.removeEntity(this.selected.getLast());
        this.pollDictionary(this.selected.getLast());
        $(this.selected.getLast()).removeAttr("data-dictionary");
    }

    dictUpdate(){
        Utility.log(Controller, "dictUpdate");
        Utility.enforceTypes(arguments);
        if (this.selected.isEmpty()) return;
        this.dictionary.addEntity(this.selected.getLast());
        this.view.setDictionary("custom");
        this.view.setDictionaryButton("remove");
    }

    copyData(entityFrom, entityTo){
        Utility.log(Controller, "addSelected");
        Utility.enforceTypes(arguments, HTMLDivElement, HTMLDivElement);

        entityTo.setLemma(entityFrom.getLemma());
        entityTo.setLink(entityFrom.getLink());
        entityTo.setTagName(entityFrom.getTagName());

        this.isSaved = false;
        return new Response(true, `Entity data copied`);
    }

    setSelected(taggedEntity) {
        Utility.log(Controller, "setSelected");
        Utility.enforceTypes(arguments, HTMLDivElement);

        this.selected.$().removeClass("selected");
        this.selected.clear();
        this.selected.add(taggedEntity);
        $(taggedEntity).addClass("selected");
        this.view.setDialogFade(false);
        this.setDialogs(taggedEntity, 0);
    }

    addSelected(taggedEntity) {
        Utility.log(Controller, "addSelected");
        Utility.enforceTypes(arguments, HTMLDivElement);

        this.selected.add(taggedEntity);
        $(taggedEntity).addClass("selected");
        this.view.setDialogFade(false);
        this.setDialogs(taggedEntity, 0);
    }

    toggleSelect(taggedEntity) {
        Utility.log(Controller, "toggleSelect");
        Utility.enforceTypes(arguments, HTMLDivElement);

        if (!this.selected.contains(taggedEntity)){
            this.selected.add(taggedEntity);
            $(taggedEntity).addClass("selected");
            this.addSelected(taggedEntity);
            this.view.setDialogFade(false);
        }
        else{
            this.selected.remove(taggedEntity);
            $(taggedEntity).removeClass("selected");
            if (this.selected.isEmpty()) this.view.setDialogFade(true);
        }
    }

    unselectAll() {
        Utility.log(Controller, "unselectAll");
        Utility.enforceTypes(arguments);

        this.selected.$().removeClass("selected");
        this.selected.clear();
        this.view.setDialogFade(true);
    }

    fillFind() {
        Utility.log(Controller, "fillFind");
        Utility.enforceTypes(arguments);

        let selection = window.getSelection();
        if (selection.rangeCount !== 0 && window.getSelection().getRangeAt(0).toString().trim() !== ""){
            console.log("a");
            let text = window.getSelection().getRangeAt(0).toString().trim();
            this.view.setFindText(text);
            this.search(text, "next");
        }
        else if (!this.selected.isEmpty()){
            console.log("b");
            let last = this.selected.getLast();
            this.view.setFindText($(last).text());
            this.search($(last).text(), "next");
        } else {
            this.view.setFindText("");
        }

        this.view.focusFind();
    }

    copyInfo(){
        Utility.log(Controller, "copyInfo");
        Utility.enforceTypes(arguments);
        if (this.selected.isEmpty()) return;
        this.copiedInfo = this.view.getDialogs();
    }

    setDialogs(taggedEntity, delay) {
        Utility.log(Controller, "setDialogs");
        Utility.enforceTypes(arguments, HTMLDivElement, ["optional", Number]);
        if (typeof delay === "undefined") delay = 0;

        this.view.setDialogs(taggedEntity);
        this.pollDictionary(taggedEntity);
        this.pollDialogs();
    }

    /* check the dialogs and see if they match all the entities selected,     */
    /* update view accordingly.                                               */
    pollDialogs(){
        Utility.log(Controller, "pollDialogs");
        Utility.enforceTypes(arguments);

        let flagLemma = true;
        let flagLink = true;
        let flagText = true;
        let flagTag = true;
        let first = this.selected.getFirst();

        this.selected.each((entity)=>{
            if ($(entity).lemma() !== $(first).lemma()) flagLemma = false;
            if ($(entity).link() !== $(first).link()) flagLink = false;
            if ($(entity).text() !== $(first).text()) flagText = false;
            if ($(entity).entityTag() !== $(first).entityTag()) flagTag = false;
        });

        this.view.clearDialogBG();
        if (!flagLemma) this.view.setDialogBG("lemma");
        if (!flagLink) this.view.setDialogBG("link");
        if (!flagText) this.view.setDialogBG("text");
        if (!flagTag) this.view.setDialogBG("tag");

        return flagLemma && flagLink && flagText && flagTag;
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
            if (i === 100){
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
    /*
     * Load a context from the sever, set the model and factory contexts
     * @param {type} contextName
     * @param {type} success
     * @param {type} failure
     * @returns {undefined}
     */
    loadContext(contextName, success = function() {}, failure = function(){}) {
        Utility.log(Controller, "loadContext");
        Utility.enforceTypes(arguments, String, ["optional", Function], ["optional", Function]);
        this.contextLoader.loadContext(contextName, success, failure);
    }

    setContext(context){
        Utility.log(Controller, "setContext");
        Utility.enforceTypes(arguments, Context);
        this.context = context;
        this.dictionary.setContext(context);
        this.searchUtility.setContext(context);
    }

    __enableDictionaryUpdate(value) {
        Utility.log(Controller, "__enableDictionaryUpdate");
        Utility.enforceTypes(arguments, Boolean);

        this.dictionaryUpdate = value;
        this.view.enableDictionaryUpdate(value);
    }

    pollDictionaryDelayed(entity, delay){
        if (this.dTimeout !== null) clearTimeout(this.dTimeout);
        this.dTimeout = setTimeout(()=>{
            this.pollDictionary(entity);
        }, delay);
    }

   /* If no results are found set button to add.
    * If no results match (lemma, link, tag) set button to update.
    * If any result matches exactly set button to remove.
    */
    pollDictionary(entity) {
        Utility.log(Controller, "pollDictionary");
        Utility.enforceTypes(arguments, HTMLDivElement);
        this.view.setDictionaryButton("none");
        $(entity).removeAttr("data-dictionary");
        this.view.setDictionary("");

        this.dictionary.getEntities(entity, (rows) => {
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
                        if (row.collection === "custom"){
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
        });
    }

    /* not in unit tests */
    showSearchDialog() {
        Utility.log(Controller, "showSearchDialog");
        Utility.enforceTypes(arguments);

        this.dialogs.setQueryTerm(this.currentEntity);
        let tag = this.context.getTagInfo(this.currentTagName);
        this.dialogs.showDialog(tag.dialog);
    }
    find() {
        Utility.log(Controller, "find");
        Utility.enforceTypes(arguments);
//
//        let count = 0;
//        let value = this.view.getSearchTerm();
//        if (value !== "") {
//
//            this.factory.forEach((e) => {
//                if (e.getEntity() === value) {
//                    e.markupSelect();
//                    this.selected.add(e);
//                    count++;
//                }
//            });
//        }
//
//        this.__fillDialogsFromCollection();
//        return new Response(true, `${count} instance${count > 1 ? "s" : ""} of "${value}" selected`);
    }
    __fillDialogsFromCollection() {
        Utility.log(Controller, "__fillDialogsFromCollection");
        Utility.enforceTypes(arguments);

        if (this.selected.isEmpty()) return;

        let e = this.selected.getFirst();
        this.setDialogs(e, 0);

        this.selected.each((e) => {
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
    loadDocument(){
        Utility.log(Controller, "loadDocument");
        Utility.enforceTypes(arguments);
        let fname = "";

        let successfullLoad = (text, filename)=>{
            fname = filename;
            beforeEncode(filename);
            this.fileOps.encode(text, this.context, successfullEncode, onFailure);
        };

        let beforeEncode = (filename)=>{
            this.view.showThrobber(true);
            this.view.setThrobberMessage("Encoding file\n" + filename);
        };

        let successfullEncode = (text)=>{
            this.model.setDocument(text, fname);
            this.model.setupTaggedEntity($(".taggedentity"));
            this.isSaved = true;

            let schemaPath = $(`[xmltagname="xml-model"]`).xmlAttr("href");
            if (typeof schemaPath === "string"){
                let split = schemaPath.split("/");
                switch (split[split.length - 1]){
                    case "orlando_biography_v2.rng":
                        this.contextLoader.loadContext("orlando");
                    break;
                    case "cwrc_entry.rng":
                        this.contextLoader.loadContext("cwrc");
                    break;
                    case "cwrc_tei_lite.rng":
                        this.contextLoader.loadContext("tei");
                    break;

                }
            }

            this.view.clearThrobber();
        };

        let onFailure = (status, text)=>{
            let msg = "Failed to encode file\n";
            msg += "return status : " + status;
            window.alert(msg);
            console.log(text);
            this.view.clearThrobber();
        };

        this.fileOps.loadFromFile(successfullLoad);
    }

    /* not in unit tests */
    saveContents(successCB = function() {}, failureCB = function(){}) {
        Utility.log(Controller, "saveContents");
        Utility.enforceTypes(arguments, ["optional", Function], ["optional", Function]);

        this.unselectAll();
        let contents = "<doc>" + this.model.getDocument() + "</doc>";

        this.fileOps.decode(contents, this.context, (result) => {
            this.fileOps.saveToFile(result, this.model.getFilename());
            this.isSaved = true;
            successCB();
        }, (status, text) => {
            failureCB(status, text);
        }
        );
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
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(r);
        let parent = r.commonAncestorContainer.parentElement;
        this.view.scrollTo(parent);
        if ($(parent).hasClass("taggedentity")){
            this.addSelected(parent);
        }
    }

    closeDocument(){
        Utility.log(Controller, "closeDocument");
        Utility.enforceTypes(arguments);
        this.model.reset();
    }
}