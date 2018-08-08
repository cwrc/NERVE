const AbstractModel = require("Nidget/src/AbstractModel");

class UndoHandler extends AbstractModel{
    constructor(){
        super();
        this.eventList = [];
        this.currentStateIndex = 0;
        this.maxStateIndex = 30;
    }
    
    notifyUntaggedEntities(taggedEntityArray, textNodeArray){
        this.eventList.push({
            event : "untag",
            entityArray : taggedEntityArray.slice(),
            textArray : textNodeArray.slice()
        });
    }
    
    notifyNewTaggedEntities(taggedEntityArray){
        this.eventList.push({
            event : "tag",
            entityArray : taggedEntityArray.slice()
        });         
    }
    
    notifyEntityUpdate(taggedEntityArray, oldValues){
        this.eventList.push({
            event : "update",
            entityArray : taggedEntityArray.slice(),
            valueArray : oldValues.slice()
        });        
    }
    
    /**
     * Call 'saveState()' after any change that you want to be able to recover
     * to.  This is typically any change in the model that can be seen by the
     * user.
     * @returns {undefined}
     */
    saveState() {
    }

    revertState() {
        if (this.eventList.length === 0) return;
        let event = this.eventList.pop();
        
        switch(event.event){
            case "untag":
                this.__revertUntag(event);
            break;
            case "update":
                this.__revertUpdate(event);
            break;          
            case "tag":
                this.__revertTags(event);
            break;           
        }
    }

    __revertTags(event){
        for (let taggedEntity of event.entityArray){
            taggedEntity.untag();
        }
        this.notifyListeners("notifyRevertTaggedEntities", event.entityArray);
    }

    __revertUntag(event){
        let i = 0;
        
        for (let taggedEntity of event.entityArray){
            let text = event.textArray[i++];
            $(text).replaceWith(taggedEntity.getElement());
            taggedEntity.setup();
        }
        this.notifyListeners("notifyRestoredTaggedEntities", event.entityArray);
    }

    __revertUpdate(event){
        let i = 0;
       
        for (let taggedEntity of event.entityArray){
            let values = event.valueArray[i++];
            console.log(values);
            taggedEntity.values(values, true);
        }
        this.notifyListeners("notifyRestoredValues", event.entityArray);
    }

    async advanceState() {
    }
    
    async onMenuUndo() {
        this.revertState();
    }

    async onMenuRedo() {
        this.advanceState();
    }    
}

module.exports = UndoHandler;