/* global TaggedEntity, Utility, trace, Context, enums, Events, HTMLElement, Element */

class View {
    constructor(serverIP) {
        View.traceLevel = 0;
        Utility.log(View, "constructor");
        Utility.enforceTypes(arguments, String);

        this.delayThrobber = null;
        this.serverIP = serverIP;
        this.throbberMessageStack = [];

        this.usrMsgHnd = new UserMessageHandler();
        this.usrMsgHnd.setContainer(document.getElementById("userMessage"));
        this.context = null;

        /* make msg panel resize on mouse over */
        var panel = document.getElementById("messagePanel");
        panel.addEventListener("mouseover", (event) => {
            panel.className = "messagePanelBig";
        }, false);

        panel.addEventListener("mouseout", (event) => {
            panel.className = "messagePanelSmall";
        }, false);
    }

    scrollTo(element){
        Utility.log(View, "scrollTo");
        Utility.enforceTypes(arguments, [Element, TaggedEntity]);

        if (element instanceof TaggedEntity) element = element.element;

        $("#entityPanel").scrollTop(
            $(element).offset().top - $("#entityPanel").offset().top + $("#entityPanel").scrollTop() - ($("#entityPanel").height() / 2)
        );
    }

    setDialogFade(value = true){
        Utility.log(View, "setDialogFade");
        Utility.enforceTypes(arguments, Boolean);

        if (value){
            $("#dialogFade").show();
            $("#entityDialog").addClass("inactiveForeground");
        }
        else{
            $("#dialogFade").hide();
            $("#entityDialog").removeClass("inactiveForeground");
        }
    }


    appendMessage(string) {
        Utility.log(View, "appendMessage");
        Utility.enforceTypes(arguments, String);

        var panel = document.getElementById("messagePanel");
        var inner = panel.innerHTML;
        panel.innerHTML = inner + "<br>" + string;
        panel.scrollTop = panel.scrollHeight;
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
    setDocument(text) {
        Utility.log(View, "setDocument");
        Utility.enforceTypes(arguments, String);

        document.getElementById("entityPanel").innerHTML = text;
    }
    /* TODO prevent return of view state */
    getDOMObject() {
        Utility.log(View, "getDOMObject");
        Utility.enforceTypes(arguments);
        return document.getElementById("entityPanel");
    }
    setFilename(text) {
        Utility.log(View, "setFilename");
        Utility.enforceTypes(arguments, String);

        document.getElementById("documentTitle").innerHTML = text;
    }
    setDialogs(taggedEntity) {
        Utility.log(View, "setDialogs");
        Utility.enforceTypes(arguments, TaggedEntity);

        document.getElementById("txtEntity").value = taggedEntity.getEntity();
        document.getElementById("txtLemma").value = taggedEntity.getLemma();
        document.getElementById("txtLink").value = taggedEntity.getLink();
        document.getElementById("selectTagName").value = taggedEntity.getTagName();
        if (taggedEntity.hasDictionary()) this.setDictionary(taggedEntity.getDictionary());
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
        Utility.verifyArguments(arguments, String);

        if (typeof string === undefined || string === null) {
            string = "";
        }
        document.getElementById("epsTextArea").value = string;
    }
    setContext(context) {
        Utility.log(View, "setContext");
        Utility.verifyArguments(arguments, Context);

        /* remove all styles of current context */
        if (this.context !== null) {
            for (let stylename of this.context.styles()) {
                this.detachStyle(stylename);
            }
        }

        this.context = context;

        /* clear the drop down tagName selector */
        let selector = document.getElementById("selectTagName");
        while (selector.hasChildNodes()) {
            selector.removeChild(selector.firstChild);
        }

        /* set the available tags in the drop down selector */
        let tags = context.tags();
        for (var i = 0; i < tags.length; i++) {
            var opt = document.createElement('option');
            opt.value = tags[i].name;
            opt.innerHTML = tags[i].name;
            document.getElementById("selectTagName").appendChild(opt);
        }
        document.getElementById("selectTagName").value = document.getElementById("selectTagName").firstChild.value;

        /* load new .css files */
        if (context.styles()) {
            for (let stylename of context.styles()) {
                this.attachStyle(stylename);
            }
        }

        this.__setDictionaries(context.readFromDictionary());

        return document.getElementById("selectTagName").firstChild.value;
    }
    /* add a link element to the head of the document as a style sheet.  Adds
     * a link id = filename so it's easily found again.
     * @param {type} filename
     * @returns {undefined}
     */
    attachStyle(filename) {
        Utility.log(View, "attachStyle");
        Utility.enforceTypes(arguments, String);

        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", "styles/" + filename);
        fileref.setAttribute("id", filename);
        document.head.appendChild(fileref);
    }
    /* Removes a stylesheet that was attached using the 'attachstyle' method.
     *
     * @param {type} filename
     * @returns {undefined}
     */
    detachStyle(filename) {
        Utility.log(View, "detachStyle");
        Utility.enforceTypes(arguments, String);

        let style = document.getElementById(filename);
        if (typeof style !== "undefined" && style !== null) {
            let parent = style.parentNode;
            parent.removeChild(style);
        }
    }

    __setDictionaries(dictStringArray) {
        Utility.log(View, "__setDictionaries");
        Utility.enforceTypes(arguments, Array);

        let selectElement = document.getElementById("selectDictionary");
        while (selectElement.firstChild) {
            selectElement.removeChild(selectElement.firstChild);
        }

        for (var dictString of dictStringArray) {
            let selectItemElement = document.createElement("option");
            selectItemElement.innerHTML = dictString;
            selectItemElement.value = dictString;
            selectElement.appendChild(selectItemElement);
        }
    }
    setDictionary(value) {
        Utility.log(View, "setDictionary");
        Utility.enforceTypes(arguments, String);

        document.getElementById("selectDictionary").value = value;
    }
    enableDictionaryUpdate(value) {
        Utility.log(View, "enableDictionaryUpdate");
        Utility.enforceTypes(arguments, Boolean);

        let ele = document.getElementById("cbDictionary");
        if (ele.checked !== value) {
            ele.checked = value;
        }
    }
    setDictionaryMessage(message) {
        Utility.log(View, "setDictionaryMessage");
        Utility.enforceTypes(arguments, String);

        document.getElementById("dictMsg").innerHTML = message;
    }
    clearThrobber() {
        this.showThrobber(false);
        $("message").text("");
        this.throbberMessageStack = [];
    }
    showThrobber(flag) {
        Utility.log(View, "showThrobber");
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
        Utility.log(View, "setThrobberMessage");
        Utility.enforceTypes(arguments, String);

        this.throbberMessageStack = [];
        this.pushThrobberMessage(string);
    }
    showUserMessage(string, duration = 3000) {
        this.appendMessage(string);
        this.usrMsgHnd.showUserMessage(string, duration);
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
        Utility.assert(this.container, HTMLElement);

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