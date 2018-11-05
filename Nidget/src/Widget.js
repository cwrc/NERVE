const $ = window.$ ? window.$ :require("jquery");
const AbstractModel = require("./AbstractModel");

class Widget extends AbstractModel{
    
    constructor(element = null, delegate = null){
        super(delegate);
        if (element !== null){
            this.setElement(element);
        }
    }
    
    setElement(element){
        this.$ = $(element);
        this.$.data("widget", this);  
    }
    
    getElement(){
        return this.$.get(0);
    }
    
    append(child){
        if (child instanceof Widget){
            let childElement = child.getElement();
            $(this.getElement()).append(childElement);
        } else {
            $(this.getElement()).append(child);
        }
    }
    
    static hasWidget(element){
        return $(element).data("widget") !== undefined;
    }
    
    static getWidget(element){
        return $(element).data("widget");
    }
}

module.exports = Widget;

