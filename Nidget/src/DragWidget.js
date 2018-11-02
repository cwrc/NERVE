const Widget = require("./Widget");
const dragHandler = require("./DragHandler").instance;

/**
 * A DragWidget is able to be dragged onto a DropWidget.  When the drag widget
 * drag begins, the dragstart method, if avaialable, is called.
 */
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
