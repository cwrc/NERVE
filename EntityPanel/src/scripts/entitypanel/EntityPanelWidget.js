const $ = require("jquery");
const ArrayList = require("jjjrmi").ArrayList;
const TaggedEntityCollection = require("./TaggedEntityCollection");
const EntityValues = require("nerveserver").EntityValues;
const TaggedEntityFactory = require("./TaggedEntityFactory");
const Widget = require("nidget").Widget;
const Schema = require("./Schema");
const Constants = require("@thaerious/utility").Constants;
const TaggedEntityContextMenu = require("./TaggedEntityContextMenu");
const EntityPanelContextMenu = require("./EntityPanelContextMenu");

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
class EntityPanelClickListener {
    constructor(entityPanelWidget) {
        this.widget = entityPanelWidget;
    }

    notifyTaggedEntityClick(taggedEntity, double, control, shift, alt) {
        if (double) {
            if (!control) this.widget.emptyCollection();
            this.widget.selectByLemmaTag(taggedEntity.lemma(), taggedEntity.tag());
        } else if (control && !this.widget.selectedEntities.contains(taggedEntity)) {
            this.widget.selectedEntities.add(taggedEntity);
            taggedEntity.highlight(true);
        } else if (control && this.widget.selectedEntities.contains(taggedEntity)) {
            this.widget.selectedEntities.remove(taggedEntity);
            taggedEntity.highlight(false);
        } else {
            this.widget.emptyCollection();
            this.widget.selectedEntities.add(taggedEntity);
            taggedEntity.highlight(true);
        }
    }

    async notifyTaggedEntityContextMenu(taggedEntity, dbl, ctrl, alt, shft, event) {
        /* if the collection is empty make taggedEntity the collection */
        let tempCollection = this.widget.selectedEntities.clone();
        tempCollection.add(taggedEntity);
        this.widget.taggedEntityContextMenu.show(event, tempCollection);
    }
}

class EntityPanelWidget extends Widget {

    constructor(target, delegate, dictionary) {
        super(`<div id="entityPanel" class="format-default"></div>`, delegate);
        $(target).append(this.$);

        this.taggedEntityFactory = new TaggedEntityFactory(this);
        this.hasDocument = false;
        this.addListener(new EntityPanelClickListener(this));
        this.selectedEntities = new TaggedEntityCollection();
        this.stylename = "";
        this.schema = null;

        this.taggedEntityContextMenu = new TaggedEntityContextMenu(this);
        this.taggedEntityContextMenu.setDictionary(dictionary);
        this.taggedEntityContextMenu.makeReady(); /* todo move this to make ready function */

        this.entityPanelContextMenu = new EntityPanelContextMenu(this);

        this.latestValues = new EntityValues();
        this.copyValues = new EntityValues();
        this.dictionary = null;

        /* Default Document Click Event */
        $("#entityPanel").click((event) => {
            if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
                this.notifyListeners("notifyDocumentClick");
                this.emptyCollection();
            }
        });

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
    }

    getSelectedEntities() {
        return this.selectedEntities.clone();
    }

    getDocument() {
        return $("#entityPanel").html();
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
        let dispTop = $("#panelContainer").offset().top;
        let dispBottom = dispTop + $("#panelContainer").height();

        if (eleTop > dispTop && eleBottom < dispBottom) return;

        let elementRelativeTop = taggedEntityWidget.$.offset().top - $("#panelContainer").offset().top;
        let scrollTo = elementRelativeTop + $("#panelContainer").scrollTop() - $("#panelContainer").height() / 2;
        $("#panelContainer").scrollTop(scrollTo);
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
}

module.exports = EntityPanelWidget;