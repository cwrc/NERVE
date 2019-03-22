'use strict';
const $ = window.$ ? window.$ : require("jquery");
let CustomReader = require("./CustomReader");
const Widget = require("@thaerious/nidget").Widget;
const FileOperations = require("./utility/FileOperations");

class DictionaryLoader {

    constructor(dictionary, throbber) {
        this.customReader = new CustomReader("#dictLoadDialog");
        this.widget = new DictionaryDialogWidget();
        this.dictionary = dictionary;
        this.throbber = throbber;
    }

    async load(){
        await this.widget.load();
    }

    async onMenuUploadDictionary() {
        let result = await this.customReader.show();        
        let name = result.filename.split(".")[0].replace(/[ ]+/g, "_");
        this.widget.setName(name);        
        let accept = await this.widget.show();
        if (!accept) return;
        
        this.dictionary.addTable(this.widget.getName());
        let contents = result.contents.split(/\n/g);
        
        this.throbber.setMessage("Loading Dictionary Entries");
        this.throbber.show();
        let i = 0;

        for (let entry of contents){
            i++;
            let percent = Math.round(i / contents.length * 100);
            this.throbber.setPercent(percent);
        }
        this.throbber.hide();
    }
}

class DictionaryDialogWidget extends Widget {
    constructor(delegate) {
        super(null, delegate);
        this.accept = false;
    }

    async load() {
        let domElement = await FileOperations.loadDOMElement(`assets/namedict.frag.html`);
        $("body").append(domElement);
        this.setElement(domElement);
        
        $(this.getElement()).find("[data-action='accept']").click(()=>{
            this.resolve(true);
        });
        
        $(this.getElement()).find("[data-action='cancel']").click(()=>{
            this.resolve(false);
        });        
    }
    
    getName(){
        let nameElement = $(this.getElement()).find("[data-component='name']");
        return $(nameElement).val();
    }
    
    setName(name){
        let nameElement = $(this.getElement()).find("[data-component='name']");
        return $(nameElement).val(name);
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

module.exports = DictionaryLoader;