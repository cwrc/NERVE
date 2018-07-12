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
    constructor(lemma, category, delegate, dragDropHandler) {
        Utility.log(LemmaWidget, "constructor");

        this.lemma = lemma;
        this.category = category;
        this.taggedEntities = new ArrayList();

        this.dragDropHandler = dragDropHandler;
        this.element = $(document.createElement("button"));
        this.element.addClass("btn");
        this.element.addClass("btn-primary");
        this.element.text(lemma + " : " + category);

        $(this.element).attr("draggable", "true");
        $(this.element).on("dragstart", (event) => this.dragstart(event));
        $(this.element).on("dragover", (event) => this.dragover(event));
        $(this.element).on("drop", (event) => this.drop(event));

        $(this.element).click((event) => {
            delegate.notifyListeners("notifyClickLemmaWidget", this, false, event.ctrlKey, event.shiftKey, event.altKey);
        });
        $(this.element).dblclick((event) => {
            delegate.notifyListeners("notifyClickLemmaWidget", this, true, event.ctrlKey, event.shiftKey, event.altKey);
        });
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
    constructor(text, category, lemmaDialogModel) {
        this.category = category;
        this.element = $(document.createElement("button"));
        this.element.addClass("btn");
        this.element.addClass("btn-primary");
        this.element.addClass("active");
        this.element.text(text);

        $(this.element).mouseup(() => {
            lemmaDialogModel.toggleCategory(this);
        });
        $(this.element).dblclick(() => {
            lemmaDialogModel.selectNoCategories();
            lemmaDialogModel.selectCategory(this);
        });
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
class LemmaDialogController {
    constructor(lemmaDialogModel) {
        this.lemmaDialogModel = lemmaDialogModel;
        this.taggedEntityList = new ArrayList();
    }

    /* event from Model */
    notifyUnsetDocument() {
        let lemmaWidgetArray = [];
        for (let taggedEntityWidget of this.taggedEntityList) {
            let lemmaWidget = this.lemmaDialogModel.getWidget(taggedEntityWidget.lemma(), taggedEntityWidget.tag());
            lemmaWidgetArray.push(lemmaWidget);
            lemmaWidget.removeEntity(taggedEntityWidget);

            if (lemmaWidget.entityCount() === 0) {
                this.lemmaDialogModel.removeWidget(taggedEntityWidget.lemma(), taggedEntityWidget.tag());
            }
        }
        this.lemmaDialogModel.notifyListeners("notifyRemoveLemmas", lemmaWidgetArray);
    }

    async notifyEntityUpdate(taggedEntityWidget, oldValues) {
        let lemmaWidget = this.lemmaDialogModel.addWidget(taggedEntityWidget.lemma(), taggedEntityWidget.tag());
        this.lemmaDialogModel.notifyListeners("notifyAddLemmas", [lemmaWidget]);

        let oldLemma = taggedEntityWidget.lemma();
        let oldTag = taggedEntityWidget.tag();
        if (oldValues.lemma() !== null) oldLemma = oldValues.lemma();
        if (oldValues.tag() !== null) oldTag = oldValues.tag();

        let oldLemmaWidget = this.lemmaDialogModel.getWidget(oldLemma, oldTag);
        let newLemmaWidget = this.lemmaDialogModel.getWidget(taggedEntityWidget.lemma(), taggedEntityWidget.tag());
        oldLemmaWidget.removeEntity(taggedEntityWidget);
        newLemmaWidget.addEntity(taggedEntityWidget);
        
        if (oldLemmaWidget.entityCount() === 0){
            let lemmaWidget = this.lemmaDialogModel.removeWidget(oldLemma, oldTag);
            this.lemmaDialogModel.notifyListeners("notifyRemoveLemmas", [lemmaWidget]);
        }
    }

    async notifyNewTaggedEntities(taggedEntityWidgetArray) {
        let lemmaWidgetArray = [];

        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            let lemmaWidget = this.lemmaDialogModel.addWidget(taggedEntityWidget.lemma(), taggedEntityWidget.tag());
            this.taggedEntityList.add(taggedEntityWidget);
            lemmaWidget.addEntity(taggedEntityWidget);
            lemmaWidgetArray.push(lemmaWidget);
        }
        this.lemmaDialogModel.notifyListeners("notifyAddLemmas", lemmaWidgetArray);
    }

    async notifyUntaggedEntities(taggedEntityWidgetArray) {
        let lemmaWidgetArray = [];
        
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            this.taggedEntityList.remove(taggedEntityWidget);
            let lemmaWidget = this.lemmaDialogModel.getWidget(taggedEntityWidget.lemma(), taggedEntityWidget.tag());

            if (lemmaWidget === null || lemmaWidget === undefined) {
                let error = new Error("Undefined Lemma Widget");
                error.taggedEntityWidget = taggedEntityWidget;
                window.error = error;
                throw error;
            }

            lemmaWidget.removeEntity(taggedEntityWidget);
            if (lemmaWidget.entityCount() === 0) {
                let lemmaWidget = this.lemmaDialogModel.removeWidget(taggedEntityWidget.lemma(), taggedEntityWidget.tag()); 
                lemmaWidgetArray.push(lemmaWidget);
            }
        }
        this.lemmaDialogModel.notifyListeners("notifyRemoveLemmas", lemmaWidgetArray);
    }

    async notifyContextChange(context) {
        this.lemmaDialogModel.clearCategories();
        let tags = context.tags();

        let categoryButtonArray = [];

        for (let tagInfo of tags) {
            let name = tagInfo.getName(nerscriber.NameSource.NAME);
            let categoryButton = this.lemmaDialogModel.addCategory(name);
            categoryButtonArray.push(categoryButton);
        }

        await this.lemmaDialogModel.notifyListeners("notifyAddCategories", categoryButtonArray);
    }
}

/**
 * The LemmaDialogModel generates multiple LemmaWidgets and CategoryButtons
 */
class LemmaDialogModel extends AbstractModel {
    constructor(dragDropHandler) {
        Utility.log(LemmaDialogModel, "constructor");
        super();

        this.dragDropHandler = dragDropHandler;
        this.categories = new Map();
        this.lemmaWidgets = new Map();

        $("#selectAllCategories").mouseup((event) => {
            this.selectAllCategories();
        });

        $("#selectNoCategories").mouseup((event) => {
            this.selectNoCategories();
        });
    }

    hasWidget(lemma, category) {
        Utility.log(LemmaDialogModel, "hasWidget");
        // Utility.enforceTypes(arguments, String, String);

        let key = lemma + ":" + category;
        return this.lemmaWidgets.has(key);
    }

    addWidget(lemma, category) {
        Utility.log(LemmaDialogModel, "addWidget");
        // Utility.enforceTypes(arguments, String, String);

        let key = lemma + ":" + category;
        if (this.lemmaWidgets.has(key)) return this.lemmaWidgets.get(key);
        let lemmaWidget = new LemmaWidget(lemma, category, this, this.dragDropHandler);
        this.lemmaWidgets.set(key, lemmaWidget);

        return lemmaWidget;
    }

    removeWidget(lemma, category) {
        let key = lemma + ":" + category;
        if (!this.lemmaWidgets.has(key)) return;
        let lemmaWidget = this.lemmaWidgets.get(key);
        lemmaWidget.detach();
        this.lemmaWidgets.delete(key);
        return lemmaWidget;
    }

    getWidget(lemma, category) {
        let key = lemma + ":" + category;
        return this.lemmaWidgets.get(key);
    }

    clearCategories() {
        for (let categoryButton of this.categories.values()) {
            categoryButton.detach();
        }
        this.categories.clear();
        this.notifyListeners("notifyClearCategories");
    }

    addCategory(category) {
        Utility.log(LemmaDialogModel, "addCategory");
        // Utility.enforceTypes(arguments, String);

        if (this.categories.has(category)) return;
        let button = new CategoryButton(category, category, this);
        this.categories.set(category, button);
        return button;
    }

    clear() {
        Utility.log(LemmaDialogModel, "clear");
        // Utility.enforceTypes(arguments);

        this.notifyListeners("notifyClearCategories", this.categories.values());
        let lemmaWidgetArray = [];
        for (let lemmaWidget of this.lemmaWidgets.values()) {
            lemmaWidgetArray.push(lemmaWidget);
        }
        this.notifyListeners("notifyRemoveLemmas", lemmaWidgetArray);

        this.categories = new Map();
        this.lemmaWidgets = new Map();
    }

    selectAllCategories() {
        Utility.log(LemmaDialogModel, "selectAllCategories");
        for (let b of this.categories.values()) {
            this.selectCategory(b);
        }
    }
    selectNoCategories() {
        Utility.log(LemmaDialogModel, "selectNoCategories");
        for (let b of this.categories.values()) {
            this.unselectCategory(b);
        }
    }
    selectCategory(categoryButton) {
        Utility.log(LemmaDialogModel, "selectCategory");
        if (!categoryButton.active()) {
            categoryButton.active(true);
            this.notifyListeners("notifySelectCategory", categoryButton);
        }
    }
    unselectCategory(categoryButton) {
        Utility.log(LemmaDialogModel, "unselectCategory");
        if (categoryButton.active()) {
            categoryButton.active(false);
            this.notifyListeners("notifyUnselectCategory", categoryButton);
        }
    }
    toggleCategory(categoryButton) {
        Utility.log(LemmaDialogModel, "toggleCategory");
        // Utility.enforceTypes(arguments, CategoryButton);

        if (!categoryButton.active()) {
            categoryButton.active(true);
            this.notifyListeners("notifySelectCategory", categoryButton);
        } else {
            categoryButton.active(false);
            this.notifyListeners("notifyUnselectCategory", categoryButton);
        }
    }
}

class LemmaDialogView {
    constructor() {
        Utility.log(LemmaDialogView, "constructor");

        this.lemmaWidgets = [];
        this.categoryButtons = new Map();
        this.currentHighlight = null;

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
    }
    layout() {
        Utility.log(LemmaDialogView, "layout");
        let calculatedHeight = `calc(100% - ${this.buttonArea.height() + 25}px)`;
        this.displayArea.height(calculatedHeight);
    }
    notifyClearCategories() {
        Utility.log(LemmaDialogView, "notifyClearCategories");
        for (let categoryButton of this.categoryButtons.values()) {
            categoryButton.detach();
        }
        this.lemmaWidgets = [];
        this.categoryButtons.clear();
        this.layout();
    }
    notifyAddCategories(categoryButtonArray) {
        Utility.log(LemmaDialogView, "notifyAddCategories");
        for (let categoryButton of categoryButtonArray) {
            categoryButton.appendTo(this.buttonArea);
            this.categoryButtons.set(categoryButton.getCategory(), categoryButton);
        }
        this.layout();
    }
    notifyAddLemmas(lemmaWidgetArray) {
        Utility.log(LemmaDialogView, "notifyAddLemmas");

        for (let lemmaWidget of lemmaWidgetArray) {
            lemmaWidget.appendTo(this.displayArea);
            this.lemmaWidgets.push(lemmaWidget);

            if (!this.categoryButtons.has(lemmaWidget.getCategory())) {
                console.warn("category not found: " + lemmaWidget.getCategory());
                return;
            }

            let categoryButton = this.categoryButtons.get(lemmaWidget.getCategory());
            if (categoryButton.active()) lemmaWidget.show();
            else lemmaWidget.hide();
        }

    }
    notifyRemoveLemmas(lemmaWidgetArray) {
        Utility.log(LemmaDialogView, "notifyRemoveLemmas");
        for (let lemmaWidget of lemmaWidgetArray) {
            lemmaWidget.detach();
            let index = this.lemmaWidgets.indexOf(lemmaWidget);
            this.lemmaWidgets.splice(index, 1);
        }
    }
    notifyUnselectCategory(categoryButton) {
        Utility.log(LemmaDialogView, "notifyUnselectCategory");
        for (let widget of this.lemmaWidgets) {
            let category = categoryButton.getCategory();
            if (widget.getCategory() === category) {
                widget.hide();
            }
        }
    }
    notifySelectCategory(categoryButton) {
        Utility.log(LemmaDialogView, "notifySelectCategory");
        for (let widget of this.lemmaWidgets) {
            let category = categoryButton.getCategory();
            if (widget.getCategory() === category) {
                widget.show();
            }
        }
    }

    scrollTo(lemmaWidget) {
        Utility.log(LemmaDialogView, "scrollTo");
        let element = lemmaWidget.element;

        $("#displayArea").scrollTop(
                $(element).offset().top - $("#displayArea").offset().top + $("#displayArea").scrollTop() - ($("#displayArea").height() / 2)
                );
    }
}
;

module.exports = {
    LemmaDialogModel: LemmaDialogModel,
    LemmaDialogController: LemmaDialogController,
    LemmaDialogView: LemmaDialogView
};