/* global TaggedEntity, Utility, trace, Context, enums, Events, HTMLElement, Element, NameSource */

/**
 * TagnameManager uses a MutationObserver (https://developer.mozilla.org/en/docs/Web/API/MutationObserver) to respond
 * to any changes to a tagged entities tag value.  To force a check, typically when a document is first loaded, use the
 * method "pollDocument".  Tag name elements are div elements that are child elements of their own panel.
 *
 * Source elements (#entityPanel > .taggedentity) will are targetted.
 * Target elements of ".tagname" will be added to the element "#tagnamePanel".
 * Source elements will have the data "target" pointing to the respective target element.
 * Target elements will have the data "source" pointing to the respective source element.
 * Both source and target will have either the "linked" class, or the "unlinked" class.
 * On mutation the target elements will be moved so they are centered and below the source.
 * @type type
 */
class TagnameManager {
    constructor() {
        Utility.log(TagnameManager, "constructor");
        Utility.enforceTypes(arguments);

        this.observer = new MutationObserver((mutations) => this.onMutationEvent(mutations));
        let config = {attributes: true, subtree: true, attributeFilter: ["xmlattrs", "xmltagname", "class"]};
        let target = document.getElementById("entityPanel");
        this.observer.observe(target, config);
    }

    /**
     * Remove all tagname elements, then add a tagname element to all taggedentity elements.
     * @returns {undefined}
     */
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

    /**
     * Cause all tag name elements to be formatted.
     * @returns {undefined}
     */
    formatTagNames(){
        Utility.log(TagnameManager, "formatTagNames");
        Utility.enforceTypes(arguments);

        console.log("FORMAT TAG NAMES");

        $(".taggedentity").each((i, target)=>{
            this.formatTagnameElement(target);
        });
    }

    /** Trigger a mutation event on all "taggedentity" elements, in turn this triggers the onMutation method placing
     *  all tagname elements.
     * @returns {undefined}
     */
    pollDocument(){
        Utility.log(TagnameManager, "pollDocument");
        Utility.enforceTypes(arguments);
        $(".taggedentity").each((i, ele)=> this.onMutation(ele));
    }

    /**
     * Calls 'onMuation' for all elements in 'selection'.
     * @param {type} selection
     * @returns {undefined}
     */
    onMutationEvent(selection) {
        Utility.log(TagnameManager, "onMutationEvent");
        Utility.enforceTypes(arguments, Array);

        window.requestAnimationFrame(()=>{
            console.log("**** MUTATION EVENT ****");
            selection.forEach((mutation) => {
                this.onMutation(mutation.target);
            });
        });
    }

    /**
     * If 'target' does not have a related tagname element, create one.  Trigger the format method for the given element
     * ; by extensin the tagname element.
     * @param {type} source
     * @returns {undefined}
     */
    onMutation(source){
        Utility.log(TagnameManager, "onMutation");
        Utility.enforceTypes(arguments, [HTMLDivElement, jQuery]);

        let element = $(source).data("target");
        if (typeof element === "undefined") this.addTagnameElement(source);
        this.formatTagnameElement(source);
    }

    /**
     * A a new tag name element for the given element.
     * @param {type} source
     * @returns {undefined}
     */
    addTagnameElement(source){
        Utility.log(TagnameManager, "addTagnameElement");
        Utility.enforceTypes(arguments, [HTMLDivElement, jQuery]);

        let tagname = $(source).entityTag();
        let div = document.createElement("div");
        $(div).text(tagname);
        $(div).addClass("tagname");
        $("#tagnamePanel").append(div);
        $(div).data("source", source);
        $(source).data("target", div);
    }

    /**
     * This method updates the display elements of a tag name element.  The element is retrieved from the
     * 'target' data of 'target'.
     * @param {type} source
     * @returns {undefined}
     */
    formatTagnameElement(source){
        Utility.log(TagnameManager, "formatTagnameElement");
        Utility.enforceTypes(arguments, [HTMLDivElement, jQuery]);

        let tagname = $(source).entityTag();
        let div = $(source).data("target");
        $(div).text(tagname);

        if ($(source).link()){
            $(div).removeClass("unlinked");
            $(div).addClass("linked");
            $(source).removeClass("unlinked");
            $(source).addClass("linked");
        } else {
            $(div).removeClass("linked");
            $(div).addClass("unlinked");
            $(source).removeClass("linked");
            $(source).addClass("unlinked");
        }

        let diff = $(source).width() - $(div).width();
        let left = $(source).position().left + (diff / 2);
        let top = $(source).position().top + 12;
        $(div).css({top: top, left: left});
    }

    /**
     * Remove a tagname element that is associated with the target element.
     * @param {type} source
     * @returns {undefined}
     */
    clearTagnameElement(source){
        Utility.log(TagnameManager, "clearTagnameElement");
        Utility.enforceTypes(arguments, [HTMLDivElement, jQuery]);

        let tnEle = $(source).data("target");
        if (typeof tnEle === "undefined") return;
        $(tnEle).remove();
    }
}

class View {
    constructor() {
        View.traceLevel = 0;
        Utility.log(View, "constructor");
        Utility.enforceTypes(arguments);

        this.storage = new Storage("NERVE_VIEW");
        if (!this.storage.hasValue("mode")){
            this.storage.setValue("mode", "overlay");
            this.overlayMode();
        }
        else if (this.storage.getValue("mode") === "tag"){
            this.tagMode();
        }

        this.tagnameManager = new TagnameManager();
        this.delayThrobber = null;
        this.throbberMessageStack = [];
        this.lastFade = true;

        this.usrMsgHnd = new UserMessageHandler();
        this.usrMsgHnd.setContainer(document.getElementById("userMessage"));
    }

    setDictionary(source){
        Utility.log(View, "setDictionary");
        Utility.enforceTypes(arguments, String);
        console.warn("setDictionary deprecated");
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
        Utility.enforceTypes(arguments, [Element]);

        console.log(element);

        $("#panelContainer").scrollTop(
            $(element).offset().top - $("#panelContainer").offset().top + $("#panelContainer").scrollTop() - ($("#panelContainer").height() / 2)
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
            $("#txtEntity").attr("disabled", true);
            $("#searchDialog").attr("disabled", true);
            $("#txtLemma").attr("disabled", true);
            $("#txtLink").attr("disabled", true);

            this.clearDialogs();
            this.clearDialogBG();
            this.setDictionaryButton("none");
        }
        else{
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
    setDialogs(value) {
        Utility.log(View, "setDialogs");
        Utility.enforceTypes(arguments, EntityValues);

        $("#txtEntity").val(value.entity);
        $("#txtLemma").val(value.lemma);
        $("#txtLink").val(value.link);
        $("#selectTagName").val(value.tagName);
    }
    getDialogValues(){
        Utility.log(View, "getDialogValues");
        Utility.enforceTypes(arguments);
        return new EntityValues($("#txtEntity").val(), $("#txtLemma").val(), $("#txtLink").val(),  $("#selectTagName").val());
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

    notifyContextChange(context){
        Utility.log(View, "notifyContextChange");
        Utility.enforceTypes(arguments, Context);
        this.context = context;

        /* clear then repopulate the drop down tagName selector */
        let selector = document.getElementById("selectTagName");
        while (selector.hasChildNodes()) {
            selector.removeChild(selector.firstChild);
        }

        for (let tagInfo of this.context.tags()){
            var opt = document.createElement('option');
            opt.value = tagInfo.getName(NameSource.NAME);
            opt.innerHTML = tagInfo.getName(NameSource.NAME);
            document.getElementById("selectTagName").appendChild(opt);
        }

        /* load new .css files */
        for (let stylename of this.context.styles()) {
            this.attachStyle(stylename);
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

        window.requestAnimationFrame(()=>{
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

    showPercent(amount){
        $("#percent").show();
        $("#percent").text(amount + "%");
    }

    showBaubles(index, max){
        $("#baubles > img").hide();
        $("#baubles > img").attr("src", "resources/light-off.png");

        for (let i = 1; i <= max; i++){
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

    tagMode(){
        Utility.log(View, "tagMode");
        Utility.enforceTypes(arguments);
        this.storage.setValue("mode", "tag");
        $("#tagnamePanel").hide();
        this.attachStyle("tags.css");
    }

    overlayMode(){
        Utility.log(View, "overlayMode");
        Utility.enforceTypes(arguments);
        this.storage.setValue("mode", "overlay");
        $("#tagnamePanel").show();
        this.detachStyle("tags.css");
        setTimeout(() => this.tagnameManager.resetTagnames(), 100);
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