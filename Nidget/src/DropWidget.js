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
                dragWidget.dragover(event, this);
            }
            if (typeof this.dragover === "function"){
                 this.dragover(event, dragWidget);
            }
        });        
        
        this.$.on("drop", (event) =>{
            let dragWidget = DragHandler.get();
            
            if (dragWidget && typeof dragWidget.drop === "function"){
                dragWidget.drop(event, this);
            } 
            if (typeof this.drop === "function"){
                this.drop(event, dragWidget);
            }
            DragHandler.clear();
        });
    }
    
    dragover(event){
        event.preventDefault();
    }
}

module.exports = DropWidget;
