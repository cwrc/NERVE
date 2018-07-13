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

/**
 * A LemmaWidget is created for every unique lemma value in the document.
 */
class LemmaWidget {
    constructor(text, lemma, category, delegate, dragDropHandler) {
        Utility.log(LemmaWidget, "constructor");

        this.lemma = lemma;
        this.category = category;
        this.dragDropHandler = dragDropHandler;

        this.element = $(document.createElement("button"));
        this.element.addClass("btn");
        this.element.addClass("btn-primary");
        this.element.text(text);

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

        this.appendTo("#lemmaDialog > #displayArea");
    }
    drop(event) {
        if (this.dragDropHandler.hasData("lemmaWidget")) {
            let src = this.dragDropHandler.deleteData("lemmaWidget");
            for (let entity of src.taggedEntities) {
                entity.lemma(this.lemma);
                entity.tag(this.category);
            }
        } else if (this.dragDropHandler.hasData("TaggedEntityWidget")) {
            let src = this.dragDropHandler.deleteData("TaggedEntityWidget");
            src.lemma(this.lemma);
            src.tag(this.category);
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
    active(value) {
        if (value === undefined) return $(this.element).hasClass("highlight");
        else if (value) $(this.element).addClass("highlight");
        else $(this.element).removeClass("highlight");
    }

    addEntity(taggedEntityWidget) {
        if (this.taggedEntities.contains(taggedEntityWidget)) return false;
        this.taggedEntities.add(taggedEntityWidget);
        return true;
    }
    removeEntity(taggedEntityWidget) {
        if (!this.taggedEntities.contains(taggedEntityWidget)) return false;
        this.taggedEntities.remove(taggedEntityWidget);
        return true;
    }
    entityCount() {
        return this.taggedEntities.size();
    }
}

class CategoryButton {
    constructor(text, category, lemmaDialogWidget) {
        this.category = category;
        this.element = $(document.createElement("button"));
        this.element.addClass("btn");
        this.element.addClass("btn-primary");
        this.element.addClass("active");
        this.element.text(text);

        $(this.element).mouseup(() => {
            lemmaDialogWidget.toggleCategory(this);
        });
        $(this.element).dblclick(() => {
            lemmaDialogWidget.selectNoCategories();
            lemmaDialogWidget.selectCategory(this);
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
}

/**
 * Listens for event triggers that will manipulate lemma dialog model.
 */
class LemmaDialogWidget extends AbstractModel {
    constructor(dragDropHandler) {
        super();

        this.categories = new Map();
        this.dragDropHandler = dragDropHandler;
        this.categoryButtons = [];

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

    async notifyContextChange(context) {
        this.context = context;

        for (let button of this.categoryButtons) {
            button.detach();
        }
        this.categoryButtons = [];
        this.categories = new Map();

        for (let tagInfo of context.tags()) {
            if (this.categories.has(tagInfo.getStandard())) continue;
            this.categories.set(tagInfo.getStandard(), new Map());
            let button = new CategoryButton(tagInfo.getName(), tagInfo.getStandard(), this);
            this.categoryButtons.push(button);
        }
    }

    newTaggedEntity(taggedEntityWidget) {
        let lemma = taggedEntityWidget.lemma();
        let tag = taggedEntityWidget.tag();
        let categoryMap = this.categories.get(tag);

        console.log(tag);
        console.log(categoryMap);

        if (categoryMap.has(lemma)) return;

        let text = lemma + " - " + this.context.getTagInfo(tag).getName();
        let lemmaWidget = new LemmaWidget(text, lemma, tag, this, this.dragDropHandler);
        categoryMap.set(lemma, lemmaWidget);
    }

    async notifyNewTaggedEntities(taggedEntityWidgetArray) {
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            this.newTaggedEntity(taggedEntityWidget);
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

//
//    notifyUnsetDocument() {
//        let lemmaWidgetArray = [];
//        for (let taggedEntityWidget of this.taggedEntityList) {
//            let lemmaWidget = this.getWidget(taggedEntityWidget.lemma(), taggedEntityWidget.tag());
//            lemmaWidgetArray.push(lemmaWidget);
//            lemmaWidget.removeEntity(taggedEntityWidget);
//
//            if (lemmaWidget.entityCount() === 0) {
//                this.removeWidget(taggedEntityWidget.lemma(), taggedEntityWidget.tag());
//            }
//        }
//        this.notifyListeners("notifyRemoveLemmas", lemmaWidgetArray);
//    }
//
//    async notifyEntityUpdate(taggedEntityWidget, oldValues) {
//        let lemmaWidget = this.addWidget(taggedEntityWidget.lemma(), taggedEntityWidget.tag());
//        this.notifyListeners("notifyAddLemmas", [lemmaWidget]);
//
//        let oldLemma = taggedEntityWidget.lemma();
//        let oldTag = taggedEntityWidget.tag();
//        if (oldValues.lemma() !== null) oldLemma = oldValues.lemma();
//        if (oldValues.tag() !== null) oldTag = oldValues.tag();
//
//        let oldLemmaWidget = this.getWidget(oldLemma, oldTag);
//        let newLemmaWidget = this.getWidget(taggedEntityWidget.lemma(), taggedEntityWidget.tag());
//        oldLemmaWidget.removeEntity(taggedEntityWidget);
//        newLemmaWidget.addEntity(taggedEntityWidget);
//
//        if (oldLemmaWidget.entityCount() === 0) {
//            let lemmaWidget = this.removeWidget(oldLemma, oldTag);
//            this.notifyListeners("notifyRemoveLemmas", [lemmaWidget]);
//        }
//    }
//
//    async notifyNewTaggedEntities(taggedEntityWidgetArray) {
//        let lemmaWidgetArray = [];
//
//        for (let taggedEntityWidget of taggedEntityWidgetArray) {
//            let lemma = taggedEntityWidget.lemma();
//            let tag = taggedEntityWidget.tag();
//            
//            let key = lemma + ":" + tag;
//            if (this.lemmaWidgets.has(key)) return this.lemmaWidgets.get(key);
//            let lemmaWidget = new LemmaWidget(lemma, tag, this, this.dragDropHandler);
//            this.lemmaWidgets.set(key, lemmaWidget);
//            
//            this.taggedEntityList.add(taggedEntityWidget);
//            lemmaWidget.addEntity(taggedEntityWidget);
//            lemmaWidgetArray.push(lemmaWidget);
//            
//            lemmaWidget.appendTo("#lemmaDialog > #displayArea");
//            this.lemmaWidgets.set(key, lemmaWidget);
//
//            if (!this.categoryButtons.has(lemmaWidget.getCategory())) {
//                console.warn("category not found: " + lemmaWidget.getCategory());
//                return;
//            }
//
//            let categoryButton = this.categoryButtons.get(lemmaWidget.getCategory());
//            if (categoryButton.active()) lemmaWidget.show();
//            else lemmaWidget.hide();            
//        }
//        this.notifyListeners("notifyAddLemmas", lemmaWidgetArray);
//    }
//
//    async notifyUntaggedEntities(taggedEntityWidgetArray) {
//        let lemmaWidgetArray = [];
//
//        for (let taggedEntityWidget of taggedEntityWidgetArray) {
//            this.taggedEntityList.remove(taggedEntityWidget);
//            let lemmaWidget = this.getWidget(taggedEntityWidget.lemma(), taggedEntityWidget.tag());
//
//            if (lemmaWidget === null || lemmaWidget === undefined) {
//                let error = new Error("Undefined Lemma Widget");
//                error.taggedEntityWidget = taggedEntityWidget;
//                window.error = error;
//                throw error;
//            }
//
//            lemmaWidget.removeEntity(taggedEntityWidget);
//            if (lemmaWidget.entityCount() === 0) {
//                let lemmaWidget = this.removeWidget(taggedEntityWidget.lemma(), taggedEntityWidget.tag());
//                lemmaWidgetArray.push(lemmaWidget);
//            }
//        }
//        this.notifyListeners("notifyRemoveLemmas", lemmaWidgetArray);
//    }
//
//    hasWidget(lemma, category) {
//        let key = lemma + ":" + category;
//        return this.lemmaWidgets.has(key);
//    }
//
//    removeWidget(lemma, category) {
//        let key = lemma + ":" + category;
//        if (!this.lemmaWidgets.has(key)) return;
//        let lemmaWidget = this.lemmaWidgets.get(key);
//        lemmaWidget.detach();
//        this.lemmaWidgets.delete(key);
//        return lemmaWidget;
//    }
//
//    getWidget(lemma, category) {
//        let key = lemma + ":" + category;
//        return this.lemmaWidgets.get(key);
//    }
//

//    selectCategory(categoryButton) {
//        if (!categoryButton.active()) {
//            categoryButton.active(true);
//            this.notifyListeners("notifySelectCategory", categoryButton);
//        }
//    }
//    unselectCategory(categoryButton) {
//        if (categoryButton.active()) {
//            categoryButton.active(false);
//            this.notifyListeners("notifyUnselectCategory", categoryButton);
//        }
//    }
//
    layout() {
        let calculatedHeight = `calc(100% - ${this.buttonArea.height() + 25}px)`;
        this.displayArea.height(calculatedHeight);
    }
//
//    notifyAddCategories(categoryButtonArray) {
//        for (let categoryButton of categoryButtonArray) {
//            categoryButton.appendTo(this.buttonArea);
//            this.categoryButtons.set(categoryButton.getCategory(), categoryButton);
//        }
//        this.layout();
//    }
//
//    notifyRemoveLemmas(lemmaWidgetArray) {
//        for (let lemmaWidget of lemmaWidgetArray) {
//            lemmaWidget.detach();
//            let index = this.lemmaWidgets.indexOf(lemmaWidget);
//            this.lemmaWidgets.splice(index, 1);
//        }
//    }
//    notifyUnselectCategory(categoryButton) {
//        for (let widget of this.lemmaWidgets) {
//            let category = categoryButton.getCategory();
//            if (widget.getCategory() === category) {
//                widget.hide();
//            }
//        }
//    }
//    notifySelectCategory(categoryButton) {
//        for (let widget of this.lemmaWidgets) {
//            let category = categoryButton.getCategory();
//            if (widget.getCategory() === category) {
//                widget.show();
//            }
//        }
//    }
//
//    scrollTo(lemmaWidget) {
//        let element = lemmaWidget.element;
//
//        $("#displayArea").scrollTop(
//                $(element).offset().top - $("#displayArea").offset().top + $("#displayArea").scrollTop() - ($("#displayArea").height() / 2)
//                );
//    }
}
;

module.exports = LemmaDialogWidget;