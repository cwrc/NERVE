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
     * @param {TaggedEntityFactory} factory
     * @param {FileOperations} fileOps
     * @returns {Controller}
     */
    constructor(view, model, factory, fileOps, events) {
        Utility.log(Controller, "constructor");
        Utility.enforceTypes(arguments, View, Model, TaggedEntityFactory, FileOperations);

        this.view = view;
        this.model = model;
        this.factory = factory;
        this.fileOps = fileOps;

        this.dialogs = new Dialogs(this);
        this.selected = new Collection();
        this.dictionary = new Dictionary(model);
        this.settings = new Storage("controller");
        this.lastText = ""; /* last text selected or entity clicked on */
        this.searchUtility = new SearchUtility("#entityPanel", model);

        this.currentEntity = "";
        this.currentLemma = "";
        this.currentLink = "";
        this.currentTagName = "";
        this.currentDict = "";
        this.pollDictionaryDelay = null;
    }
    setEventHandler(events) {
        Utility.log(Controller, "setEventHandler");
        Utility.enforceTypes(arguments, Events);
        this.dialogs = new Dialogs(this, events);
    }

    copyData(entityFrom, entityTo){
        entityTo.setLemma(entityFrom.getLemma());
        entityTo.setLink(entityFrom.getLink());
        entityTo.setTagName(entityFrom.getTagName());
        return new Response(true, `Entity data copied`);
    }

    addSelected(taggedEntity) {
        Utility.log(Controller, "addSelected");
        Utility.enforceTypes(arguments, TaggedEntity);

        this.selected.add(taggedEntity);
        taggedEntity.markupSelect();
        this.lastText = taggedEntity.getEntity();

        let rvalue = new Collection(this.selected.toArray());
        if (rvalue.isEmpty()) this.view.setDialogFade(true);
        else this.view.setDialogFade(false);

        return rvalue;
    }
    toggleSelect(taggedEntity) {
        Utility.log(Controller, "toggleSelect");
        Utility.enforceTypes(arguments, TaggedEntity);

        if (this.selected.contains(taggedEntity)) {
            this.selected.remove(taggedEntity);
            taggedEntity.markupUnselect();
        } else {
            this.selected.add(taggedEntity);
            taggedEntity.markupSelect();
            this.lastText = taggedEntity.getEntity();
        }

        let rvalue = new Collection(this.selected.toArray());
        if (rvalue.isEmpty()) this.view.setDialogFade(true);
        else this.view.setDialogFade(false);
        return rvalue;
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
        this.selected.forEach((taggedEntity) => {
            this.dictionary.deleteEntity(taggedEntity.getEntity(), this.currentDict);
        });
        this.pollDictionaryUpdate(100, "EMPTY");
        this.view.setDialogFade(true);
    }
    /* The following 'set' functions both set the saved value and update  */
    /* all selected entities.  The saved value is used when "setDialogs   */
    /* is called.                                                         */
    setEntity(value) {
        Utility.log(Controller, "setEntity");
        Utility.enforceTypes(arguments, String);

        this.dialogs.setQueryTerm(value);
        this.currentEntity = value;
        this.selected.forEach((entity) => entity.setEntity(value));
    }
    setTagName(value) {
        Utility.log(Controller, "setTagName");
        Utility.enforceTypes(arguments, String);

        this.currentTagName = value;
        this.selected.forEach((entity) => entity.setTagName(value));
    }
    setLemma(value) {
        Utility.log(Controller, "setLemma");
        Utility.enforceTypes(arguments, String);

        this.currentLemma = value;
        this.selected.forEach((entity) => entity.setLemma(value));
    }
    setLink(value) {
        Utility.log(Controller, "setLink");
        Utility.enforceTypes(arguments, String);

        this.currentLink = value;
        this.selected.forEach((entity) => entity.setLink(value));
    }
    setDictionary(value) {
        Utility.log(Controller, "setDictionary");
        Utility.enforceTypes(arguments, String);
        this.currentDict = value;
        this.pollDictionaryUpdate(0, "MATCH");
    }
    clearDialogs() {
        Utility.log(Controller, "clearDialogs");
        Utility.enforceTypes(arguments);

        this.view.clearDialogs();
        this.currentEntity = "";
        this.currentLemma = "";
        this.currentLink = "";

        this.setDictionary(this.__getContext().writeToDictionary());
        this.view.setDictionary(this.__getContext().writeToDictionary());

        this.__enableDictionaryUpdate(false);
        this.view.setDictionaryMessage(" -------------------- ");
    }
    setDialogs(taggedEntity, delay) {
        Utility.log(Controller, "setDialogs");
        Utility.enforceTypes(arguments, TaggedEntity, ["optional", Number]);
        if (typeof delay === "undefined") delay = 0;

        this.view.setDialogs(taggedEntity);
        this.currentEntity = taggedEntity.getEntity();
        this.currentLemma = taggedEntity.getLemma();
        this.currentLink = taggedEntity.getLink();
        this.currentTagName = taggedEntity.getTagName();

        if (taggedEntity.hasDictionary() && taggedEntity.getDictionary() === this.currentDict) {
            this.currentDict = taggedEntity.getDictionary();
            this.pollDictionaryUpdate(delay, "MATCH");
        } else {
            taggedEntity.setDictionary(this.currentDict);
            this.pollDictionaryUpdate(delay, "EMPTY");
        }
    }
    copyDataToSelectedTags() {
        Utility.log(Controller, "copyDataToSelectedTags");
        Utility.enforceTypes(arguments);

        let count = 0;

        this.selected.forEach((entity) => {
            if (this.currentTagName !== entity.getTagName()
                    || this.currentLemma !== entity.getLemma()
                    || this.currentLink !== entity.getLink()) {

                console.log(this.currentTagName !== entity.getTagName());
                console.log(this.currentLemma !== entity.getLemma());
                console.log(this.currentLink !== entity.getLink());

                entity.setTagName(this.currentTagName);
                entity.setLemma(this.currentLemma);
                entity.setLink(this.currentLink);
                count++;
            }
        });

        let rvalue = {};
        rvalue.count = count;
        rvalue.tagName = this.currentTagName;
        rvalue.lemma = this.currentLemma;
        rvalue.link = this.currentLink;
        return rvalue;
    }
    tagSelectedRange() {
        Utility.log(Controller, "tagSelectedRange");
        Utility.enforceTypes(arguments);

        let selection = window.getSelection();
        if (selection.rangeCount === 0) return new Response(false, "No text selected");
        let range = selection.getRangeAt(0);
        let taggedEntity = this.factory.constructFromRange(range, this.currentTagName);

        let response = new Response(true, `New "${this.currentTagName}" entity created.`);
        response.tagName = this.currentTagName;
        response.lemma = this.currentLemma;
        response.link = this.currentLink;
        response.taggedEntity = taggedEntity;
        return response;
    }
    /* add all selected entities to the dictionary */
    updateDictionaryOnSelected() {
        Utility.log(Controller, "updateDictionaryOnSelected");
        Utility.enforceTypes(arguments);

        let count = this.selected.size();

        this.selected.forEach((taggedEntity) => {
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
        this.selected.forEachInvoke("deconstruct");
        this.selected.clear();
        this.view.clearDialogs();
        document.getElementById("entityPanel").normalize();

        this.view.setDialogFade(true);
        let message = count + " entit" + (count === 1 ? "y" : "ies") + " untagged";
        return new Response(true, message);
    }
    unselectAll() {
        Utility.log(Controller, "unselectAll");
        Utility.enforceTypes(arguments);

        this.selected.forEachInvoke("markupUnselect");
        this.selected.clear();
        this.view.setDialogFade(true);
    }
    selectSameEntities(taggedEntity) {
        Utility.log(Controller, "selectSameEntities");
        Utility.enforceTypes(arguments, TaggedEntity);

        let labelMatch = this.factory.getFunctional((entity) => {
            if (entity.getLemma() === "") return false;
            if (entity.getLemma() !== this.currentLemma) return false;
            return true;
        });

        let linkMatch = this.factory.getFunctional((entity) => {
            if (entity.getLink() === "") return false;
            if (entity.getLink() !== this.currentLink) return false;
            return true;
        });

        this.selected.addAll(labelMatch);
        this.selected.addAll(linkMatch);
        this.selected.forEach((e) => e.markupSelect());

        return new Collection(this.selected.toArray());
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

        let url = "resources/" + contextName.toLowerCase() + ".context.json";

        this.fileOps.loadFromServer(url, (contents) => {
            this.settings.setValue("savedState", "contextName", contextName);
            this.__setContext(contents);
            success(this.__getContext());
        }, (status, text) => {
            failure(status, text, contextName);
        });
    }
    __setContext(jsonString) {
        Utility.log(Controller, "__setContext");
        Utility.enforceTypes(arguments, String);

        this.model.setContext(jsonString);
        this.dictionary = new Dictionary(this.model);
        this.view.setContext(this.model.getContext());
        
        var defaultTagName = this.model.getContext().getTags()[0].name;
        this.setTagName(defaultTagName);
        this.setDictionary(this.model.getContext().writeToDictionary());
        this.view.setDictionary(this.model.getContext().writeToDictionary());
    }
    __getContext() {
        Utility.log(Controller, "__getContext");
        Utility.enforceTypes(arguments);

        return this.model.getContext();
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
        let tag = this.__getContext().getTagInfo(this.currentTagName);
        this.dialogs.showDialog(tag.dialog);
    }
    find() {
        Utility.log(Controller, "find");
        Utility.enforceTypes(arguments);

        let count = 0;
        let value = this.view.getSearchTerm();
        if (value !== "") {

            this.factory.forEach((e) => {
                if (e.getEntity() === value) {
                    e.markupSelect();
                    this.selected.add(e);
                    count++;
                }
            });
        }

        this.__fillDialogsFromCollection();
        return new Response(true, `${count} instance${count > 1 ? "s" : ""} of "${value}" selected`);
    }
    __fillDialogsFromCollection() {
        Utility.log(Controller, "__fillDialogsFromCollection");
        Utility.enforceTypes(arguments);

        if (this.selected.isEmpty()) return;

        let e = this.selected.getFirst();
        this.setDialogs(e, 0);

        this.selected.forEach((e) => {
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
                let dictionary = this.__getContext().writeToDictionary();
                this.currentDict = dictionary;
                this.view.setDictionary(dictionary);
            }
        });
    }
    selectByEntity() {
        Utility.log(Controller, "selectByEntity");
        Utility.enforceTypes(arguments);

        if (this.currentEntity === "") return;
        this.factory.forEach((e) => {
            if (e.getEntity() === this.currentEntity) {
                e.markupSelect();
                this.selected.add(e);
            }
        });
    }
    smartSelect() {
        Utility.log(Controller, "smartSelect");
        Utility.enforceTypes(arguments);

        if (!this.selected.isEmpty()) {
            var last = this.selected.getLast();
            this.factory.getSimilarEntities(last).forEach((e) => {
                e.markupSelect();
                this.selected.add(e);
            });
        }
    }
    /* not in unit tests */
    loadFromFile(loadStart = function() {}, successCB = function() {}, failureCB = function(){}){
        Utility.log(Controller, "loadFromFile");
        Utility.enforceTypes(arguments, ["optional", Function], ["optional", Function], ["optional", Function]);

        this.fileOps.loadFromFile((text, filename) => {
            Utility.trace(Controller, 3, "loadFromFile():fileOps.loadFromFile()");
            loadStart(filename);
            this.encode(text,
                    filename,
                    (json) => {
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

        this.fileOps.encode(text, this.__getContext(),
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
        this.fileOps.decode(contents, this.__getContext(),
                (result) => {
            this.fileOps.saveToFile(result, this.model.getFilename());
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

        this.selected.forEach((entity) => {
            if (entity.elementSharesParent(this.selected.getFirst()) === false) {
                return new Response(false, "Can not merge entities that do not share a common parent.");
            }
        });

        let start = null;
        let end = null;

        this.selected.forEach((entity) => {
            let range = entity.deconstruct();
            if (start === null) start = range;
            end = range;
        });

        let range = new Range();

        if (start.startOffset < end.endOffset) {
            range.setStart(start.startContainer, start.startOffset);
            range.setEnd(end.endContainer, end.endOffset);
        } else {
            range.setEnd(start.startContainer, start.endOffset);
            range.setStart(end.endContainer, end.startOffset);
        }

        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        return this.tagSelectedRange();
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
}