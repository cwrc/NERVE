const Widget = require("./Widget");
const DragHandler = require("./DragHandler").instance;

/**
 * A DropWidget is the target for DragWidgets.  When 
 */
class DropWidget extends Widget{

    constructor(element = null, delegate){
        super(element, delegate);
        
        this.$.on("dragover", (event) =>{
            let dragWidget = DragHandler.get();
            
            if (dragWidget && typeof dragWidget.dragover === "function"){
                dragWidget.dragover(event, dragWidget, this);
            }
            if (typeof this.dragover === "function"){
                 this.dragover(event, dragWidget, this);
            }
        });        
        
        this.$.on("drop", (event) =>{
            let dragWidget = DragHandler.get();
            
            if (dragWidget && typeof dragWidget.drop === "function"){
                dragWidget.drop(event, dragWidget, this);
            } 
            if (typeof this.drop === "function"){
                this.drop(event, dragWidget, this);
            }
            DragHandler.clear();
        });
    }
    
    dragover(event){
        event.preventDefault();
    }
}

module.exports = DropWidget;
