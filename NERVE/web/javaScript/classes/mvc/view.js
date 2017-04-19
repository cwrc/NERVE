/* global TaggedEntity, Utility, trace, Context, enums, Events, HTMLElement, Element */

class TagnameManager {
    constructor() {
        Utility.log(TagnameManager, "constructor");
        Utility.enforceTypes(arguments);

        this.observer = new MutationObserver((mutations) => this.onMutationEvent(mutations));
        let config = {attributes: true, subtree: true, attributeFilter: ["xmltagname", "class"]};
        let target = document.getElementById("entityPanel");
        this.observer.observe(target, config);
    }

    resetTagnames(){
        Utility.log(TagnameManager, "resetTagnames");
        Utility.enforceTypes(arguments);
        $("#tagnamePanel").empty();
        $(".taggedentity").each((i, target)=>{
            this.clearTagnameElement(target);
            this.addTagnameElement(target);
            this.formatTagnameElement(target);
        });
    }

    pollDocument(){
        Utility.log(TagnameManager, "pollDocument");
        Utility.enforceTypes(arguments);
        $(".taggedentity").each((i, ele)=> this.onMutation(ele));
    }

    onMutationEvent(mutations) {
        Utility.log(TagnameManager, "onMutationEvent");
        Utility.enforceTypes(arguments, Array);
        mutations.forEach((mutation)=>{
            this.onMutation(mutation.target);
        });
    }

    onMutation(target){
//        Utility.log(TagnameManager, "onMutation");
        Utility.enforceTypes(arguments, [HTMLDivElement, jQuery]);

        let tnEle = $(target).data("tagnameElement");
        if (typeof tnEle === "undefined") this.addTagnameElement(target);
        this.formatTagnameElement(target);
    }

    addTagnameElement(target){
//        Utility.log(TagnameManager, "addTagnameElement");
        Utility.enforceTypes(arguments, [HTMLDivElement, jQuery]);

        let tagname = $(target).entityTag();
        let div = document.createElement("div");
        $(div).text(tagname);
        $(div).addClass("tagname");
        $("#tagnamePanel").append(div);
        $(div).data("source", target);
        $(target).data("tagnameElement", div);
    }

    formatTagnameElement(target){
//        Utility.log(TagnameManager, "formatTagnameElement");
        Utility.enforceTypes(arguments, [HTMLDivElement, jQuery]);

        let tagname = $(target).entityTag();
        let div = $(target).data("tagnameElement");
        $(div).text(tagname);

        if ($(target).hasClass("linked")){
            $(div).addClass("linked");
        } else {
            $(div).removeClass("linked");
        }

        let diff = $(target).width() - $(div).width();
        let left = $(target).position().left + (diff / 2);
        let top = $(target).position().top + 12;
        $(div).css({top: top, left: left});
    }

    clearTagnameElement(target){
//        Utility.log(TagnameManager, "clearTagnameElement");
        Utility.enforceTypes(arguments, [HTMLDivElement, jQuery]);

        let tnEle = $(target).data("tagnameElement");
        if (typeof tnEle === "undefined") return;
        $(tnEle).remove();
    }
}

class View {
    constructor(serverIP) {
        View.traceLevel = 0;
        Utility.log(View, "constructor");
        Utility.enforceTypes(arguments, String);

        this.tagnameManager = new TagnameManager();
        this.delayThrobber = null;
        this.serverIP = serverIP;
        this.throbberMessageStack = [];
        this.lastFade = true;

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

    setDictionary(source){
        Utility.log(View, "setDictionary");
        Utility.enforceTypes(arguments, String);
        $("#sourceDictionary").text("Source: " + source);
    }

    setDictionaryButton(button){
        Utility.log(View, "setDictionaryButton");
        Utility.enforceTypes(arguments, String);

        $("#dictionary > button").hide();
        switch(button){
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

    scrollTo(element){
        Utility.log(View, "scrollTo");
//        Utility.enforceTypes(arguments, [Element]);

        $("#entityPanel").scrollTop(
            $(element).offset().top - $("#entityPanel").offset().top + $("#entityPanel").scrollTop() - ($("#entityPanel").height() / 2)
        );
    }

    clearDialogBG(){
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

    setDialogFade(value = true){
        Utility.log(View, "setDialogFade");
        Utility.enforceTypes(arguments, Boolean);

        if (value){
            $("#dialogFade").show();
            $("#entityDialog").addClass("inactiveForeground");
            this.clearDialogs();
            this.clearDialogBG();
            this.setDictionaryButton("none");
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

    clear(){
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
    setDialogs(entity) {
        Utility.log(View, "setDialogs");
        Utility.enforceTypes(arguments, HTMLDivElement);

        $("#txtEntity").val($(entity).text());
        $("#txtLemma").val($(entity).lemma());
        $("#txtLink").val($(entity).link());
        $("#selectTagName").val($(entity).entityTag());
    }
    getDialogs(){
        Utility.log(View, "getDialogs");
        Utility.enforceTypes(arguments);

        return {
            entity : $("#txtEntity").val(),
            lemma : $("#txtLemma").val(),
            link : $("#txtLink").val(),
            tagName : $("#selectTagName").val()
        };
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
            for (let stylename of this.context.styles) {
                this.detachStyle(stylename);
            }
        }

        let contextName = context.name.toLowerCase();
        $(`[data-context]`).removeClass("activeText");
        $(`[data-context='${contextName}']`).addClass("activeText");

        this.context = context;

        /* clear the drop down tagName selector */
        let selector = document.getElementById("selectTagName");
        while (selector.hasChildNodes()) {
            selector.removeChild(selector.firstChild);
        }

        /* set the available tags in the drop down selector */
        for (var i = 0; i < context.tags.length; i++) {
            var opt = document.createElement('option');
            opt.value = context.tags[i].name;
            opt.innerHTML = context.tags[i].name;
            document.getElementById("selectTagName").appendChild(opt);
        }

//        $("selectTagName").value();
//        document.getElementById("selectTagName").value = document.getElementById("selectTagName").firstChild.value;

        /* load new .css files */
        for (let stylename of context.styles) {
            this.attachStyle(stylename);
        }

//        return document.getElementById("selectTagName").firstChild.value;
    }
    /* add a link element to the head of the document as a style sheet.  Adds
     * a link id = filename so it's easily found again.
     * @param {type} filename
     * @returns {undefined}
     */
    attachStyle(filename) {
        Utility.log(View, "attachStyle");
        Utility.enforceTypes(arguments, String);
        console.log(filename);

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