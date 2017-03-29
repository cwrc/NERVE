DOCUMENT_POSITION_DISCONNECTED = 1;
DOCUMENT_POSITION_PRECEDING = 2;
DOCUMENT_POSITION_FOLLOWING = 4;
DOCUMENT_POSITION_CONTAINS = 8;
DOCUMENT_POSITION_CONTAINED_BY = 16;
DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32;

/* global selected, model, search, TaggedEntity, this.factory, Utility, trace, cD, Range, DOMException, Function */
/* (^[ ]+)([a-zA-z]+)(\(.*\)[ ]?\{) */
/* $1$2$3\nUtility.log(Events, "$2"); */

class Controller {
    /**
     *
     * @param {View} view
     * @param {Model} model
     * @param {FileOperations} fileOps
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
        this.lastText = ""; /* last text selected or entity clicked on */
        this.searchUtility = new SearchUtility("#entityPanel");

        this.currentEntity = "";
        this.currentLemma = "";
        this.currentLink = "";
        this.currentTagName = "";
        this.currentDict = "";
        this.pollDictionaryDelay = null;
        this.copiedInfo = null;
        this.isSaved = false;
    }

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

    notifyDialogInput(){
        Utility.log(Controller, "notifyDialogInput");
        Utility.enforceTypes(arguments);

        let dialogValues = this.view.getDialogs();
        this.selected.$().entityTag(dialogValues.tagName);
        this.selected.$().text(dialogValues.entity);
        this.selected.$().lemma(dialogValues.lemma);
        this.selected.$().link(dialogValues.link);
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

    addSelected(taggedEntity) {
        Utility.log(Controller, "addSelected");
        Utility.enforceTypes(arguments, HTMLDivElement);

        this.selected.add(taggedEntity);
        $(taggedEntity).addClass("selected");
        this.view.setDialogFade(false);
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
            this.view.setFindText(last.getEntity());
            this.search(last.getEntity(), "next");
        } else {
            this.view.setFindText("");
        }

        this.view.focusFind();
    }
    deleteSelectedEntities(dictionary) {
        Utility.log(Controller, "deleteSelectedEntities");
        
        this.selected.each((taggedEntity) => {
            this.dictionary.deleteEntity(taggedEntity.getEntity(), this.currentDict);
        });
        this.pollDictionaryUpdate(100, "EMPTY");
        this.view.setDialogFade(true);
        this.isSaved = false;
    }

    setDictionary(value) {
        Utility.log(Controller, "setDictionary");
        Utility.enforceTypes(arguments, String);
        this.currentDict = value;
        this.pollDictionaryUpdate(0, "MATCH");
    }
    
    copyInfo(){
        Utility.log(Controller, "copyInfo");
        Utility.enforceTypes(arguments);    
        if (this.selected.isEmpty()) return;
        this.copiedInfo = this.view.getDialogs();
    }
    
    pasteInfo(){
        Utility.log(Controller, "pasteInfo");
        Utility.enforceTypes(arguments);        
        if (this.copiedInfo === null || this.selected.isEmpty()) return;
        this.selected.$().entityTag(this.copiedInfo.tagName);
        this.selected.$().lemma(this.copiedInfo.lemma);
        this.selected.$().link(this.copiedInfo.link);
        this.view.setDialogs(this.selected.getLast());
        this.isSaved = false;
    }
    
    clearDialogs() {
        Utility.log(Controller, "clearDialogs");
        Utility.enforceTypes(arguments);

        this.view.clearDialogs();
        this.currentEntity = "";
        this.currentLemma = "";
        this.currentLink = "";

        this.setDictionary(this.context.writeToDictionary());
        this.view.setDictionary(this.context.writeToDictionary());

        this.__enableDictionaryUpdate(false);
        this.view.setDictionaryMessage(" -------------------- ");
    }
    
    setDialogs(taggedEntity, delay) {
        Utility.log(Controller, "setDialogs");
        Utility.enforceTypes(arguments, HTMLDivElement, ["optional", Number]);
        if (typeof delay === "undefined") delay = 0;

        this.view.setDialogs(taggedEntity);

//        if (taggedEntity.hasDictionary() && taggedEntity.getDictionary() === this.currentDict) {
//            this.currentDict = taggedEntity.getDictionary();
//            this.pollDictionaryUpdate(delay, "MATCH");
//        } else {
//            taggedEntity.setDictionary(this.currentDict);
//            this.pollDictionaryUpdate(delay, "EMPTY");
//        }
    }
    
    tagSelectedRange() {
        Utility.log(Controller, "tagSelectedRange");
        Utility.enforceTypes(arguments);

        let selection = window.getSelection();
        if (selection.rangeCount === 0) return new Response(false, "No text selected");
        let range = selection.getRangeAt(0);   
        let tagName = this.view.getDialogs().tagName;
        if (!this.context.schema.isValid(range.commonAncestorContainer, tagName)){
            return new Response(false, `Tagging "${tagName}" is not valid in the Schema at this location.`);
        }
        let taggedEntity = this.constructEntityFromRange(range, tagName);
        let response = new Response(true, `New "${tagName}" entity created.`);
        response.taggedEntity = taggedEntity;
        selection.removeAllRanges();
        this.addSelected(taggedEntity);

        this.isSaved = false;
        return response;
    }

    constructEntityFromRange(range, tagName) {
        Utility.log(Controller, "constructEntityFromRange");
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
        this.listener.addTaggedEntity(ele);
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

    /* add all selected entities to the dictionary */
    updateDictionaryOnSelected() {
        Utility.log(Controller, "updateDictionaryOnSelected");
        Utility.enforceTypes(arguments);

        let count = this.selected.size();

        this.selected.each((taggedEntity) => {
            this.dictionary.addEntity(taggedEntity, () => {
                count = count - 1;
                if (count === 0) this.pollDictionaryUpdate(100, "MATCH");
            });
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
        
        this.isSaved = false;
        let message = count + " entit" + (count === 1 ? "y" : "ies") + " untagged";
        return new Response(true, message);
    }

    selectSameEntities(taggedEntity) {
        Utility.log(Controller, "selectSameEntities");
        Utility.enforceTypes(arguments, TaggedEntity);
//
//        let labelMatch = this.factory.getFunctional((entity) => {
//            if (entity.getLemma() === "") return false;
//            if (entity.getLemma() !== this.currentLemma) return false;
//            return true;
//        });
//
//        let linkMatch = this.factory.getFunctional((entity) => {
//            if (entity.getLink() === "") return false;
//            if (entity.getLink() !== this.currentLink) return false;
//            return true;
//        });
//
//        this.selected.addAll(labelMatch);
//        this.selected.addAll(linkMatch);
//        this.selected.each((e) => e.markupSelect());
//
//        return new Collection(this.selected.toArray());
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
    /**
     * Update the dictionary view according to the current dialog values
     * @param {type} delay
     * @returns {undefined}
     */
    pollDictionaryUpdate(delay, expected = "NONE") {
        Utility.log(Controller, "pollDictionaryUpdate");
        Utility.enforceTypes(arguments, Number, ["optional", String]);

        if (this.currentEntity === "") {
            return;
        }

        switch (expected) {
            case "EXISTS":
                this.__enableDictionaryUpdate(false);
                this.view.setDictionaryMessage("Update Dictionary");
                break;
            case "MATCH":
                this.__enableDictionaryUpdate(true);
                this.view.setDictionaryMessage("Dictionary Updated");
                break;
            case "EMPTY":
                this.__enableDictionaryUpdate(false);
                this.view.setDictionaryMessage("Add To Dictionary");
                break;
        }

        if (this.pollDictionaryDelay !== null) {
            clearTimeout(this.pollDictionaryDelay);
        }

        this.pollDictionaryDelay = setTimeout(() => {
            this.pollDictionaryDelay = null;
            this.dictionary.matches(this.currentEntity, this.currentLemma, this.currentLink, this.currentTagName, this.currentDict, (result) => {
                switch (result) {
                    case "EXISTS":
                        this.__enableDictionaryUpdate(false);
                        this.view.setDictionaryMessage("Update Dictionary");
                        break;
                    case "MATCH":
                        this.__enableDictionaryUpdate(true);
                        this.view.setDictionaryMessage("Dictionary Updated");
                        break;
                    case "EMPTY":
                        this.__enableDictionaryUpdate(false);
                        this.view.setDictionaryMessage("Add To Dictionary");
                        break;
                }
            });
        }, delay);
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
    selectByEntity() {
        Utility.log(Controller, "selectByEntity");
        Utility.enforceTypes(arguments);
//
//        if (this.currentEntity === "") return;
//        this.factory.forEach((e) => {
//            if (e.getEntity() === this.currentEntity) {
//                e.markupSelect();
//                this.selected.add(e);
//            }
//        });
    }
    smartSelect() {
        Utility.log(Controller, "smartSelect");
        Utility.enforceTypes(arguments);
//
//        if (!this.selected.isEmpty()) {
//            var last = this.selected.getLast();
//            this.factory.getSimilarEntities(last).forEach((e) => {
//                e.markupSelect();
//                this.selected.add(e);
//            });
//        }
    }
    /* not in unit tests */
    loadFromFile(loadStart = function() {}, successCB = function() {}, failureCB = function(){}){
        Utility.log(Controller, "loadFromFile");
        Utility.enforceTypes(arguments, ["optional", Function], ["optional", Function], ["optional", Function]);

        this.fileOps.loadFromFile((text, filename) => {
            Utility.trace(Controller, 3, "loadFromFile():fileOps.loadFromFile()");
            loadStart(filename);
            this.encode(text, filename, (json) => {
                this.isSaved = true;
                successCB(json);
            },
            (status, text) => {
                failureCB(status, text);
            }
            );
        });
    }
    /* this is seperate bectause 'loadFromFile' can not be unit tested */
    encode(text, filename, successCallback = function() {}, failureCallback = function(){}){
        Utility.log(Controller, "encode");
        Utility.enforceTypes(arguments, String, String, ["optional", Function], ["optional", Function]);

        this.fileOps.encode(text, this.context,
                (result) => {
            this.model.setDocument(result, filename);
            successCallback();
        }, (status, text) => {
            failureCallback(status, text);
        });
    }
    /* not in unit tests */
    saveContents(successCB = function() {}, failureCB = function(){}) {
        Utility.log(Controller, "saveContents");
        Utility.enforceTypes(arguments, ["optional", Function], ["optional", Function]);

        this.unselectAll();
        let contents = this.model.getDocument();
        this.fileOps.decode(contents, this.context,
                (result) => {
            this.fileOps.saveToFile(result, this.model.getFilename());
            this.isSaved = true;
            successCB();            
        },
                (status, text) => {
            failureCB(status, text);
        }
        );
    }
    
    mergeSelectedEntities() {
        Utility.log(Controller, "mergeSelectedEntities");
        Utility.enforceTypes(arguments);

        let ele = this.selected.$().mergeElements();
        $(ele).addClass("taggedentity");
        $(ele).attr($.fn.xmlAttr.defaults.attrName, "{}");
        $(ele).entityTag(this.view.getDialogs().tagName);
        $(ele).lemma(this.view.getDialogs().lemma);
        $(ele).link(this.view.getDialogs().link);
        this.listener.addTaggedEntity(ele);
        this.selected.clear();
        this.addSelected(ele[0]);
    }
    
    search(text, direction) {
        Utility.log(Controller, "search");
        Utility.enforceTypes(arguments, String, String);

        let count = this.searchUtility.search(text);
        if (count === 0) return;

        let r = null;
        if (direction === "next") r = this.searchUtility.next();
        if (direction === "prev") r = this.searchUtility.prev();

        if (r instanceof Range) {
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(r);
            this.view.scrollTo(r.commonAncestorContainer.parentElement);
        } else if (r instanceof TaggedEntity){
            this.unselectAll();
            this.addSelected(r);
            this.view.scrollTo(r);
            this.setDialogs(r, 0);
        }
    }
    
    closeDocument(){
        Utility.log(Controller, "closeDocument");
        Utility.enforceTypes(arguments);
        
        this.view.setDocument("");
    }
}