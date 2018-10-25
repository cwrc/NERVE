const $ = window.$ ? window.$ : require("jquery");
const Widget = require("nidget").Widget;
const FileOperations = require("@thaerious/utility").FileOperations;

class ResultWidget extends Widget{
    constructor(cwrcDialog, result, tagName){
        super(cwrcDialog);
        this.cwrcDialog = cwrcDialog;
        this.result = result;
        this.tagName = tagName;
    }
    
    getTagName(){
        return this.tagName;
    }
    
    getResult(){
        return this.result;
    }
    
    async load(){
        let domElement = await FileOperations.loadDOMElement(`assets/cwrcdialogs/result.frag.html`);        
        this.setElement(domElement);
        this.addResult(this.result);                
    }
    
    addResult(result){
        let jqElement = $(this.getElement()).find(".cwrc-result-contents");
        jqElement.append(`<div><b>${result.name}</b></div>`);
        
        if (result.description){
            $(this.getElement()).find(".cwrc-result-desc").text(result.description);
        } else {
            $(this.getElement()).find(".cwrc-result-has-desc").hide();
        }
        
        if (result.externalLink){
            jqElement.append(`<div><a href="${result.externalLink}" target="_blank">Open full description in new window</a></div>`);
        }
        
        if (result.logo) {
            jqElement.append(`<div class="logo" style="background-image: url(${result.logo})"></div>`);
        }
        
        jqElement.click((event)=>{
            this.notifyListeners("notifyResultClick", result);
        });
        
        $(this.getElement()).find(".cwrc-result-button-external").click((event)=>{
            window.open(result.uri);
        });
        
        $(this.getElement()).find(".cwrc-result-button-select").click((event)=>{
            this.cwrcDialog.hide();
            this.notifyListeners("notifySourceSelect", this);
        });        
    }
}

module.exports = ResultWidget;