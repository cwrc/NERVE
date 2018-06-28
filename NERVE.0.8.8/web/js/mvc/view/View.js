/* global Utility, TaggedEntityWidget, Collection, ProgressPacket */

const ProgressStage = require("nerscriber").ProgressStage;

module.exports = class View {
    constructor() {
        Utility.log(View, "constructor");

        this.context = null;
        this.onMenuTags(false);

        this.delayThrobber = null;
        this.throbberMessageStack = [];
        this.lastFade = true;
        this.tagMode = false;
    }

    notifySetFilename(filename){
        $("#documentTitle").text(filename);
    }

    notifyDocumentClosed(filename){
        $("#documentTitle").text("");
    }

    notifyCollectionAdd(collection, TaggedEntityWidget) {
        Utility.log(View, "notifyCollectionAdd", TaggedEntityWidget.text());
        // // Utility.enforceTypes(arguments, Collection, TaggedEntityWidget);
        $(TaggedEntityWidget.getElement()).addClass("selected");
    }
    notifyCollectionClear(collection, TaggedEntityWidgets) {
        Utility.log(View, "notifyCollectionClear");
        // // Utility.enforceTypes(arguments, Collection, Array);
        for (let TaggedEntityWidget of TaggedEntityWidgets) {
            $(TaggedEntityWidget.getElement()).removeClass("selected");
        }
    }
    notifyCollectionRemove(collection, TaggedEntityWidget) {
        Utility.log(View, "notifyCollectionRemove");
        // // Utility.enforceTypes(arguments, Collection, TaggedEntityWidget);
        $(TaggedEntityWidget.getElement()).removeClass("selected");
    }
    notifyProgress(progressPacket) {
        Utility.log(View, "notifyProgress");
        // // Utility.enforceTypes(arguments, ProgressPacket);

        if (progressPacket.progressStage === ProgressStage.START){
            this.showThrobber(true);
        } else if (progressPacket.progressStage === ProgressStage.CONTINUE){
            this.setThrobberMessage(progressPacket.message);
        } else if (progressPacket.progressStage === ProgressStage.COMPLETE){
            this.showThrobber(false);
        }
    }
    notifySetDocument(docElement){
        Utility.log(View, "notifySetDocument");
        // // Utility.enforceTypes(arguments, HTMLDivElement );
        $(docElement).find("*").removeClass("selected");
    }
    setDictionaryButton(button) {
        Utility.log(View, "setDictionaryButton");
        // // Utility.enforceTypes(arguments, String);

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
        // // Utility.enforceTypes(arguments, [Element]);

        $("#panelContainer").scrollTop(
                $(element).offset().top - $("#panelContainer").offset().top + $("#panelContainer").scrollTop() - ($("#panelContainer").height() / 2)
                );
    }
    focusFind() {
        Utility.log(View, "focusFind");
        // // Utility.enforceTypes(arguments);
        document.getElementById("epsTextArea").focus();
    }
    setFindText(string) {
        Utility.log(View, "setFindText");
        // // Utility.enforceTypes(arguments, String);
        document.getElementById("epsTextArea").value = string;
    }
    getSearchTerm() {
        Utility.log(View, "getSearchTerm");
        // // Utility.enforceTypes(arguments);
        return document.getElementById("epsTextArea").value;
    }
    clear() {
        Utility.log(View, "clear");
        // // Utility.enforceTypes(arguments);

        $("#entityPanel").empty();
        $("#tagnamePanel").empty();
    }
    setFilename(text) {
        Utility.log(View, "setFilename");
        // // Utility.enforceTypes(arguments, String);

        document.getElementById("documentTitle").innerHTML = text;
    }
    setDialogs(value) {
        Utility.log(View, "setDialogs");
        // // Utility.enforceTypes(arguments, EntityValues);

        $("#txtEntity").val(value.text());
        $("#txtLemma").val(value.lemma());
        $("#txtLink").val(value.link());
        $("#selectTagName").val(value.tag());
    }
    setSearchText(string) {
        Utility.log(View, "setSearchText");
        // // Utility.enforceTypes(arguments, String);

        if (typeof string === undefined || string === null) {
            string = "";
        }
        document.getElementById("epsTextArea").value = string;
    }
    notifyContextChange(context) {
        Utility.log(View, "notifyContextChange");
        // // Utility.enforceTypes(arguments, Context);

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
        // // Utility.enforceTypes(arguments, String);

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
        // // Utility.enforceTypes(arguments, String);

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
    showThrobber(flag = true, opacity = 0.7) {
        Utility.log(View, "showThrobber", flag);
        // // Utility.enforceTypes(arguments, ["optional", Boolean], ["optional", Number]);

        $("#throbberBG").css("opacity", opacity);

        if (flag) $("#throbberBG").show();
        else $("#throbberBG").hide();
    }
    pushThrobberMessage(string) {
        Utility.log(View, "pushThrobberMessage");
        // // Utility.enforceTypes(arguments, String);

        this.throbberMessageStack.push(string);
        document.getElementById("message").innerText = string;
    }
    popThrobberMessage() {
        Utility.log(View, "popThrobberMessage");
        // // Utility.enforceTypes(arguments);

        let string = "";
        this.throbberMessageStack.pop();
        if (this.throbberMessageStack.length > 0) {
            string = this.throbberMessageStack[this.throbberMessageStack.length - 1];
        }
        document.getElementById("message").innerText = string;
    }
    setThrobberMessage(string) {
        Utility.log(View, "setThrobberMessage", string);
        // // Utility.enforceTypes(arguments, String);

        this.throbberMessageStack = [string];
        document.getElementById("message").innerText = string;
    }
    onMenuTags(value) {
        Utility.log(View, "onMenuTags");
        
        if (value === undefined){
            this.tagMode = !this.tagMode;
        }
        
        if (this.tagMode) {
            $("#menuTags").text("Tag Mode On");
            $("#entityPanel").addClass("show-tags");
        } else {
            $("#menuTags").text("Tag Mode Off");
            $("#entityPanel").removeClass("show-tags");
        }
    }
};