const $ = window.$ ? window.$ :require("jquery");
const AbstractModel = require("./AbstractModel");

class Widget extends AbstractModel{
    
    constructor(element = null, delegate){
        super(delegate);
        if (element !== null){
            this.$ = $(element);
            this.$.data("widget", this);
        }
    }
    
    setElement(element){
        this.$ = $(element);
        this.$.data("widget", this);  
    }
    
    getElement(){
        return this.$.get(0);
    }
    
    static hasWidget(element){
        return $(element).data("widget") !== undefined;
    }
    
    static getWidget(element){
        return $(element).data("widget");
    }
}

module.exports = Widget;

