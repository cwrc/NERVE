const jQuery = require("jquery");
const $ = jQuery;

class Throbber{
    constructor(){
        this.$ = $("<div class=throbber_background></div>");       
        this.image = $("<img class='throbber_image' src='assets/throbber/loader400.gif'/>");
        this.messageElement = $("<div class='throbber_message'></div>");                
        this.percentElement = $("<div class='throbber_percent'>0%</div>");                
        this.$.append(this.image);
        this.$.append(this.messageElement);
        this.$.append(this.percentElement);        
        $("body").append(this.$);        
        this.hideAll();
    }
    
    getElement(){
        return this.$.get(0);
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