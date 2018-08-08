const $ = require("jquery");
const AbstractModel = require("./AbstractModel");

class Widget extends AbstractModel{
    
    constructor(element = null, delegate){
        super(delegate);
        if (element !== null) this.$ = $(element);
        else this.$ = $("<div></div>");                
        this.$.data("widget", this);
    }
    
    getElement(){
        return this.$.get(0);
    }
}

module.exports = Widget;

