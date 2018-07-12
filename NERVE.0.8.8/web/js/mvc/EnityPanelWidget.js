const ArrayList = require("jjjrmi").ArrayList;
const Collection = require("./model/Collection");

class EnityPanelWidget extends AbstractModel {

    constructor() {
        super();
        this.lemmaWidget = null;
        this.index = -1;
        this.context = null;
        this.selectedCategories = new Map();
        this.taggedEntities = new ArrayList(); /* a list of all tagged entities in the document */
        this.selectedEntities = new Collection();
        this.selectedEntities.setDelegate(this);
        this.addListener(this);
        
        /* Default Document Click Event */
        $("#entityPanel").click((event) => {
            if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
                this.notifyListeners("notifyDocumentClick");
            }
        });        
    }

    __emptyCollection() {
        for (let collectionEntity of this.selectedEntities) {
            collectionEntity.highlight(false);
        }
        this.selectedEntities.clear();
    }

    notifyCWRCSelection(values){
        for (let taggedEntityWidget of this.selectedEntities) {
            taggedEntityWidget.values(values);
        }
    }

    notifyDialogChange(fieldID, value) {
        for (let taggedEntityWidget of this.selectedEntities) {
            switch (fieldID) {
                case "entityText":
                    taggedEntityWidget.text(value);
                    break;
                case "lemma":
                    taggedEntityWidget.lemma(value);
                    break;
                case "link":
                    taggedEntityWidget.link(value);
                    break;
                case "tagName":
                    taggedEntityWidget.tag(value);
                    break;
            }
        }
    }

    requestUntagAll() {
        if (this.selectedEntities.isEmpty()) return 0;
        for (let taggedEntityWidget of this.selectedEntities) {
            taggedEntityWidget.untag();
        }
        this.selectedEntities.clear();
    }

    notifyClickLemmaWidget(lemmaWidget, double, control, shift, alt) {
        if (!control) this.__emptyCollection();

        for (let taggedEntity of this.taggedEntities) {
            if (taggedEntity.lemma() !== lemmaWidget.getLemma()) continue;
            if (taggedEntity.tag() !== lemmaWidget.getCategory()) continue;
            this.selectedEntities.add(taggedEntity);
            taggedEntity.highlight(true);
        }
    }

    notifyDocumentClick() {
        this.__emptyCollection();
    }

    notifyTaggedEntityClick(taggedEntity, double, control, shift, alt) {
        if (double) {
            window.alert("TODO: select like entities by lemma");
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

    notifyContextChange(context) {
        this.context = context;
        this.selectedCategories = new Map();
    }

    notifyNewTaggedEntities(taggedEntityWidgetArray) {
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            let value = this.selectedCategories.has(taggedEntityWidget.tag());
            taggedEntityWidget.setHasBackground(value);
            this.taggedEntities.add(taggedEntityWidget);
        }
    }

    notifyUntaggedEntities(taggedEntityWidgetArray) {
        for (let taggedEntityWidget of taggedEntityWidgetArray) {
            this.taggedEntities.remove(taggedEntityWidget);
        }
    }

    notifySelectCategory(categoryButton) {
        let category = categoryButton.getCategory();
        for (let TaggedEntityWidget of this.taggedEntities) {
            if (TaggedEntityWidget.tag() === category) {
                TaggedEntityWidget.setHasBackground(true);
            }
        }
        this.selectedCategories.set(category, category);
    }

    notifyUnselectCategory(categoryButton) {
        let category = categoryButton.getCategory();
        for (let TaggedEntityWidget of this.taggedEntities) {
            if (TaggedEntityWidget.tag() === category) {
                TaggedEntityWidget.setHasBackground(false);
            }
        }
        this.selectedCategories.delete(category);
    }

    notifyAddCategories(categoryButtonArray) {
        for (let categoryButton of categoryButtonArray) {
            let category = categoryButton.getCategory();
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

    scrollTo(TaggedEntityWidget) {
        let element = TaggedEntityWidget.getElement();

        $("#panelContainer").scrollTop(
                $(element).offset().top - $("#panelContainer").offset().top + $("#panelContainer").scrollTop() - ($("#panelContainer").height() / 2)
                );
    }
}

module.exports = EnityPanelWidget;