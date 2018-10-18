
class EntityPanelListener{
    
    constructor(entityPanelWidget){
        this.widget = entityPanelWidget;
    }
    
    notifyCWRCSelection(values) {
        for (let taggedEntityWidget of this.widget.selectedEntities) {
            taggedEntityWidget.values(values);
        }
    }

    notifyDialogChange(changes, current) {
        for (let taggedEntityWidget of this.widget.selectedEntities){
            taggedEntityWidget.values(changes);
        }
        this.widget.latestValues = current.clone();
    }    
    
    onMenuUntag() {
        if (this.widget.selectedEntities.isEmpty()) return 0;

        let taggedEntityArray = [];
        let textNodeArray = [];
        
        for (let taggedEntityWidget of this.widget.selectedEntities) {
            taggedEntityArray.push(taggedEntityWidget);
            let text = taggedEntityWidget.untag();
            textNodeArray.push(text);
        }
        this.widget.selectedEntities.clear();
        this.widget.notifyListeners("notifyUntaggedEntities", taggedEntityArray, textNodeArray);
    }
    
    notifyCollectionClear() {
        this.widget.lemmaFlag = false;
    }

    notifyCollectionAdd() {
        this.widget.lemmaFlag = false;
    }

    notifyCollectionRemove() {
        this.widget.lemmaFlag = false;
    }  
    
    async notifyClickLemmaWidget(lemma, tag, double, control, shift, alt) {
        if (this.widget.lemmaFlag === true && lemma === this.widget.lastLemma && tag === this.widget.lastTag) {
            this.widget.lemmaIndex++;
            if (this.widget.lemmaIndex >= this.widget.selectedEntities.size()) this.widget.lemmaIndex = 0;
        } else {
            if (!control) this.widget.__emptyCollection();
            await this.widget.selectByLemmaTag(lemma, tag);

            this.widget.lemmaFlag = true;
            this.widget.lemmaIndex = 0;
            this.widget.lastLemma = lemma;
            this.widget.lastTag = tag;
        }

        let taggedEntity = this.widget.selectedEntities.get(this.widget.lemmaIndex);
        this.widget.scrollTo(taggedEntity.getElement());
    }    
    
    async onMenuClear() {
        this.widget.emptyCollection();
    }
    
    notifySelectCategory(categoryButton) {
        let category = categoryButton.getCategory();
//        for (let TaggedEntityWidget of this.widget.taggedEntities) {
//            if (TaggedEntityWidget.tag() === category) {
//                TaggedEntityWidget.setHasBackground(true);
//            }
//        }
        this.widget.selectedCategories.set(category, category);
    }

    notifyUnselectCategory(categoryButton) {
        let category = categoryButton.getCategory();
    }

    notifyAddCategories(categoryArray) {
        for (let category of categoryArray) {
            for (let TaggedEntityWidget of this.widget.taggedEntities) {
                if (TaggedEntityWidget.tag() === category) {
                    TaggedEntityWidget.setHasBackground(true);
                }
            }
            this.widget.selectedCategories.set(category, category);
        }
    }

    notifySelectLemmaWidget(lemmaWidget) {
        this.widget.lemmaWidget = lemmaWidget;
    }
    notifyUnselectLemmaWidget(lemmaWidget) {
        this.widget.lemmaWidget = null;
    }

    notifyReselectLemmaWidget(lemmaWidget) {
        this.widget.index++;
        if (this.widget.index >= lemmaWidget.entities().length) this.widget.index = 0;
        this.widget.scrollTo(lemmaWidget.entities()[this.widget.index]);
    }

    async onMenuMerge() {
        let entity = await this.widget.mergeEntities(this.widget.collection);
        this.widget.selectedEntities.set(entity);
    }

    async onMenuTag() {
        await this.widget.tagSelection(window.getSelection());
    }    
}

module.exports = EntityPanelListener;

