const AbstractModel = require("./model/AbstractModel");
const EntityValues = require("../gen/nerve").EntityValues;
const Collection = require("./model/Collection");

class EntityTextBox {
    constructor(delegate, selector, dialogStringID) {
        this.delegate = delegate;
        this.update = false;
        
        $(selector).on("input", () => {
            this.update = true;
        });       
        
        $(selector).on("blur", () => {
            if (this.update) {
                let changes = {};
                changes[dialogStringID] = $(selector).val();
                this.delegate.notifyListeners("notifyDialogChange", changes);
            }
            this.update = false;
        });          
        
        $(selector).keyup((event) => {
            if (event.keyCode !== 13) return;
            let changes = {};
            changes[dialogStringID] = $(selector).val();            
            this.delegate.notifyListeners("notifyDialogChange", changes);
            this.update = false;
            event.stopPropagation();
        });        
    }
}

class EntityListSelector{
    constructor(delegate, selector, dialogStringID) {
        this.delegate = delegate;
        this.dialogStringID = dialogStringID;
        this.selector = selector;
        this.update = false;
        
        $(selector).on("input", (event) => {
            let changes = {};
            changes[dialogStringID] = $(selector).val();            
            this.delegate.notifyListeners("notifyDialogChange", changes);
        });        
    }
    
    setValue(value){
        this.value = value;
    }
    
    ready(){
        let changes = {};
        changes[this.dialogStringID] = $(this.selector).val();            
        this.delegate.notifyListeners("notifyDialogChange", changes);        
    }
}

class EntityDialog extends AbstractModel {
    constructor() {
        super();

        new EntityTextBox(this, "#txtEntity", "text");
        new EntityTextBox(this, "#txtLemma", "lemma");
        new EntityTextBox(this, "#txtLink", "link");
        this.entitySelctorList = new EntityListSelector(this, "#selectTagName", "tagName");

        $('#txtEntity').textinput();
        $('#searchDialog').textinput();
        $('#txtLemma').textinput();
        $('#txtLink').textinput();
        
        $("#goLink").click((event) => {
            this.goLink();
        });        
        
        $("#entityLookupButton").click((event)=>this.notifyListeners("notifyLoookupEntity", this.getValues()));
        $("#lemmaLookupButton").click((event)=>this.notifyListeners("notifyLoookupLemma", this.getValues()));
        
        this.copyValues = new EntityValues();
        this.selected = new Collection();
    }
    
    async onMenuCopy() {
        this.getValues().copyTo(this.copyValues);
    }

    async onMenuPaste() {
        let changes = {};
        if (this.copyValues.lemma()!== null) changes["lemma"] = this.copyValues.lemma();
        if (this.copyValues.tag() !== null) changes["Tag"] = this.copyValues.tag();
        if (this.copyValues.link() !== null) changes["link"] = this.copyValues.link();
        
        this.__setLemma(this.copyValues.lemma());
        this.__setLink(this.copyValues.link());
        this.__setTagName(this.copyValues.tag());        
                
        this.notifyListeners("notifyDialogChange", changes);
        this.__setDialogs();
    }
    
    notifyReady(){
        this.entitySelctorList.ready();
    }
    
    goLink() {
        let url = $("#txtLink").val();
        if (url.length === 0) return;
        if (!url.startsWith("http") && !url.startsWith("https")) {
            url = "http://" + $("#txtLink").val();
        }
        var win = window.open(url, '_blank');
        win.focus();
    }    
    
    getValues() {
        return new EntityValues($("#txtEntity").val(), $("#txtLemma").val(), $("#txtLink").val(), $("#selectTagName").val());
    }
    notifyContextChange(context) {
        this.context = context;

        /* clear then repopulate the drop down tagName selector */
        let selector = document.getElementById("selectTagName");
        while (selector.hasChildNodes()) {
            selector.removeChild(selector.firstChild);
        }

        for (let tagInfo of this.context.tags()) {
            var opt = document.createElement('option');
            $(opt).val(tagInfo.getStandard());
            opt.innerHTML = tagInfo.getName();
            selector.appendChild(opt);
        }

        this.__setTagName(this.context.tags().get(0).getStandard());
    }

    notifyCollectionAdd(collection, taggedEntityWidgets) {
        this.selected = collection;
        this.__setDialogs();        
    }
    notifyCollectionClear(collection, taggedEntityWidgets) {
        this.selected = collection;
        this.__setDialogs();
    }
    notifyCollectionRemove(collection, taggedEntityWidgets) {
        this.selected = collection;
        this.__setDialogs();
    }

    notifyCWRCSelection(values){
        this.__setEntity(values.text());
        this.__setLemma(values.lemma());
        this.__setLink(values.link());
        this.__setTagName(values.tag());
    }  

    __clearDialogs() {
        document.getElementById("txtEntity").value = "";
        document.getElementById("txtLemma").value = "";
        document.getElementById("txtLink").value = "";
    }

    __setDialogs() {
        console.log("__setDialogs()");
        this.__clearDialogs();
        this.__clearDialogBG();

        if (this.selected.size() <= 0) return;
        let entity = this.selected.getLast();

        this.__setEntity(entity.text());
        this.__setLemma(entity.lemma());
        this.__setLink(entity.link());
        this.__setTagName(entity.tag());

        let values = this.getValues();

        for (let entity of this.selected) {
            console.log(entity);
            if (entity.lemma() !== values.lemma()) this.__setDialogBG("lemma");
            if (entity.link() !== values.link()) this.__setDialogBG("link");
            if (entity.text() !== values.text()) this.__setDialogBG("text");
            if (entity.tag() !== values.tag()) this.__setDialogBG("tag");
        }
    }
    
    __clearDialogBG() {
        $("#selectTagName").parent().css("color", "#000000");
        $("#txtEntity").parent().css("background-color", "#ffffff");
        $("#txtLemma").parent().css("background-color", "#ffffff");
        $("#txtLink").parent().css("background-color", "#ffffff");
    }
    
    __setDialogBG(item) {
        switch (item) {
            case "tag":
                $("#selectTagName").parent().css("color", "#ff0000");
                break;
            case "text":
                $("#txtEntity").parent().css("background-color", "#ffcccc");
                break;
            case "lemma":
                $("#txtLemma").parent().css("background-color", "#ffcccc");
                break;
            case "link":
                $("#txtLink").parent().css("background-color", "#ffcccc");
                break;
        }
    }

    __setTagName(string) {
        $("#selectTagName").val(string);
        $("#selectTagName").selectmenu("refresh", true);
    }
    __setEntity(string) {
        document.getElementById("txtEntity").value = string;
    }
    __setLemma(string) {
        document.getElementById("txtLemma").value = string;
    }
    __setLink(string) {
        document.getElementById("txtLink").value = string;
    }
}

module.exports = EntityDialog;