const $ = require("jquery");
const ArrayList = require("jjjrmi").ArrayList;
const TaggedEntityCollection = require("./TaggedEntityCollection");
const EntityValues = require("nerveserver").EntityValues;
const TaggedEntityFactory = require("./TaggedEntityFactory");
const Widget = require("@thaerious/nidget").Widget;
const Schema = require("./Schema");
const Constants = require("@thaerious/utility").Constants;
const TaggedEntityContextMenu = require("./TaggedEntityContextMenu");
const EntityPanelContextMenu = require("./EntityPanelContextMenu");
const CWRCDialogs = require("@thaerious/cwrcdialogs").CWRCDialogs;
const EditEntityWidget = require("./EditEntityWidget");

(function ($) {
    $.fn.mergeElements = function (name = "div") {
        let range = $(this).asRange();
        let element = document.createElement(name);
        range.surroundContents(element);
        $(this).contents().unwrap();
        return $(element);
    };
}($));

(function ($) {
    $.fn.asRange = function () {
        let start = null;
        let end = null;

        this.each(function () {
            let range = new Range();
            range.setStartBefore($(this).get(0));
            range.setEndAfter($(this).get(0));
            if (start === null || range.startOffset < start.startOffset) start = range;
            if (end === null || range.endOffset > end.endOffset) end = range;
        });

        let range = new Range();
        range.setStart(start.startContainer, start.startOffset);
        range.setEnd(end.endContainer, end.endOffset);
        return range;
    };
}($));

/**
 * Listens for tagged entity widget clicks to add/remove them from the collection.
 */
class EntityPanelListener {
    constructor(entityPanel) {
        this.entityPanel = entityPanel;
    }

    notifyTaggedEntityClick(taggedEntity, double, control, shift, alt) {
        if (double) {
            if (!control) this.entityPanel.emptyCollection();
            this.entityPanel.selectByLemmaTag(taggedEntity.lemma(), taggedEntity.tag());
        } else if (control && !this.entityPanel.selectedEntities.contains(taggedEntity)) {
            this.entityPanel.selectedEntities.add(taggedEntity);
            taggedEntity.highlight(true);
        } else if (control && this.entityPanel.selectedEntities.contains(taggedEntity)) {
            this.entityPanel.selectedEntities.remove(taggedEntity);
            taggedEntity.highlight(false);
        } else {
            this.entityPanel.emptyCollection();
            this.entityPanel.selectedEntities.add(taggedEntity);
            taggedEntity.highlight(true);
        }
    }

    async notifyTaggedEntityContextMenu(taggedEntity, dbl, ctrl, alt, shft, event) {
        /* if the collection is empty make taggedEntity the collection */
        this.entityPanel.selectedEntities.add(taggedEntity);
        taggedEntity.highlight(true);
        this.entityPanel.taggedEntityContextMenu.show(event, this.entityPanel.selectedEntities.clone());
    }
    
    async notifySourceSelect(entityValues){
        this.entityPanel.selectedEntities.values(entityValues);
    }        
    
    /* event from TaggedEntityContextMenu */
    async notifyLookupEntities(){
        this.entityPanel.search();
    }
    
    /* event from TaggedEntityContextMenu */
    async notifyEditEntities(taggedEntities){
        let editEntityWidget = this.entityPanel.editEntityWidget;
        let editEntityResult = await editEntityWidget.show(taggedEntities);
        
        if (editEntityResult.accept){
            let valueArray = [];
            for (let taggedEntity of taggedEntities){
                let values = new EntityValues();
                if (editEntityResult.text !== null) values.text(editEntityResult.text);
                if (editEntityResult.lemma !== null) values.lemma(editEntityResult.lemma);
                if (editEntityResult.link !== null) values.link(editEntityResult.link);
                if (editEntityResult.tag !== null) values.tag(editEntityResult.tag);
                taggedEntity.values(values);
                valueArray.push(values);
            }
            this.entityPanel.notifyListeners("notifyEntityUpdate", taggedEntities.asArray(), valueArray);
        }
    }    
}

class EntityPanelWidget extends Widget {

    constructor(target, dictionary) {
        super(`<div id="entityPanel" class="format-default" data-mode="entity"></div>`);
        $(target).append(this.getElement());

        this.taggedEntityFactory = new TaggedEntityFactory(this);
        this.hasDocument = false;
        this.selectedEntities = new TaggedEntityCollection(this);
        this.stylename = "";
        this.schema = null;

        this.taggedEntityContextMenu = new TaggedEntityContextMenu(this);
        this.taggedEntityContextMenu.setDictionary(dictionary);        

        this.entityPanelContextMenu = new EntityPanelContextMenu(this);

        this.addListener(new EntityPanelListener(this));

        this.latestValues = new EntityValues();
        this.copyValues = new EntityValues();
        this.dictionary = null;

        /* CWRC DIALOG events are caught by entity panel so that the proper   */
        /* collection can be added as an argument                             */
        this.cwrcDialogs = new CWRCDialogs(this);

        /* Entity edit widget */
        this.editEntityWidget = new EditEntityWidget();        

        /* Default Document Click Event */
        $("#entityPanel").click((event) => {
            if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
                this.notifyListeners("notifyDocumentClick");
                this.emptyCollection();
            }
        });

        /* Context menu event */
        $(this.getElement()).on("contextmenu", (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (this.selectedEntities.isEmpty()) {
                if (window.getSelection().isCollapsed){
                    this.entityPanelContextMenu.showDisabled(event);
                }
                else{
                    this.entityPanelContextMenu.show(event);
                }
            } else {
                this.taggedEntityContextMenu.show(event, this.selectedEntities);
            }
        });
                
        /* Enter key press trap */
//        $(this.getElement()).attr("contenteditable", "true");   
        this.getElement().spellcheck = false;
        $(this.getElement()).keydown(function (e) {
            // trap the return key being pressed
            if (e.keyCode === 13) {
                // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
                document.execCommand('insertHTML', false, '&#10;&#13;');
                // prevent the default behaviour of return key pressed
                return false;
            }
        });        
        
        /* check for local storage */
        if (localStorage.entityPanel !== undefined){
            this.localStorage = JSON.parse(localStorage.entityPanel);            
        }
        else {
            this.localStorage = {mode : "entity"};
            localStorage.entityPanel = JSON.stringify(this.localStorage);
        }        
        this.setAttribute("data-mode", this.localStorage.mode);
    }

    setMode(mode){
        this.setAttribute("data-mode", mode);
        this.localStorage.mode = mode;
        localStorage.entityPanel = JSON.stringify(this.localStorage);
    }

    async load(){
        await this.cwrcDialogs.load();
        await this.taggedEntityContextMenu.load();
        await this.editEntityWidget.load();
        
        await this.cwrcDialogs.registerEntitySource(require("@thaerious/cwrcdialogs").viaf);
        await this.cwrcDialogs.registerEntitySource(require("@thaerious/cwrcdialogs").dbpedia);
        await this.cwrcDialogs.registerEntitySource(require("@thaerious/cwrcdialogs").wiki);
        await this.cwrcDialogs.registerEntitySource(require("@thaerious/cwrcdialogs").getty);
        await this.cwrcDialogs.registerEntitySource(require("@thaerious/cwrcdialogs").geonames);        
        
    }

    getSelectedEntities() {
        return this.selectedEntities.clone();
    }

    getRawDocument(){
        return $("#entityPanel").html();
    }
    
    /**
     * Return copy of document with entityPanel markup removed.
     * @returns {unresolved}
     */
    getDecodedDocument() {
        let document = $("#entityPanel").clone();
        
        document.find(".taggedentity").each((i, e) => {
            TaggedEntityFactory.removeMarkup(e);
        });
        
        return document.html();
    }

    /**
     * Clear the document from the widget.  
     * @returns {undefined}
     */
    async unsetDocument() {
        if (!this.hasDocument) return;
        this.hasDocument = false;

        /* retrieve all tagged entities from the document */
        let taggedEntityArray = [];
        $(".taggedentity").each(async (i, element) => {
            if (Widget.hasWidget(element)) {
                let taggedEntityWidget = Widget.getWidget(element);
                taggedEntityArray.push(taggedEntityWidget);
            }
        });

        this.$.html("");
        await this.notifyListeners("notifyClearDocument", taggedEntityArray);
    }

    async setDocument(documentText, filename = null, schemaXMLText = null) {
        if (filename !== null) this.filename = filename;
        else filename = this.filename;

        if (this.hasDocument) {
            this.unsetDocument();
        }

        this.hasDocument = true;

        if (schemaXMLText !== null) {
            this.schema = new Schema();
            await this.schema.load(schemaXMLText);
        }

        this.$.html(documentText);

        let taggedEntityArray = [];
        $(".taggedentity").each(async (i, element) => {
            let taggedEntity = this.taggedEntityFactory.constructFromElement(element);
            taggedEntityArray.push(taggedEntity);
        });

        await this.notifyListeners("notifySetDocument", filename, taggedEntityArray);
    }

    setStyle(stylename) {
        if (this.stylename !== "") {
            $("#entityPanel").removeClass(this.stylename);
        }
        $("#entityPanel").addClass(stylename);
        this.stylename = stylename;
    }

    addSelected(taggedEntityWidget){
        this.selectedEntities.add(taggedEntityWidget);
        taggedEntityWidget.highlight(true);
    }

    emptyCollection() {
        for (let collectionEntity of this.selectedEntities) {
            collectionEntity.highlight(false);
        }
        this.selectedEntities.clear();
    }

    async selectByLemmaTag(lemma, tag) {
        let entityArray = [];
        for (let taggedEntity of this.taggedEntityFactory.getAllEntities()) {
            if (taggedEntity.lemma() !== lemma) continue;
            if (taggedEntity.tag() !== tag) continue;
            entityArray.push(taggedEntity);
            taggedEntity.highlight(true);
        }
        await this.selectedEntities.set(entityArray);
    }

    scrollTo(taggedEntityWidget) {
        let eleTop = taggedEntityWidget.$.offset().top;
        let eleBottom = eleTop + taggedEntityWidget.$.height();
        let dispTop = $("#entityPanel").offset().top;
        let dispBottom = dispTop + $("#entityPanel").height();

        if (eleTop > dispTop && eleBottom < dispBottom) return;

        let elementRelativeTop = taggedEntityWidget.$.offset().top - $("#entityPanel").offset().top;
        let scrollTo = elementRelativeTop + $("#entityPanel").scrollTop() - $("#entityPanel").height() / 2;
        $("#entityPanel").scrollTop(scrollTo);
    }

    async mergeEntities() {
        let selection = window.getSelection();

        if (selection.rangeCount !== 0 && !selection.isCollapsed) {
            let newEntity = await this.tagSelectedRange();
            this.collection.add(newEntity);
        }

        let contents = $();

        let taggedEntityArray = [];
        for (let entity of this.selectedEntities) {
            let contentElement = entity.contents.get(0);
            entity.getElement().replaceWith(contentElement);
            contents = contents.add(contentElement);
            taggedEntityArray.push(entity);
        }

        let tagOfLastSelected = this.selectedEntities.getLast().tag();
        this.selectedEntities.clear();
        this.notifyListeners("notifyUntaggedEntities", taggedEntityArray, []);

        contents = contents.mergeElements();
        contents[0].normalize();

        let taggedEntityWidget = this.taggedEntityFactory.constructFromElement(contents[0]);
        taggedEntityWidget.tag(tagOfLastSelected);
        return taggedEntityWidget;
    }

    /**
     * Tag selected text with the tagname from the schema.
     * @param {type} selection
     * @param {type} schemaTagName
     * @returns {EnityPanelWidget.tagSelection.taggedEntity}
     */
    async tagSelection(selection, schemaTagName) {
        if (selection.rangeCount === 0) {
            this.notifyListeners("notifyWarning", `No range selected.`);
            return null;
        }

        let range = selection.getRangeAt(0);

        if (range.collapsed) {
            this.notifyListeners("notifyWarning", `No range selected.`);
            return null;
        }

        range = this.__trimRange(range);

        if (range.collapsed) {
            this.notifyListeners("notifyWarning", `Range does not contain text.`);
            return null;
        }

        if (!this.schema.isValid(range.commonAncestorContainer, schemaTagName)) {
            this.notifyListeners("notifyWarning", `Tagging "${schemaTagName}" is not valid in the Schema at this location.`);
            return null;
        }

        let entityCountInRange = $(range.cloneContents()).find(Constants.HTML_ENTITY_SELECTOR).length;
        if (entityCountInRange !== 0) {
            this.notifyListeners("notifyWarning", `Selection can not contain already tagged entities.`);
            return null;
        }

        var element = document.createElement("div");
        $(element).append(range.extractContents());

        let taggedEntity = this.taggedEntityFactory.constructFromElement(element);

        range.deleteContents();
        range.insertNode(element);
        selection.removeAllRanges();
        document.normalize();

        return taggedEntity;
    }

    __trimRange(range) {
        while (range.toString().charAt(range.toString().length - 1) === ' ') {
            range.setEnd(range.endContainer, range.endOffset - 1);
        }

        while (range.toString().charAt(0) === ' ') {
            range.setStart(range.startContainer, range.startOffset + 1);
        }

        return range;
    }
    
    search(){        
        this.cwrcDialogs.show();
        
        if (!this.selectedEntities.isEmpty()){
            let taggedEntity = this.selectedEntities.getLast();
            this.cwrcDialogs.search(taggedEntity.text(), taggedEntity.tag());        
        }
    }
    
    setAttribute(key, value){
        $(this.getElement()).attr(key, value);
    }
    
    clearAttribute(key){
        $(this.getElement()).removeAttr(key);
    }
    
    getAttribute(key){
        return $(this.getElement()).attr(key);
    }
}

module.exports = EntityPanelWidget;