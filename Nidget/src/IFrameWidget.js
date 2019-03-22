const $ = require("jquery");
const AbstractModel = require("./AbstractModel");

class IFrameWidget extends AbstractModel{
    
    constructor(path, delegate){
        super(delegate);
        this.iFrame = $(`<iframe id='test' src='${path}'></iframe>`)[0];
        this.doc = this.iFrame.contentDocument;

        this.iFrame.onload = function() {
            this.document = this.iFrame.contentDocument;
            this.$ = $(this.document);
        }.bind(this);
    }
    
    appendTo(target){
        $(target).append(this.iFrame);
    }
    
    getFrame(){
        return this.iFrame;
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

module.exports = IFrameWidget;

