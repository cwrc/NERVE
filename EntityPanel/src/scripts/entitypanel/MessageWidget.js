const $ = window.$ ? window.$ : require("jquery");
const Widget = require("@thaerious/nidget").Widget;
const FileOperations = require("@thaerious/utility").FileOperations;

class MessageWidget extends Widget{
    
    constructor(delegate){
        super(null, delegate);
        this.timeout = null;
    }
    
    async load(){
        let domElement = await FileOperations.loadDOMElement(`assets/entitypanel/messageWidget.frag.html`);   
        $("body").append(domElement);
        this.setElement(domElement);
    }    
    
    show(){
        $(this.getElement()).removeClass("fade");
        $(this.getElement()).show();
    }
    
    hide(){
        $(this.getElement()).hide();
    }    
    
    notifyWarning(warning){
        if (this.timeout !== null){
            clearTimeout(this.timeout);
        }   
        
        $(this.getElement()).removeClass("alert-success");
        $(this.getElement()).addClass("alert-warning");
        $(this.getElement()).removeClass("fade");
        $(this.getElement()).find(`[data-widget-id="header"]`).text("Warning");
        $(this.getElement()).find(`[data-widget-id="message"]`).text(warning);
        $(this.getElement()).show();
        
        this.timeout = setTimeout(()=>{
            $(this.getElement()).addClass("fade");
            this.timeout = null;
        }, 1500);
    }        
    
    notifyMessage(header, message){
        if (this.timeout !== null){
            clearTimeout(this.timeout);
        }   
        
        $(this.getElement()).removeClass("alert-warning");
        $(this.getElement()).addClass("alert-success");
        $(this.getElement()).removeClass("fade");
        $(this.getElement()).find(`[data-widget-id="header"]`).text(header);
        $(this.getElement()).find(`[data-widget-id="message"]`).text(message);
        $(this.getElement()).show();
        
        this.timeout = setTimeout(()=>{
            $(this.getElement()).addClass("fade");
            this.timeout = null;
        }, 1500);
    }
};

module.exports = MessageWidget;