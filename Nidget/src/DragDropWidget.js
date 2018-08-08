const Widget = require("./Widget");
const dragHandler = require("./DragHandler").instance;

class DragDropWidget extends Widget{

    constructor(element = null, delegate){
        super(element, delegate);
        this.$.attr("draggable", "true");
        
        this.$.on("dragstart", (event) =>{
            dragHandler.set(this);
            if (this.dragstart) this.dragstart(event);
        });
        
        this.$.on("dragover", (event) =>{
            if (this.dragover) this.dragover(event);
        });
        
        this.$.on("drop", (event) =>{
            if (this.drop) this.drop(event, dragHandler.get());
            dragHandler.clear();
        });
    }
    
    dragover(event){
        event.preventDefault();
    }
}

module.exports = DragDropWidget;
