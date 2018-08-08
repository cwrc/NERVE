const Widget = require("./Widget");
const dragHandler = require("./DragHandler").instance;

class DropWidget extends Widget{

    constructor(element = null, delegate){
        super(element, delegate);
        
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

module.exports = DropWidget;
