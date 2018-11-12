/*
 * Listens for changes to the entity panel in order to save / undo.
 */
class EntityPanelChangeListener{
    constructor(entityPanelWidget){
        this.widget = entityPanelWidget;
        this.memory = null;
        this.last = -1;
        this.active = true;
    }
    
    notifySetDocument(){
        if (!this.active) return;
        let document = this.widget.getRawDocument();
        this.memory = [document];
        this.last = 0;
        localStorage.lastDocument = document;
    }

    notifyClearDocument(){
        if (!this.active) return;
        this.memory = null;
        this.last = -1;
        delete localStorage.lastDocument;
    }
    
    notifyUntaggedEntities(){
        this.__onChange();
    }
    
    notifyEntityUpdate(){
        this.__onChange();
    }
    
    notifyUntaggedEntities(){
        this.__onChange();
    }
        
    notifyNewTaggedEntities(){
        this.__onChange();
    }
    
    __onChange(){
        if (!this.active) return;
        let document = this.widget.getRawDocument();
        this.memory = this.memory.slice(0, this.last + 1);
        this.memory.push(document);
        this.last = this.memory.length - 1;
        localStorage.lastDocument = document;
        
        if (this.memory.length >= EntityPanelChangeListener.maxMemory){
            this.memory = this.memory.slice(1);
            this.last = this.memory.length - 1;            
        }
    }
    
    revert(){
        if (this.last <= 0) return;
        this.active = false;
        this.widget.setDocument(this.memory[--this.last]);
        localStorage.lastDocument = this.memory[this.last];
        this.active = true;
    }
    
    advance(){
        let latest = this.memory.length - 1;
        if (this.last >= latest) return;
        this.active = false;
        this.widget.setDocument(this.memory[++this.last]);
        localStorage.lastDocument = this.memory[this.last];        
        this.active = true;
    }
    
    reload(){
        if (localStorage.lastDocument === undefined) return null;
        return localStorage.lastDocument;
    }
}

EntityPanelChangeListener.maxMemory = 5;
module.exports = EntityPanelChangeListener;