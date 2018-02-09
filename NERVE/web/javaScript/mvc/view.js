/* global Utility, TaggedEntityModel, Collection, ProgressPacket */

class EntityDialogView {
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
}

class View {
    constructor() {
        Utility.log(View, "constructor");
        Utility.enforceTypes(arguments);

        this.context = null;
        this.storage = new Storage("NERVE_VIEW");

        if (this.storage.hasValue("mode") && this.storage.getValue("mode") === "tag") {
            this.tagMode(true);
        } else {
            this.tagMode(false);
        }

        this.delayThrobber = null;
        this.throbberMessageStack = [];
        this.lastFade = true;
    }
    notifyCollectionAdd(collection, taggedEntityModel) {
        Utility.log(View, "notifyCollectionAdd");
        Utility.enforceTypes(arguments, Collection, TaggedEntityModel);
        $(taggedEntityModel.getElement()).addClass("selected");
    }
    notifyCollectionClear(collection, taggedEntityModels) {
        Utility.log(View, "notifyCollectionClear");
        Utility.enforceTypes(arguments, Collection, Array);
        for (let taggedEntityModel of taggedEntityModels) {
            $(taggedEntityModel.getElement()).removeClass("selected");
        }
    }
    notifyCollectionRemove(collection, taggedEntityModel) {
        Utility.log(View, "notifyCollectionRemove");
        Utility.enforceTypes(arguments, Collection, TaggedEntityModel);
        $(taggedEntityModel.getElement()).removeClass("selected");
    }
    notifyProgress(progressPacket) {
        Utility.log(View, "notifyProgress");
        Utility.enforceTypes(arguments, ProgressPacket);

        if (progressPacket instanceof ProgressCompletePacket) this.showThrobber(false);
        else {
            this.showThrobber(true);
            this.setThrobberMessage(progressPacket.message);
        }
    }
    notifySetDocument(docElement){
        Utility.log(View, "notifySetDocument");
        Utility.enforceTypes(arguments, HTMLDivElement );
        console.log(window.x = $(docElement));
        $(docElement).find("*").removeClass("selected");
    }
    setDictionaryButton(button) {
        Utility.log(View, "setDictionaryButton");
        Utility.enforceTypes(arguments, String);

        $("#dictionary > button").hide();
        switch (button) {
            case "add":
                $("#dictAdd").show();
                break;
            case "remove":
                $("#dictRemove").show();
                break;
            case "update":
                $("#dictUpdate").show();
                break;
        }
    }
    scrollTo(element) {
        Utility.log(View, "scrollTo");
        Utility.enforceTypes(arguments, [Element]);

        $("#panelContainer").scrollTop(
                $(element).offset().top - $("#panelContainer").offset().top + $("#panelContainer").scrollTop() - ($("#panelContainer").height() / 2)
                );
    }
    focusFind() {
        Utility.log(View, "focusFind");
        Utility.enforceTypes(arguments);
        document.getElementById("epsTextArea").focus();
    }
    setFindText(string) {
        Utility.log(View, "setFindText");
        Utility.enforceTypes(arguments, String);
        document.getElementById("epsTextArea").value = string;
    }
    getSearchTerm() {
        Utility.log(View, "getSearchTerm");
        Utility.enforceTypes(arguments);
        return document.getElementById("epsTextArea").value;
    }
    clear() {
        Utility.log(View, "clear");
        Utility.enforceTypes(arguments);

        $("#entityPanel").empty();
        $("#tagnamePanel").empty();
    }
    setFilename(text) {
        Utility.log(View, "setFilename");
        Utility.enforceTypes(arguments, String);

        document.getElementById("documentTitle").innerHTML = text;
    }
    setDialogs(value) {
        Utility.log(View, "setDialogs");
        Utility.enforceTypes(arguments, EntityValues);

        $("#txtEntity").val(value.entity);
        $("#txtLemma").val(value.lemma);
        $("#txtLink").val(value.link);
        $("#selectTagName").val(value.tagName);
    }
    setSearchText(string) {
        Utility.log(View, "setSearchText");
        Utility.enforceTypes(arguments, String);

        if (typeof string === undefined || string === null) {
            string = "";
        }
        document.getElementById("epsTextArea").value = string;
    }
    notifyContextChange(context) {
        Utility.log(View, "notifyContextChange");
        Utility.enforceTypes(arguments, Context);

        /* remove old .css class */
        if (this.context !== null) {
            for (let stylename of this.context.styles()) {
                $("#entityPanel").removeClass(stylename);
            }
        }

        this.context = context;

        /* add new .css class */
        for (let stylename of this.context.styles()) {
            $("#entityPanel").addClass(stylename);
        }
    }
    /* add a link element to the head of the document as a style sheet.  Adds
     * a link id = filename so it's easily found again.
     * @param {type} filename
     * @returns {undefined}
     */
    attachStyle(filename) {
        Utility.log(View, "attachStyle", filename);
        Utility.enforceTypes(arguments, String);

        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", "styles/" + filename);
        fileref.setAttribute("id", filename);
        document.head.appendChild(fileref);

        window.requestAnimationFrame(() => {
            $(window).trigger('resize');
        });
    }
    /* Removes a stylesheet that was attached using the 'attachstyle' method.
     *
     * @param {type} filename
     * @returns {undefined}
     */
    detachStyle(filename) {
        Utility.log(View, "detachStyle", filename);
        Utility.enforceTypes(arguments, String);

        let style = document.getElementById(filename);
        if (typeof style !== "undefined" && style !== null) {
            let parent = style.parentNode;
            parent.removeChild(style);
        }
    }
    clearThrobber() {
        this.showThrobber(false);
        $("message").text("");
        $("#baubles > img").hide();
        $("#percent").hide();
        this.throbberMessageStack = [];
    }
    showPercent(amount) {
        $("#percent").show();
        $("#percent").text(amount + "%");
    }
    showBaubles(index, max) {
        $("#baubles > img").hide();
        $("#baubles > img").attr("src", "resources/light-off.png");

        for (let i = 1; i <= max; i++) {
            $(`#baubles > img[data-index="${i}"]`).show();
            if (i <= index) $(`#baubles > img[data-index="${i}"]`).attr("src", "resources/light-on.png");
        }
    }
    showThrobber(flag = true) {
        Utility.log(View, "showThrobber", flag);
        Utility.enforceTypes(arguments, ["optional", Boolean]);

        if (flag) $("#throbberBG").show();
        else $("#throbberBG").hide();
    }
    pushThrobberMessage(string) {
        Utility.log(View, "pushThrobberMessage");
        Utility.enforceTypes(arguments, String);

        this.throbberMessageStack.push(string);
        document.getElementById("message").innerText = string;
    }
    popThrobberMessage() {
        Utility.log(View, "popThrobberMessage");
        Utility.enforceTypes(arguments);

        let string = "";
        this.throbberMessageStack.pop();
        if (this.throbberMessageStack.length > 0) {
            string = this.throbberMessageStack[this.throbberMessageStack.length - 1];
        }
        document.getElementById("message").innerText = string;
    }
    setThrobberMessage(string) {
        Utility.log(View, "setThrobberMessage", string);
        Utility.enforceTypes(arguments, String);

        this.throbberMessageStack = [string];
        document.getElementById("message").innerText = string;
    }
    tagMode(enabled) {
        Utility.log(View, "tagMode");
        Utility.enforceTypes(arguments, ["optional", Boolean]);

        if (enabled === undefined) {
            if (this.storage.hasValue("mode") && this.storage.getValue("mode") === "tag") {
                this.tagMode(false);
            } else {
                this.tagMode(true);
            }
            return;
        }

        if (enabled) {
            $("#menuTags").text("Tag Mode On");
            $("#entityPanel").addClass("show-tags");
            this.storage.setValue("mode", "tag");
        } else {
            $("#menuTags").text("Tag Mode Off");
            $("#entityPanel").removeClass("show-tags");
            this.storage.deleteValue("mode");
        }
    }
}

class UserMessageHandler {
    constructor(element) {
        Utility.log(UserMessageHandler, "constructor");
        Utility.enforceTypes(arguments, [HTMLElement, jQuery]);
        this.container = null;
        this.setContainer(element);
    }
    setContainer(element) {
        Utility.log(UserMessageHandler, "setContainer");
        Utility.enforceTypes(arguments, [HTMLElement, jQuery]);
        this.container = element;
    }
    userMessage(string, duration = 3000) {
        Utility.log(UserMessageHandler, "userMessage");
        Utility.enforceTypes(arguments, String, ["optional", Number]);

        let msgElement = document.createElement("div");
        msgElement.className = "userMessageElement";
        $(this.container).append(msgElement);

        msgElement.style.display = 'block';
        msgElement.innerText = string;

        let timeDelta = 50;
        let opacity = 1;
        let opacityDelta = timeDelta / 1000;
        let time = duration;

        msgElement.style.opacity = opacity;
        msgElement.style.filter = 'alpha(opacity=' + opacity * 100 + ")";

        let showMessageTimer = setInterval(function () {
            if (time <= 1000) {
                opacity -= opacityDelta;
                msgElement.style.opacity = opacity;
                msgElement.style.filter = 'alpha(opacity=' + opacity * 100 + ")";
            }

            time -= timeDelta;
            if (time <= 0.0) {
                clearInterval(showMessageTimer);

                $(msgElement).remove();
                showMessageTimer = null;
            }
        }.bind(this), timeDelta);
    }
}