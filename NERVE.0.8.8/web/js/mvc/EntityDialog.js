const AbstractModel = require("./model/AbstractModel");
const EntityValues = require("../gen/nerve").EntityValues;
const NameSource = require("nerscriber").NameSource;

class EntityTextBox {
    constructor(delegate, selector, dialogStringID) {
        this.delegate = delegate;
        this.update = false;
        
        $(selector).on("input", () => {
            this.update = true;
        });       
        
        $(selector).on("blur", () => {
            if (this.update) {
                this.delegate.notifyListeners("notifyDialogChange", dialogStringID, $(selector).val());
            }
            this.update = false;
        });          
        
        $(selector).keyup((event) => {
            if (event.keyCode !== 13) return;
            this.delegate.notifyListeners("notifyDialogChange", dialogStringID, $(selector).val());
            this.update = false;
            event.stopPropagation();
        });        
    }
}

class EntityListSelector{
    constructor(delegate, selector, dialogStringID) {
        this.delegate = delegate;
        this.update = false;
        
        $(selector).on("input", (event) => {
            this.delegate.notifyListeners("notifyDialogChange", dialogStringID, $(selector).val());
        });        
    }
    
    setValue(value){
        this.value = value;
    }
}

class EntityDialog extends AbstractModel {
    constructor() {
        super();

        new EntityTextBox(this, "#txtEntity", "entityText");
        new EntityTextBox(this, "#txtLemma", "lemma");
        new EntityTextBox(this, "#txtLink", "link");
        new EntityListSelector(this, "#selectTagName", "tagName");

        $('#txtEntity').textinput();
        $('#searchDialog').textinput();
        $('#txtLemma').textinput();
        $('#txtLink').textinput();
        
        $("#goLink").click((event) => {
            this.goLink();
        });        
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
            $(opt).val(tagInfo.getName(NameSource.NAME));
            opt.innerHTML = tagInfo.getName(NameSource.NAME);
            selector.appendChild(opt);
        }

        this.__setTagName(this.context.tags().get(0).getName());
    }

    notifyCollectionAdd(collection, TaggedEntityWidget) {
        this.__setDialogs(collection);
    }
    notifyCollectionClear(collection, TaggedEntityWidgets) {
        this.__clearDialogs();
    }
    notifyCollectionRemove(collection, TaggedEntityWidget) {
        if (collection.isEmpty()) this.__clearDialogs();
        this.__setDialogs(collection);
    }

    __setDialogs(collection) {
        this.__clearDialogs();
        this.__clearDialogBG();

        let entity = collection.getLast();

        this.__setEntity(entity.text());
        this.__setLemma(entity.lemma());
        this.__setLink(entity.link());
        this.__setTagName(entity.tag());

        let values = this.getValues();

        for (let entity of collection) {
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

    __clearDialogs() {
        document.getElementById("txtEntity").value = "";
        document.getElementById("txtLemma").value = "";
        document.getElementById("txtLink").value = "";
    }
}

module.exports = EntityDialog;