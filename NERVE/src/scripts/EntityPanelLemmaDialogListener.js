

class EntityPanelLemmaDialogListener{
    
    constructor(entityPanel, lemmaDialog){
        if (!entityPanel) throw new Error("Missing entityPanel");
        if (!lemmaDialog) throw new Error("Missing lemmaDialog");
        
        this.entityPanel = entityPanel;
        this.lemmaDialog = lemmaDialog;
        
        entityPanel.addListener(this);
        lemmaDialog.addListener(this);
    }
    
    notifyLemmaDropObject(lemmaDialogWidget, targetTag, targetLemma, taggedEntityWidget){
        if (taggedEntityWidget.tag() !== targetTag){
            taggedEntityWidget.tag(targetTag);
        }
        if (taggedEntityWidget.lemma() !== targetLemma){
            taggedEntityWidget.lemma(targetLemma);
        }
    }
    
    notifyCategoryDropObject(lemmaDialogWidget, targetTag, taggedEntityWidget){
        let selectedWidgets = this.entityPanel.getSelectedEntities();
        if (selectedWidgets.isEmpty()) selectedWidgets.add(taggedEntityWidget);
        
        for (let selectedWidget of selectedWidgets){
            if (selectedWidget.tag() !== targetTag){
                selectedWidget.tag(targetTag);
            }
        }
    }
    
    notifyClickLemmaWidget(lemmaDialogWidget, tag, lemma){
        this.entityPanel.emptyCollection();
        this.entityPanel.selectByLemmaTag(lemma, tag);
    }
    
    notifyEntityDragStart(taggedEntityWidget){
        this.entityPanel.addSelected(taggedEntityWidget);
    }
}

module.exports = EntityPanelLemmaDialogListener;
