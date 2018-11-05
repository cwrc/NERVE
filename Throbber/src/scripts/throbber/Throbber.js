const $ = window.$ ? window.$ :require("jquery");
const Widget = require("@thaerious/nidget").Widget;

class Throbber extends Widget{
    constructor(){
        super("<div class=throbber_background></div>");
        this.image = $("<img class='throbber_image' src='assets/throbber/loader400.gif'/>");
        this.messageElement = $("<div class='throbber_message'></div>");                
        this.percentElement = $("<div class='throbber_percent'>0%</div>");                
        this.$.append(this.image);
        this.$.append(this.messageElement);
        this.$.append(this.percentElement);        
        this.hideAll();
    }
    
    setMessage(message){
        this.messageElement.text(message);
        this.messageElement.show();
    }
    
    setPercent(percent){
        this.percentElement.text(percent + "%");
        this.percentElement.show();
    }
    
    hide(){
        this.$.hide();
    }
    
    show(){
        this.$.show();
    }
    
    hidePercent(){
        this.percentElement.hide();
    }    

    hideMessage(){
        this.messageElement.hide();
    }        
    
    hideAll(){
        this.$.hide();
        this.messageElement.hide();
        this.percentElement.hide();        
    }
}

module.exports = Throbber;