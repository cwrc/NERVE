

class EntityPanelLemmaDialogListener{
    
    constructor(entityPanel, lemmaDialog){
        if (!entityPanel) throw new Error("Missing entityPanel");
        if (!lemmaDialog) throw new Error("Missing lemmaDialog");
        
        this.entityPanel = entityPanel;
        this.lemmaDialog = lemmaDialog;
        
        entityPanel.addListener(this);
        lemmaDialog.addListener(this);
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
     * Event received from LemmaDialog
     * @param {type} lemmaDialogWidget
     * @param {type} tag
     * @param {type} lemma
     * @returns {undefined}
     */
    notifyClickLemmaWidget(lemmaDialogWidget, tag, lemma){
        this.entityPanel.emptyCollection();
        this.entityPanel.selectByLemmaTag(lemma, tag);
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
}

module.exports = EntityPanelLemmaDialogListener;
