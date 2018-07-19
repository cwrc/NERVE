const ArrayList = require("jjjrmi").ArrayList;
const Collection = require("./model/Collection");
const EntityValues = require("../gen/EntityValues");
const TaggedEntityWidget = require("./model/TaggedEntityWidget");

class EnityPanelWidget extends AbstractModel {

    constructor(dragDropHandler) {
        super();
        this.lemmaWidget = null;
        this.index = -1;
        this.context = null;
        this.selectedCategories = new Map();
        this.taggedEntities = new ArrayList(); /* a list of all tagged entities in the document */
        this.selectedEntities = new Collection();
        this.selectedEntities.setDelegate(this);
        this.addListener(this);
        this.lemmaFlag = false;
        this.lemmaIndex = 0;
        this.stylename = "";
        this.schema = null;
        this.latestValues = new EntityValues();
        this.copyValues = new EntityValues();
        this.dictionary = null;
        this.dragDropHandler = dragDropHandler;

        /* Default Document Click Event */
        $("#entityPanel").click((event) => {
            if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
                this.notifyListeners("notifyDocumentClick");
            }
        });
    }

    async init(dictionary) {
        this.dictionary = dictionary;
    }

    setStyle(stylename) {
        if (this.stylename !== "") {
            $("#entityPanel").removeClass(this.stylename);
        }
        $("#entityPanel").addClass(stylename);
        this.stylename = stylename;
    }

    async onMenuClear() {
        this.__emptyCollection();
    }

    __emptyCollection() {
        for (let collectionEntity of this.selectedEntities) {
            collectionEntity.highlight(false);
        }
        this.selectedEntities.clear();
    }

    notifyCWRCSelection(values) {
        for (let taggedEntityWidget of this.selectedEntities) {
            taggedEntityWidget.values(values);
        }
    }

    notifyDialogChange(changes, current) {
        for (let taggedEntityWidget of this.selectedEntities){
            taggedEntityWidget.values(changes);
        }
        this.latestValues = current.clone();
    }

    onMenuUntag() {
        if (this.selectedEntities.isEmpty()) return 0;

        let taggedEntityArray = [];
        let textNodeArray = [];
        
        for (let taggedEntityWidget of this.selectedEntities) {
            taggedEntityArray.push(taggedEntityWidget);
            let text = taggedEntityWidget.untag();
            textNodeArray.push(text);
        }
        this.selectedEntities.clear();
        this.notifyListeners("notifyUntaggedEntities", taggedEntityArray, textNodeArray);
    }

    notifyCollectionClear() {
        this.lemmaFlag = false;
    }

    notifyCollectionAdd() {
        this.lemmaFlag = false;
    }

    notifyCollectionRemove() {
        this.lemmaFlag = false;
    }

    async notifyClickLemmaWidget(lemma, tag, double, control, shift, alt) {
        if (this.lemmaFlag === true && lemma === this.lastLemma && tag === this.lastTag) {
            this.lemmaIndex++;
            if (this.lemmaIndex >= this.selectedEntities.size()) this.lemmaIndex = 0;
        } else {
            if (!control) this.__emptyCollection();
            await this.selectByLemmaTag(lemma, tag);

            this.lemmaFlag = true;
            this.lemmaIndex = 0;
            this.lastLemma = lemma;
            this.lastTag = tag;
        }

        let taggedEntity = this.selectedEntities.get(this.lemmaIndex);
        this.scrollTo(taggedEntity.getElement());
    }

    async selectByLemmaTag(lemma, tag) {
        let entityArray = [];
        for (let taggedEntity of this.taggedEntities) {
            if (taggedEntity.lemma() !== lemma) continue;
            if (taggedEntity.tag() !== tag) continue;
            entityArray.push(taggedEntity);
            taggedEntity.highlight(true);
        }
        await this.selectedEntities.set(entityArray);
    }

    notifyDocumentClick() {
        this.__emptyCollection();
    }

    notifyTaggedEntityClick(taggedEntity, double, control, shift, alt) {
        if (double) {
            if (!control) this.__emptyCollection();
            this.selectByLemmaTag(taggedEntity.lemma(), taggedEntity.tag());
        } else if (control && !this.selectedEntities.contains(taggedEntity)) {
            this.selectedEntities.add(taggedEntity);
            taggedEntity.highlight(true);
        } else if (control && this.selectedEntities.contains(taggedEntity)) {
            this.selectedEntities.remove(taggedEntity);
            taggedEntity.highlight(false);
        } else {
            this.__emptyCollection();
            this.selectedEntities.add(taggedEntity);
            taggedEntity.highlight(true);
        }
    }

    notifyContextChange(context, schema) {
        this.context = context;
        this.schema = schema;
        this.selectedCategories = new Map();

        let styles = this.context.styles();
        this.setStyle(styles.get(0));
    }

    notifyRestoredTaggedEntities(taggedEntityWidgetArray) {
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            this.taggedEntities.add(taggedEntityWidget);
        }
    }

    notifyNewTaggedEntities(taggedEntityWidgetArray) {
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            this.taggedEntities.add(taggedEntityWidget);
        }
    }
    
    notifyRevertTaggedEntities(taggedEntityWidgetArray) {
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            this.taggedEntities.remove(taggedEntityWidget);
        }
    }

    notifyUntaggedEntities(taggedEntityWidgetArray) {
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            this.taggedEntities.remove(taggedEntityWidget);
        }
    }

    notifySelectCategory(categoryButton) {
        let category = categoryButton.getCategory();
//        for (let TaggedEntityWidget of this.taggedEntities) {
//            if (TaggedEntityWidget.tag() === category) {
//                TaggedEntityWidget.setHasBackground(true);
//            }
//        }
        this.selectedCategories.set(category, category);
    }

    notifyUnselectCategory(categoryButton) {
        let category = categoryButton.getCategory();
    }

    notifyAddCategories(categoryArray) {
        for (let category of categoryArray) {
            for (let TaggedEntityWidget of this.taggedEntities) {
                if (TaggedEntityWidget.tag() === category) {
                    TaggedEntityWidget.setHasBackground(true);
                }
            }
            this.selectedCategories.set(category, category);
        }
    }

    notifySelectLemmaWidget(lemmaWidget) {
        this.lemmaWidget = lemmaWidget;
    }
    notifyUnselectLemmaWidget(lemmaWidget) {
        this.lemmaWidget = null;
    }

    notifyReselectLemmaWidget(lemmaWidget) {
        this.index++;
        if (this.index >= lemmaWidget.entities().length) this.index = 0;
        this.scrollTo(lemmaWidget.entities()[this.index]);
    }

    scrollTo(element) {
        let elementRelativeTop = $(element).offset().top - $("#panelContainer").offset().top;
        let scrollTo = elementRelativeTop + $("#panelContainer").scrollTop() - $("#panelContainer").height() / 2;
        $("#panelContainer").scrollTop(scrollTo);
    }

    async onMenuMerge() {
        let entity = await this.mergeEntities(this.collection);
        this.selectedEntities.set(entity);
    }

    async onMenuTag() {
        await this.tagSelection(window.getSelection());
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
            let contentElement = entity.getContentElement();
            $(entity.getElement()).replaceWith(contentElement);
            contents = contents.add(contentElement);
            taggedEntityArray.push(entity);
        }

        this.selectedEntities.clear();
        this.notifyListeners("notifyUntaggedEntities", taggedEntityArray);

        contents = contents.mergeElements();
        contents[0].normalize();
        return this.createTaggedEntity(contents[0]);
    }

    async createTaggedEntity(element) {
        let values = this.latestValues;

        values.text(null);
        values.lemma(null);

        let taggedEntity = new TaggedEntityWidget(this.dragDropHandler, element, values.tag());
        taggedEntity.values(values, true);

        let result = await this.dictionary.lookup(taggedEntity.text(), taggedEntity.lemma(), taggedEntity.tag(), null);
        if (result.size() > 0) {
            let first = result.get(0);
            taggedEntity.datasource(first.getEntry("source").getValue(), true);
            taggedEntity.link(first.getEntry("link").getValue(), true);
        }

        this.notifyListeners("notifyNewTaggedEntities", [taggedEntity]);
        this.selectedEntities.set(taggedEntity);
        return taggedEntity;
    }

    /* seperate so that the model isn't saved twice on merge */
    async tagSelection(selection) {
        if (selection.rangeCount === 0) return null;

        let range = selection.getRangeAt(0);
        range = this.__trimRange(range);

        let tagName = this.latestValues.tag();
        console.log(tagName);
        let schemaTagName = this.context.getTagInfo(tagName).getName();

        if (!this.schema.isValid(range.commonAncestorContainer, schemaTagName)) {
            this.notifyListeners("userMessage", `Tagging "${schemaTagName}" is not valid in the Schema at this location.`);
            return null;
        }

        var element = document.createElement("div");
        $(element).append(range.extractContents());

        let taggedEntity = await this.createTaggedEntity(element);

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

module.exports = EnityPanelWidget;