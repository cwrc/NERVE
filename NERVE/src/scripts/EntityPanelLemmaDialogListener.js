

class EntityPanelLemmaDialogListener{
    
    constructor(entityPanel, lemmaDialog){
        if (!entityPanel) throw new Error("Missing entityPanel");
        if (!lemmaDialog) throw new Error("Missing lemmaDialog");
        
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
        if (taggedEntityWidget.tag() !== targetTag){
            taggedEntityWidget.tag(targetTag);
        }        
    }
}

module.exports = EntityPanelLemmaDialogListener;
