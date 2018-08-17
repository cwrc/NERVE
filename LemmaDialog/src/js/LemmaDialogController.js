/*
 * The lemma listener is the collection of methods that handle external events.
 * All entities must handle tag(), lemma(), tag(value), and lemma(value)
 * methods.
 */

const Collection = require("Collection");

class LemmaDialogController{
    constructor(lemmaDialog){
        this.lastCollection = new Collection();
        this.lemmaDialog = lemmaDialog;
    }
    
    notifyDocumentClick(){}
    notifyUntaggedEntities(entityArray, textNodeArray){}
    
    notifyNewTaggedEntities(entityArray){
        for (let entity of entityArray){
            this.lemmaDialog.setObject(entity.tag(), entity.lemma(), entity);
        }
    }
    
    notifyTaggedEntityClick(entity){
        this.lemmaDialog.scrollTo(entity.tag(), entity.lemma());
    }
    
    notifyEntityUpdate(entityArray, oldValues){
        if (entityArray.length === 0) return;
        
        for (let entity of entityArray){
            this.lemmaDialog.removeObject(entity);
            this.lemmaDialog.setObject(entity.tag(), entity.lemma(), entity);
        }
        
        this.lemmaDialog.clearHighlight();
        for (let entity of this.lastCollection){
            this.lemmaDialog.highlight(entity.tag(), entity.lemma());
        }        
        
        this.lemmaDialog.scrollTo(entityArray[0].tag(), entityArray[0].lemma());
    }
    
    notifyCollectionAdd(collectionClone, entityArray){
        for (let entity of entityArray){
            this.lemmaDialog.highlight(entity.tag(), entity.lemma());
        }
        let lastEntity = collectionClone.getLast();
        this.lemmaDialog.scrollTo(lastEntity.tag(), lastEntity.lemma());
        this.lastCollection = collectionClone;
    }
    
    notifyCollectionClear(collectionClone, entityArray){
        this.lastCollection = collectionClone;        
    }
    
    notifyCollectionRemove(collectionClone, entityArray){
        this.lemmaDialog.clearHighlight();
        for (let entity of collectionClone){
            this.lemmaDialog.highlight(entity.tag(), entity.lemma());
        }        
        
        if (!collectionClone.isEmpty()){
            let lastEntity = collectionClone.getLast();
            this.lemmaDialog.scrollTo(lastEntity.tag(), lastEntity.lemma());
        }
        this.lastCollection = collectionClone;
    }
}

module.exports = LemmaDialogController;

