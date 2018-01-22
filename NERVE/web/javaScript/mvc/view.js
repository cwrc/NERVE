
/* global Utility, TaggedEntityModel, Collection */

class EntityDialogView {
    constructor(){
        Utility.log(EntityDialogView, "constructor");
        Utility.enforceTypes(arguments);

        $('#txtEntity').textinput();
        $('#searchDialog').textinput();
        $('#txtLemma').textinput();
        $('#txtLemma').textinput();
    }

    notifyCollectionAdd(collection, taggedEntityModel) {
        Utility.log(EntityDialogView, "notifyCollectionAdd");
        Utility.enforceTypes(arguments, Collection, TaggedEntityModel);
        this.pollDialogs(collection);
        this.setDialogFade();

        this.setEntity(taggedEntityModel.text());
        this.setLemma(taggedEntityModel.lemma());
        this.setLink(taggedEntityModel.link());
        this.setTagName(taggedEntityModel.tagName());
    }
    notifyCollectionClear(collection, taggedEntityModels) {
        Utility.log(EntityDialogView, "notifyCollectionClear");
        Utility.enforceTypes(arguments, Collection, Array);
        this.pollDialogs(collection);
        this.setDialogFade();
    }
    notifyCollectionRemove(collection, taggedEntityModel) {
        Utility.log(EntityDialogView, "notifyCollectionRemove");
        Utility.enforceTypes(arguments, Collection, TaggedEntityModel);
        this.pollDialogs(collection);
        this.setDialogFade();
    }
    pollDialogs(collection) {
        Utility.log(EntityDialogView, "pollDialogs");
        Utility.enforceTypes(arguments, Collection);

        let first = collection.getFirst();
        this.clearDialogBG();

        for (let entity of collection) {
            if (entity.lemma() !== first.lemma()) this.setDialogBG("lemma");
            if (entity.link() !== first.link()) this.setDialogBG("link");
            if (entity.text() !== first.text()) this.setDialogBG("text");
            if (entity.tagName() !== first.tagName()) this.setDialogBG("tag");
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
                console.log("HERE");
                $("#txtLemma").parent().css("background-color", "#ffcccc");
                break;
            case "link":
                $("#txtLink").parent().css("background-color", "#ffcccc");
                break;
        }
    }
    setDialogFade(value = true) {
        Utility.log(EntityDialogView, "setDialogFade");
        Utility.enforceTypes(arguments);

        if (value) {
            $('#txtEntity').textinput('enable');
            $('#searchDialog').textinput('enable');
            $('#txtLemma').textinput('enable');
            $('#txtLemma').textinput('enable');

            this.clearDialogs();
//            this.setDictionaryButton("none");
        } else {
            this.clearDialogBG();
            $('#txtEntity').textinput('disable');
            $('#searchDialog').textinput('disable');
            $('#txtLemma').textinput('disable');
            $('#txtLemma').textinput('disable');
        }

        $( "#txtEntity" ).textinput( "refresh" );
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
    constructor(model) {
        Utility.log(View, "constructor");
        Utility.enforceTypes(arguments, Model);

        this.context = null;
        model.addListener(this);

        this.storage = new Storage("NERVE_VIEW");
        if (this.storage.hasValue("mode") && this.storage.getValue("mode") === "tag") {
            this.tagMode(true);
        } else {
            this.tagMode(false);
        }

        this.delayThrobber = null;
        this.throbberMessageStack = [];
        this.lastFade = true;

        this.usrMsgHnd = new UserMessageHandler();
        this.usrMsgHnd.setContainer(document.getElementById("userMessage"));
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
    setDocument(text) {
        Utility.log(View, "setDocument");
        Utility.enforceTypes(arguments, String);
        document.getElementById("entityPanel").innerHTML = text;
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
        if (this.context != null) {
            for (let stylename of this.context.styles()) {
                $("#entityPanel").removeClass(stylename);
            }
        }

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
            document.getElementById("selectTagName").appendChild(opt);
        }

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
    showThrobber(flag) {
        Utility.log(View, "showThrobber", flag);
        Utility.enforceTypes(arguments, Boolean);

        if (flag === true && this.delayThrobber === null) {
            this.delayThrobber = setTimeout(() => {
                this.delayThrobber = null;
                $("#throbberBG").show();
            }, 300);
        } else {
            if (this.delayThrobber !== null) {
                clearTimeout(this.delayThrobber);
                this.delayThrobber = null;
            }
            $("#throbberBG").hide();
        }
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
    showUserMessage(string, duration = 3000) {
        this.usrMsgHnd.showUserMessage(string, duration);
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
    constructor() {
        Utility.log(UserMessageHandler, "constructor");
        Utility.enforceTypes(arguments);
        this.container = null;
    }
    setContainer(element) {
        Utility.log(UserMessageHandler, "setContainer");
        Utility.enforceTypes(arguments, HTMLElement);
        this.container = element;
    }
    showUserMessage(string, duration = 3000) {
        Utility.log(UserMessageHandler, "showUserMessage");
        Utility.enforceTypes(arguments, String, ["optional", Number]);

        this.container = document.getElementById("userMessage");
        let msgElement = document.createElement("div");
        msgElement.className = "userMessageElement";
        this.container.appendChild(msgElement);

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
                this.container.removeChild(msgElement);
                showMessageTimer = null;
            }
        }.bind(this), timeDelta);
    }
}