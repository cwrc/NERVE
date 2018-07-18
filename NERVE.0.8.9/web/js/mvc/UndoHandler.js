
class UndoHandler{
    constructor(){
        this.currentStateIndex = 0;
        this.maxStateIndex = 30;
        this.__resetState();
    }
    
    notifyUntaggedEntities(taggedEntityArray){
        
    }
    
    notifyNewTaggedEntities(taggedEntityArray){
        
    }
    
    /**
     * Call 'saveState()' after any change that you want to be able to recover
     * to.  This is typically any change in the model that can be seen by the
     * user.
     * @returns {undefined}
     */
    saveState() {
        this.currentStateIndex = this.currentStateIndex + 1;
        this.stateList[this.currentStateIndex] = $("#entityPanel").html();
        this.storage.setValue("document", $("#entityPanel").html());

        if (this.currentStateIndex === this.maxStateIndex) {
            this.stateList = this.stateList.slice(1, this.currentStateIndex);
        } else {
            for (let i = this.currentStateIndex + 1; i < this.maxStateIndex; i++) {
                this.stateList[i] = null;
            }
        }
    }

    async revertState() {
        if (this.currentStateIndex <= 0) return false;
        this.currentStateIndex = this.currentStateIndex - 1;
        let docHTML = this.stateList[this.currentStateIndex];
        this.__setDocument(docHTML);
    }

    async advanceState() {
        if (typeof this.stateList[this.currentStateIndex + 1] === "undefined" || this.stateList[this.currentStateIndex + 1] === null) return;
        this.currentStateIndex = this.currentStateIndex + 1;
        let docHTML = this.stateList[this.currentStateIndex];
        this.__setDocument(docHTML);
    }

    __resetState() {
        this.stateList = [];
        this.currentStateIndex = 0;
        this.stateList[0] = $("#entityPanel").html();
    }
    
    async onMenuUndo() {
        this.revertState();
    }

    async onMenuRedo() {
        this.advanceState();
    }    
}

module.exports = UndoHandler;