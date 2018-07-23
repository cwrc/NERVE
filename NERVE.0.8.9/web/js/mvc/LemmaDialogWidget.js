/**
 * Events:
 * notifyAddCategories(CategoryButton)
 * notifyClearCategories(CategoryButton)
 * notifySelectCategory(CategoryButton)
 * notifyUnselectCategory(CategoryButton)
 * notifyAddLemmas(LemmaWidget)
 * notifyRemoveLemmas(LemmaWidget)
 * notifyUpdateLemma(LemmaWidget)
 * notifyAddEntity(LemmaWidget, TaggedEntityWidget)
 * notifyRemoveEntity(LemmaWidget, TaggedEntityWidget)
 * notifyClickLemmaWidget(LemmaWidget)
 * notifyUnselectLemmaWidget(LemmaWidget)
 * notifyReselectLemmaWidget(LemmaWidget)
 */

const AbstractModel = require("./model/AbstractModel");
const nerscriber = require("nerscriber");
const ArrayList = require("jjjrmi").ArrayList;
const Collection = require("./model/Collection");
const EntityValues = require("../gen/EntityValues");

/**
 * A LemmaWidget is created for every unique lemma value in the document.
 */
class LemmaWidget {
    constructor(text, lemma, category, delegate, dragDropHandler) {
        this.lemma = lemma;
        this.category = category;
        this.dragDropHandler = dragDropHandler;

        this.element = $(document.createElement("button"));
        this.element.addClass("lemmaWidget");
        this.element.addClass("btn");
        this.element.addClass("btn-primary");
        this.element.text(text);

        this.countElement = $(document.createElement("div"));
        $(this.countElement).text("0");
        $(this.countElement).addClass("count");
        this.element.append(this.countElement);

        $(this.element).attr("draggable", "true");
        $(this.element).on("dragstart", (event) => this.dragstart(event));
        $(this.element).on("dragover", (event) => this.dragover(event));
        $(this.element).on("drop", (event) => this.drop(event));

        $(this.element).click((event) => {
            delegate.notifyListeners("notifyClickLemmaWidget", lemma, category, event.ctrlKey, event.shiftKey, event.altKey);
        });
        $(this.element).dblclick((event) => {
            delegate.notifyListeners("notifyDblClickLemmaWidget", lemma, category, event.ctrlKey, event.shiftKey, event.altKey);
        });

        this.entityCollection = new Collection();
        this.appendTo("#lemmaDialog > #displayArea");
    }

    getEntityCollection() {
        return this.entityCollection;
    }

    drop(event) {        
        if (this.dragDropHandler.hasData("lemmaWidget")) {
            let src = this.dragDropHandler.deleteData("lemmaWidget");
            let entities = src.getEntityCollection();
            let values = new EntityValues().lemma(this.lemma).tag(this.category);
            entities.values(values);
        } else if (this.dragDropHandler.hasData("TaggedEntityWidget")) {
            let src = this.dragDropHandler.deleteData("TaggedEntityWidget");
            let values = new EntityValues().lemma(this.lemma).tag(this.category);
            src.values(values);            
        }
    }
    dragover(event) {
        if (this.dragDropHandler.hasData("lemmaWidget")) {
            event.originalEvent.preventDefault();
        } else if (this.dragDropHandler.hasData("TaggedEntityWidget")) {
            event.originalEvent.preventDefault();
        }
    }
    dragstart(event) {
        this.dragDropHandler.setData("lemmaWidget", this);
    }
    getCategory() {
        return this.category;
    }
    getLemma() {
        return this.lemma;
    }
    hide() {
        $(this.element).hide();
    }
    show() {
        $(this.element).show();
    }
    detach() {
        $(this.element).detach();
    }
    appendTo(target) {
        $(target).append(this.element);
    }
    addEntity(taggedEntityWidget) {
        if (this.entityCollection.contains(taggedEntityWidget)) return false;
        this.entityCollection.add(taggedEntityWidget);
        $(this.countElement).text(this.entityCollection.size());
        return this.entityCollection.size();
    }
    removeEntity(taggedEntityWidget) {
        if (this.entityCollection.contains(taggedEntityWidget) === false) throw new Error("Lemma Widget does not contain entity");
        this.entityCollection.remove(taggedEntityWidget);
        $(this.countElement).text(this.entityCollection.size());
        return this.entityCollection.size();
    }
    highlight(value) {
        if (value === undefined) return this.element.hasClass("highlight");
        if (value) this.element.addClass("highlight");
        else this.element.removeClass("highlight");
    }
}

class CategoryButton {
    constructor(text, category, lemmaDialogWidget, dragDropHandler) {
        this.category = category;
        this.dragDropHandler = dragDropHandler;
        this.element = $(document.createElement("button"));
        this.element.addClass("btn");
        this.element.addClass("btn-primary");
        this.element.addClass("active");
        this.element.text(text);

        $(this.element).on("dragover", (event) => this.dragover(event));
        $(this.element).on("drop", (event) => this.drop(event));

        $(this.element).mouseup(() => {
            lemmaDialogWidget.toggleCategory(this);
        });
        $(this.element).dblclick(() => {
            lemmaDialogWidget.selectNoCategories();
            lemmaDialogWidget.enableCategory(this);
        });

        this.appendTo("#lemmaDialog > #buttonArea");
    }
    getCategory() {
        return this.category;
    }
    active(value) {
        if (value === undefined) return $(this.element).hasClass("active");
        else if (value) $(this.element).addClass("active");
        else $(this.element).removeClass("active");
    }
    detach() {
        $(this.element).detach();
    }
    appendTo(target) {
        $(target).append(this.element);
    }
    drop(event) {
        if (this.dragDropHandler.hasData("TaggedEntityWidget")) {
            let src = this.dragDropHandler.deleteData("TaggedEntityWidget");
            src.tag(this.category);
        }
    }
    dragover(event) {
        if (this.dragDropHandler.hasData("TaggedEntityWidget")) {
            event.originalEvent.preventDefault();
        }
    }
}

/**
 * Listens for event triggers that will manipulate lemma dialog model.
 * Keeps track of:
 *  - Categories, set by context.
 *  - 
 */
class LemmaDialogWidget extends AbstractModel {
    constructor(dragDropHandler) {
        super();

        this.categories = new Map();
        this.dragDropHandler = dragDropHandler;
        this.categoryButtons = [];
        this.entityLemmaMap = new Map(); /* lemmas may change, need to know old lemma */
        this.entityTagMap = new Map(); /* tags may change, need to know old tag */

        if ($("#lemmaDialog > #buttonArea").length === 0) {
            console.warn("element #lemmaDialog > #buttonArea not found");
            return;
        }

        if ($("#lemmaDialog > #displayArea").length === 0) {
            console.warn("element #displayArea > #buttonArea not found");
            return;
        }

        this.buttonArea = $("#lemmaDialog > #buttonArea");
        this.displayArea = $("#lemmaDialog > #displayArea");
        $(document).ready(() => this.layout());
        $(window).on("resize", () => this.layout());

        $("#selectAllCategories").mouseup((event) => {
            this.selectAllCategories();
        });

        $("#selectNoCategories").mouseup((event) => {
            this.selectNoCategories();
        });
    }

    notifyUnsetDocument() {
        for (let button of this.categoryButtons) {
            button.detach();
        }

        $(".lemmaWidget").detach();

        this.categoryButtons = [];
        this.categories = new Map();
        this.entityLemmaMap = new Map();
        this.entityTagMap = new Map();
    }

    async notifyContextChange(context) {
        this.context = context;
        this.notifyUnsetDocument();

        for (let tagInfo of context.tags()) {
            if (this.categories.has(tagInfo.getStandard())) continue;
            this.categories.set(tagInfo.getStandard(), new Map());
            let button = new CategoryButton(tagInfo.getName(), tagInfo.getStandard(), this, this.dragDropHandler);
            this.categoryButtons.push(button);
        }
    }

    async notifyRestoredValues(taggedEntityWidgets) {
        for (let taggedEntityWidget of taggedEntityWidgets) {
            this.untagEntity(taggedEntityWidget);
            this.newTaggedEntity(taggedEntityWidget);
        }
    }

    async notifyEntityUpdate(taggedEntityWidgets) {
        for (let taggedEntityWidget of taggedEntityWidgets) {
            this.untagEntity(taggedEntityWidget);
            this.newTaggedEntity(taggedEntityWidget);
        }
    }

    newTaggedEntity(taggedEntityWidget) {
        let lemma = taggedEntityWidget.lemma();
        let tag = taggedEntityWidget.tag();
        let categoryMap = this.categories.get(tag);
        if (categoryMap === undefined) throw new Error(`Category ${tag} not found`);

        let text = lemma + " - " + this.context.getTagInfo(tag).getName();

        if (!categoryMap.has(lemma)) {
            let lemmaWidget = new LemmaWidget(text, lemma, tag, this, this.dragDropHandler);
            categoryMap.set(lemma, lemmaWidget);
        }

        let lemmaWidget = categoryMap.get(lemma);

        lemmaWidget.addEntity(taggedEntityWidget);

        this.entityLemmaMap.set(taggedEntityWidget, lemma);
        this.entityTagMap.set(taggedEntityWidget, tag);
    }

    async notifyRestoredTaggedEntities(taggedEntityWidgetArray) {
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            this.newTaggedEntity(taggedEntityWidget);
        }
    }

    async notifyNewTaggedEntities(taggedEntityWidgetArray) {
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            this.newTaggedEntity(taggedEntityWidget);
        }
    }

    untagEntity(taggedEntityWidget) {
        let lemma = this.entityLemmaMap.get(taggedEntityWidget);
        
        let tag = this.entityTagMap.get(taggedEntityWidget);
        if (lemma === undefined || tag === undefined){   
            console.warn(taggedEntityWidget);
            console.error(`TaggedEntityWidget not found`);            
        }
        
        this.entityLemmaMap.delete(taggedEntityWidget);
        this.entityTagMap.delete(taggedEntityWidget);

        let categoryMap = this.categories.get(tag);
        if (categoryMap === undefined) throw new Error(`Category ${tag} not found`);
        let lemmaWidget = categoryMap.get(lemma);
        let r = lemmaWidget.removeEntity(taggedEntityWidget);

        if (r === 0) {
            let r = categoryMap.delete(lemma);
            if (!r) throw new Error("Lemma not removed from category map.");
            lemmaWidget.detach();
        }
    }

    async notifyRevertTaggedEntities(taggedEntityWidgetArray) {
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            this.untagEntity(taggedEntityWidget);
        }
    }

    async notifyUntaggedEntities(taggedEntityWidgetArray) {
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            this.untagEntity(taggedEntityWidget);
        }
    }

    toggleCategory(categoryButton) {
        if (!categoryButton.active()) {
            this.enableCategory(categoryButton);
            this.notifyListeners("notifyEnableCategories", [categoryButton.getCategory()]);
        } else {
            this.disableCategory(categoryButton);
            this.notifyListeners("notifyDisableCategories", [categoryButton.getCategory()]);
        }
    }

    enableCategory(categoryButton) {
        let categoryMap = this.categories.get(categoryButton.getCategory());
        categoryButton.active(true);
        for (let lemmaWidget of categoryMap.values()) {
            lemmaWidget.show();
        }
    }

    disableCategory(categoryButton) {
        let categoryMap = this.categories.get(categoryButton.getCategory());
        categoryButton.active(false);
        for (let lemmaWidget of categoryMap.values()) {
            lemmaWidget.hide();
        }
    }

    selectAllCategories() {
        let categoryArray = [];
        for (let button of this.categoryButtons) {
            this.enableCategory(button);
            categoryArray.push(button.getCategory());
        }
        this.notifyListeners("notifyEnableCategories", categoryArray);
    }
    selectNoCategories() {
        let categoryArray = [];
        for (let button of this.categoryButtons) {
            this.disableCategory(button);
            categoryArray.push(button.getCategory());
        }
        this.notifyListeners("notifyDisableCategories", categoryArray);
    }

    layout() {
        let calculatedHeight = `calc(100% - ${this.buttonArea.height() + 25}px)`;
        this.displayArea.height(calculatedHeight);
    }

    notifyCollectionAdd(collection, taggedEntityWidgets) {
        let taggedEntityWidget = taggedEntityWidgets[0];
        let lemma = this.entityLemmaMap.get(taggedEntityWidget);
        let tag = this.entityTagMap.get(taggedEntityWidget);
        if (lemma === undefined || tag === undefined) throw new Error(`TaggedEntityWidget not found`);

        let categoryMap = this.categories.get(tag);
        if (categoryMap === undefined) throw new Error(`Category ${tag} not found`);
        let lemmaWidget = categoryMap.get(lemma);
        this.scrollTo(lemmaWidget.element);
        lemmaWidget.highlight(true);
    }

    notifyCollectionClear(collection, taggedEntityWidgets) {
        for (let taggedEntityWidget of taggedEntityWidgets) {
            let lemma = this.entityLemmaMap.get(taggedEntityWidget);
            let tag = this.entityTagMap.get(taggedEntityWidget);
            if (lemma === undefined || tag === undefined) {
                throw new Error(`TaggedEntityWidget not found: ${lemma} - ${tag} for ${taggedEntityWidget.lemma()} - ${taggedEntityWidget.tag()}`);
            }

            let categoryMap = this.categories.get(tag);
            if (categoryMap === undefined) throw new Error(`Category ${tag} not found`);
            let lemmaWidget = categoryMap.get(lemma);
            lemmaWidget.highlight(false);
        }
    }

    scrollTo(element) {
        let eleTop = $(element).offset().top;
        let eleBottom = eleTop + $(element).height();
        let dispTop = $("#displayArea").offset().top;
        let dispBottom = dispTop + $("#displayArea").height();
        
        if (eleTop > dispTop && eleBottom < dispBottom) return;
        
        let diffTop = eleTop - dispTop;
        let scrollTo = diffTop + $("#displayArea").scrollTop() - $("#displayArea").height() / 2;
        $("#displayArea").scrollTop(scrollTo);
    }
}

module.exports = LemmaDialogWidget;

