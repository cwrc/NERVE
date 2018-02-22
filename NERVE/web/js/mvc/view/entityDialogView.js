let TaggedEntityModel = require("../model/taggedEntityModel");

console.log(TaggedEntityModel);
window.tem = TaggedEntityModel;

module.exports = class EntityDialogView {
    constructor() {
        Utility.log(EntityDialogView, "constructor");
        Utility.enforceTypes(arguments);

        $('#txtEntity').textinput();
        $('#searchDialog').textinput();
        $('#txtLemma').textinput();
        $('#txtLink').textinput();

        this.representedEntity = null;
    }
    notifyContextChange(context) {
        Utility.log(EntityDialogView, "notifyContextChange");
        Utility.enforceTypes(arguments, Context);

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

        this.setTagName(this.context.tags().get(0).getName());
    }
    notifyEntityUpdate(taggedEntityModel) {
        Utility.log(EntityDialogView, "notifyEntityUpdate");
        Utility.enforceTypes(arguments, TaggedEntityModel);
        if (this.representedEntity === taggedEntityModel) {
            this.setDialogs(taggedEntityModel);
        }
    }
    notifyCollectionAdd(collection, taggedEntityModel) {
        Utility.log(EntityDialogView, "notifyCollectionAdd");
        Utility.enforceTypes(arguments, Collection, TaggedEntityModel);
        this.setDialogs(collection);
    }
    notifyCollectionClear(collection, taggedEntityModels) {
        Utility.log(EntityDialogView, "notifyCollectionClear");
        Utility.enforceTypes(arguments, Collection, Array);
        this.setDialogs(collection);
    }
    notifyCollectionRemove(collection, taggedEntityModel) {
        Utility.log(EntityDialogView, "notifyCollectionRemove");
        Utility.enforceTypes(arguments, Collection, TaggedEntityModel);
        this.setDialogs(collection);
    }
    setDialogs(inputData) {
        Utility.log(EntityDialogView, "setDialogs");
        Utility.enforceTypes(arguments, [Collection, TaggedEntityModel]);

        this.clearDialogs();
        this.clearDialogBG();

        let entity = null;
        let collection = null;
        if (inputData instanceof Collection) {
            collection = inputData;
            if (collection.isEmpty()) return;
            entity = collection.getLast();
        } else {
            entity = inputData;
        }

        this.representedEntity = entity;
        this.setEntity(entity.text());
        this.setLemma(entity.lemma());
        this.setLink(entity.link());
        this.setTagName(entity.tagName());

        if (collection === null) return;
        for (let entity of collection) {
            if (entity.lemma() !== entity.lemma()) this.setDialogBG("lemma");
            if (entity.link() !== entity.link()) this.setDialogBG("link");
            if (entity.text() !== entity.text()) this.setDialogBG("text");
            if (entity.tagName() !== entity.tagName()) this.setDialogBG("tag");
        }
    }
    clearDialogBG() {
        Utility.log(EntityDialogView, "clearDialogBG");
        $("#selectTagName").parent().css("color", "#000000");
        $("#txtEntity").parent().css("background-color", "#ffffff");
        $("#txtLemma").parent().css("background-color", "#ffffff");
        $("#txtLink").parent().css("background-color", "#ffffff");
    }
    setDialogBG(item) {
        Utility.log(EntityDialogView, "setDialogBG", item);

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
    setTagName(string) {
        Utility.log(EntityDialogView, "setTagName", string);
        Utility.enforceTypes(arguments, String);
        $("#selectTagName").val(string);
        $("#selectTagName").selectmenu("refresh", true);
    }
    setEntity(string) {
        Utility.log(EntityDialogView, "setEntity");
        Utility.enforceTypes(arguments, String);
        document.getElementById("txtEntity").value = string;
    }
    setLemma(string) {
        Utility.log(EntityDialogView, "setLemma");
        Utility.enforceTypes(arguments, String);
        document.getElementById("txtLemma").value = string;
    }
    setLink(string) {
        Utility.log(EntityDialogView, "setLink");
        Utility.enforceTypes(arguments, String);
        document.getElementById("txtLink").value = string;
    }
    clearDialogs() {
        Utility.log(EntityDialogView, "clearDialogs");
        Utility.enforceTypes(arguments);

        document.getElementById("txtEntity").value = "";
        document.getElementById("txtLemma").value = "";
        document.getElementById("txtLink").value = "";
    }
};