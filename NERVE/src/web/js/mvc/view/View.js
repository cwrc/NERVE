/* global Utility, TaggedEntityWidget, Collection, ProgressPacket */
const ProgressStage = require("nerscriber").ProgressStage;

class View {
    constructor() {
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

    notifyCollectionAdd(collection, taggedEntityWidgets) {
        let taggedEntityWidget = taggedEntityWidgets[0];
        $(taggedEntityWidget.getElement()).addClass("selected");
    }
    notifyCollectionClear(collection, TaggedEntityWidgets) {
        for (let TaggedEntityWidget of TaggedEntityWidgets) {
            $(TaggedEntityWidget.getElement()).removeClass("selected");
        }
    }
    notifyCollectionRemove(collection, TaggedEntityWidget) {
        $(TaggedEntityWidget.getElement()).removeClass("selected");
    }
//    notifyProgress(progressPacket) {
//        if (progressPacket.progressStage === ProgressStage.START){
//            this.showThrobber(true);
//        } else if (progressPacket.progressStage === ProgressStage.CONTINUE){
//            this.setThrobberMessage(progressPacket.message);
//        } else if (progressPacket.progressStage === ProgressStage.COMPLETE){
//            this.showThrobber(false);
//        }
//    }
    notifySetDocument(docElement){
        $(docElement).find("*").removeClass("selected");
    }
    setDictionaryButton(button) {
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
        $("#panelContainer").scrollTop(
                $(element).offset().top - $("#panelContainer").offset().top + $("#panelContainer").scrollTop() - ($("#panelContainer").height() / 2)
                );
    }
    focusFind() {
        document.getElementById("epsTextArea").focus();
    }
    setFindText(string) {
        document.getElementById("epsTextArea").value = string;
    }
    getSearchTerm() {
        return document.getElementById("epsTextArea").value;
    }
    clear() {
        $("#entityPanel").empty();
        $("#tagnamePanel").empty();
    }
    setFilename(text) {
        document.getElementById("documentTitle").innerHTML = text;
    }
    setDialogs(value) {
        $("#txtEntity").val(value.text());
        $("#txtLemma").val(value.lemma());
        $("#txtLink").val(value.link());
        $("#selectTagName").val(value.tag());
    }
    setSearchText(string) {
        if (typeof string === undefined || string === null) {
            string = "";
        }
        document.getElementById("epsTextArea").value = string;
    }
    notifyMessage(message){
        let modal = $("#globalMessage");
        $(modal).find("[data-widget-id='message']").text(message);
        $(modal).modal("show");
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
        $("#throbberBG").css("opacity", opacity);

        if (flag) $("#throbberBG").show();
        else $("#throbberBG").hide();
    }
    pushThrobberMessage(string) {
        this.throbberMessageStack.push(string);
        document.getElementById("message").innerText = string;
    }
    popThrobberMessage() {
        let string = "";
        this.throbberMessageStack.pop();
        if (this.throbberMessageStack.length > 0) {
            string = this.throbberMessageStack[this.throbberMessageStack.length - 1];
        }
        document.getElementById("message").innerText = string;
    }
    setThrobberMessage(string) {
        this.throbberMessageStack = [string];
        document.getElementById("message").innerText = string;
    }
    onMenuTags(value) {
        if (value === undefined){
            this.tagMode = !this.tagMode;
        }
        if (this.tagMode) {
            $("#menuTags").text("Show Tags Enabled");
            $("#entityPanel").addClass("show-tags");
        } else {
            $("#menuTags").text("Show Tags Disabled");
            $("#entityPanel").removeClass("show-tags");
        }
    }
}

module.exports = View;