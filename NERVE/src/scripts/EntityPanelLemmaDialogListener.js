class EntityPanelLemmaDialogListener{
    
    constructor(entityPanel, lemmaDialog){
        if (!entityPanel) throw new Error("Missing entityPanel");
        if (!lemmaDialog) throw new Error("Missing lemmaDialog");
        
        this.entityPanel = entityPanel;
        this.lemmaDialog = lemmaDialog;
        
        entityPanel.addListener(this);
        lemmaDialog.addListener(this);
        
        this.lastLemmaClick = {tag: "", lemma: "", array: [], n: 0};
    }
    
    /**
     * Event received from LemmaDialog
     * @param {type} lemmaDialogWidget
     * @param {type} targetTag
     * @param {type} targetLemma
     * @param {type} taggedEntityWidget
     * @returns {undefined}
     */
    notifyLemmaDropObject(lemmaDialogWidget, targetTag, targetLemma, taggedEntityWidget){
        if (taggedEntityWidget.tag() !== targetTag){
            taggedEntityWidget.tag(targetTag);
        }
        if (taggedEntityWidget.lemma() !== targetLemma){
            taggedEntityWidget.lemma(targetLemma);
        }
    }
    
    /**
     * Event received from LemmaDialog
     * @param {type} lemmaDialogWidget
     * @param {type} targetTag
     * @param {type} taggedEntityWidget
     * @returns {undefined}
     */
    notifyCategoryDropObject(lemmaDialogWidget, targetTag, taggedEntityWidget){
        let selectedWidgets = this.entityPanel.getSelectedEntities();
        if (selectedWidgets.isEmpty()) selectedWidgets.add(taggedEntityWidget);
        
        for (let selectedWidget of selectedWidgets){
            if (selectedWidget.tag() !== targetTag){
                selectedWidget.tag(targetTag);
            }
        }
    }
    
    /**
     * Event received from LemmaDialog when lemma widget is clicked.
     * @param {type} lemmaDialogWidget
     * @param {type} tag
     * @param {type} lemma
     * @returns {undefined}
     */
    notifyClickLemmaWidget(lemmaDialogWidget, tag, lemma){
        if (this.lastLemmaClick.tag === tag && this.lastLemmaClick.lemma === lemma){
            this.lastLemmaClick.n = this.lastLemmaClick.n + 1;
            if (this.lastLemmaClick.n >= this.lastLemmaClick.array.length){
                this.lastLemmaClick.n = 0;
            }
        } else {
            this.entityPanel.emptyCollection();
            this.entityPanel.selectByLemmaTag(lemma, tag);
            let taggedEntityWidgets = lemmaDialogWidget.getObjects(tag, lemma);
            this.lastLemmaClick = {tag: tag, lemma: lemma, array: taggedEntityWidgets, n: 0};            
        }
        
        let nextWidget = this.lastLemmaClick.array[this.lastLemmaClick.n];
        this.entityPanel.scrollTo(nextWidget);
    }
    
    /**
     * Event received from TaggedEntityWidget via EntityPanel.
     * @param {type} taggedEntityWidget
     * @returns {undefined}
     */
    notifyEntityDragStart(taggedEntityWidget){
        this.entityPanel.addSelected(taggedEntityWidget);
    }
    
    /**
     * Event received from EntityPanel.
     * @returns {undefined}
     */
    notifyClearDocument(){
        this.lemmaDialog.clearLemmas();
    }
    
    /**
     * Event received from LemmaDialog.
     * @param {type} lemmaDialogWidget
     * @param {type} tags
     * @param {type} state
     * @returns {undefined}
     */
    notifyEyeState(lemmaDialogWidget, tags, show){
        for (let tag of tags){
            this.entityPanel.setAttribute(`data-hide-${tag}`, `${!show}`);
        }
    }
}

module.exports = EntityPanelLemmaDialogListener;
