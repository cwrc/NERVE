const $ = window.$ ? window.$ : require("jquery");
const Widget = require("@thaerious/nidget").Widget;
const FileOperations = require("@thaerious/utility").FileOperations;

class OpenAsWidget extends Widget{
    
    constructor(delegate){
        super(null, delegate);
        
        this.dialogOptions = {
            ner : true,
            dict : true,
            accept : undefined
        };        
    }
    
    getOptions(){
        return this.dialogOptions;
    }
    
    async load(){
        let domElement = await FileOperations.loadDOMElement(`assets/openAs.frag.html`);   
        $("body").append(domElement);
        super.setElement(domElement);
        
        $(this.getElement()).find("#openAsAccept").click(()=>{
            this.onClose(true);
        });
        
        $(this.getElement()).find("#openAsCancel").click(()=>{
            this.onClose(false);
        });        
    }
    
    onClose(accept){
        this.dialogOptions = {
            ner : $("#openNER").is(":checked"),
            dict : $("#openDict").is(":checked"),
            accept : accept
        };
        
        this.resolve(this.dialogOptions);        
    }
    
    async show(){
        let callback = function (resolve, reject) {
            this.resolve = resolve;
            this.reject = reject;
        }.bind(this);
        
        this.$.modal();
        
        return new Promise(callback);
    }
}

module.exports = OpenAsWidget;