const Widget = require("./Widget");
const dragHandler = require("./DragHandler").instance;

class DragWidget extends Widget{

    constructor(element = null, delegate){
        super(element, delegate);
        this.$.attr("draggable", "true");
        
        this.$.on("dragstart", (event) =>{
            dragHandler.set(this);
            if (this.dragstart) this.dragstart(event);
        });
    }
}

module.exports = DragWidget;
