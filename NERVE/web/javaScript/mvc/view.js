/**
 * All tagged entity elements get passed to a TaggedEntity constructor to provide functionality.
 * @type type
 */
class TaggedEntity {
    constructor(controller, element) {
        Utility.log(TaggedEntity, "constructor");
        Utility.enforceTypes(arguments, Controller, HTMLDivElement);

        this.controller = controller;
        this.element = element;
        element.entity = this;

        $(element).addClass("taggedentity");

        if ($(element).contents().length === 0) {
            this.contents = document.createElement("div");
            $(this.contents).addClass("contents");
            $(element).prepend(this.contents);
        } else if ($(element).children().filter(".contents").length === 0) {
            this.contents = $(element).contents().wrap();
            this.contents.addClass("contents");
        } else {
            this.contents = $(this.element).children(".contents");
        }

        if ($(element).children().filter(".tagname-markup").length === 0) {
            this.markup = document.createElement("div");
            $(element).prepend(this.markup);
            $(this.markup).addClass("tagname-markup");
            this.tagName($(element).tagName());
        } else {
            this.markup = $(this.element).children(".tagname-markup");
        }

        $(this.element).click((event) => this.click(event));
        $(this.contents).click((event) => this.click(event));
    }
    createDOMElement() {
    }
    click(event) {
        Utility.log(TaggedEntity, "click");
        event.stopPropagation();

        if (event.altKey) {
            console.log(this.element);
            window.lastTarget = this;
            return;
        }

        if (!event.ctrlKey) {
            this.controller.unselectAll();
            event.stopPropagation();
        }

        if (!event.ctrlKey && !event.metaKey) {
            this.controller.setSelected(this);
        } else {
            this.controller.toggleSelect(this);
        }
    }
    tagName(value = undefined) {
        Utility.log(TaggedEntity, "tagName", value);
        if (value === undefined) return $(this.element).tagName();

        if (!this.controller.getContext().isTagName(value, NameSource.NAME)) {
            throw new Error(`Tagname ${name} doesn't match any known name in context ${this.controller.getContext().getName()}`);
        }

        let tagInfo = this.controller.getContext().getTagInfo(value, NameSource.NAME);

        $(this.markup).text(value);
        $(this.markup).attr("data-norm", tagInfo.getName(NameSource.DICTIONARY));
        $(this.element).tagName(value);

        return $(this.element).tagName();
    }
    lemma(value = undefined) {
        Utility.log(TaggedEntity, "lemma", value);
        if (value === undefined) return $(this.element).lemma();
        $(this.element).lemma(value);
        return $(this.element).lemma();
    }
    link(value = undefined) {
        Utility.log(TaggedEntity, "link", value);
        if (value === undefined) return $(this.element).link();
        $(this.element).link(value);
        return $(this.element).link();
    }
    text(value = undefined) {
        Utility.log(TaggedEntity, "text", value);
        if (value === undefined) return $(this.contents).text();
        $(this.contents).text(value);
        return $(this.contents).text();
    }
    collection(value = undefined) {
        Utility.log(TaggedEntity, "collection", value);
        if (value === undefined) return $(this.element).attr("data-collection");
        $(this.element).attr("data-collection", value);
        return $(this.element).attr("data-collection");
    }
    entityValues(value = undefined) {
        Utility.log(TaggedEntity, "entityValues", value);
        if (value === undefined) return new EntityValues(this.text(), this.lemma(), this.link(), this.tagName(), this.collection());
        else {
            if (value.text !== "") this.text(value.text);
            if (value.lemma !== "") this.lemma(value.lemma);
            if (value.link !== "") this.link(value.link);
            if (value.tagName !== "") this.tagName(value.tagName);
            if (value.collection !== "") this.collection(value.collection);
        }
        return new EntityValues(this.text(), this.lemma(), this.link(), this.tagName(), this.collection());
    }
    untag() {
        let children = $(this.contents).contents();
        $(this.element).replaceWith(children);
        document.normalize();
    }
    addClass(classname) {
        $(this.element).addClass(classname);
    }
    removeClass(classname) {
        $(this.element).removeClass(classname);
    }
    removeMarkup() {
        Utility.log(TaggedEntity, "removeMarkup");
        $(this.markup).detach();
        let children = $(this.contents).contents();
        $(this.contents).detach();
        $(this.element).append(children);
        delete this.element.entity;
        return this.element;
    }
}

class View {
    constructor(controller) {
        View.traceLevel = 0;
        Utility.log(View, "constructor");
        Utility.enforceTypes(arguments, Controller);

        this.controller = controller;
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

        this.usrMsgHnd = new UserMessageHandler();
        this.usrMsgHnd.setContainer(document.getElementById("userMessage"));
    }
    markupTaggedEntities() {
        Utility.log(View, "markupTaggedEntities");
        Utility.enforceTypes(arguments);

        console.log($(".taggedentity"));
        let controller = this.controller;

        $(".taggedentity").each((i, element) => {
            new TaggedEntity(controller, element);
        });
    }
    clearTaggedEntityMarkup() {
    }
    setDictionary(source) {
        Utility.log(View, "setDictionary");
        Utility.enforceTypes(arguments, String);
        console.warn("setDictionary deprecated");
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
    clearDialogBG() {
        Utility.log(View, "clearDialogBG");
        $(".entityDialogMember > input, .entityDialogMember > select").removeClass("pinkBG");
    }
    setDialogBG(item) {
        Utility.log(View, "setDialogBG");

        switch (item) {
            case "tag":
                $("#selectTagName").addClass("pinkBG");
                break;
            case "text":
                $("#txtEntity").addClass("pinkBG");
                break;
            case "lemma":
                $("#txtLemma").addClass("pinkBG");
                break;
            case "link":
                $("#txtLink").addClass("pinkBG");
                break;
        }
    }
    setDialogFade(value = true) {
        Utility.log(View, "setDialogFade");
        Utility.enforceTypes(arguments, Boolean);

        if (value) {
            $("#txtEntity").attr("disabled", true);
            $("#searchDialog").attr("disabled", true);
            $("#txtLemma").attr("disabled", true);
            $("#txtLink").attr("disabled", true);

            this.clearDialogs();
            this.clearDialogBG();
            this.setDictionaryButton("none");
        } else {
            $("#txtEntity").attr("disabled", false);
            $("#searchDialog").attr("disabled", false);
            $("#txtLemma").attr("disabled", false);
            $("#txtLink").attr("disabled", false);
    }
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
    clearDialogs() {
        Utility.log(View, "clearDialogs");
        Utility.enforceTypes(arguments);

        document.getElementById("txtEntity").value = "";
        document.getElementById("txtLemma").value = "";
        document.getElementById("txtLink").value = "";
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
    getDialogValues() {
        Utility.log(View, "getDialogValues");
        Utility.enforceTypes(arguments);
        return new EntityValues($("#txtEntity").val(), $("#txtLemma").val(), $("#txtLink").val(), $("#selectTagName").val());
    }
    setTagName(string) {
        Utility.log(View, "setTagName");
        Utility.enforceTypes(arguments, String);
        document.getElementById("selectTagName").value = string;
    }
    setEntity(string) {
        Utility.log(View, "setEntity");
        Utility.enforceTypes(arguments, String);
        document.getElementById("txtEntity").value = string;
    }
    setLemma(string) {
        Utility.log(View, "setLemma");
        Utility.enforceTypes(arguments, String);
        document.getElementById("txtLemma").value = string;
    }
    setLink(string) {
        Utility.log(View, "setLink");
        Utility.enforceTypes(arguments, String);
        document.getElementById("txtLink").value = string;
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
            opt.value = tagInfo.getName(NameSource.NAME);
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

        if (enabled === undefined){
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