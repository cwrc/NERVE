/* global Utility, Event, Range */

class IMessageHandler {
    constructor() {}
    message(string) {}
}

IMessageHandler.null = new IMessageHandler();

class MessageHandler extends IMessageHandler {
    constructor(view) {
        super();
        MessageHandler.traceLevel = 0;
        Utility.log(MessageHandler, "constructor");
        Utility.enforceTypes(arguments, View);
        this.view = view;
    }
    message(string) {
        this.view.appendMessage(string);
        console.log(string);
    }
}

class Events {
    constructor(view, model, controller) {
        Events.traceLevel = 2;
        Utility.log(Events, "constructor");
        Utility.enforceTypes(arguments, View, Model, Controller, ["optional", Function]);

        this.clearConsole = false;
        this.view = view;
        this.model = model;
        this.controller = controller;
        this.msgHnd = new MessageHandler(view);
    }

    setContext(context){
        Utility.log(Events, "setContext");
        Utility.enforceTypes(arguments, Context);
        this.context = context;
    }

    buttonFind(event) {
        Utility.log(Events, "buttonFind");
        Utility.enforceTypes(arguments, Event);

        if (!event.ctrlKey) {
            this.controller.unselectAll();
        }

        this.controller.find();
        event.stopPropagation();
    }

    cbDictionaryClick(event) {
        Utility.log(Events, "cbDictionaryClick");
        Utility.enforceTypes(arguments, Event);
        event.stopPropagation();
    }

    cbDictionaryChange(event) {
        Utility.log(Events, "cbDictionaryChange");
        Utility.enforceTypes(arguments, Event);
        this.controller.updateDictionaryOnSelected();
    }

    documentClick(event) {
        Utility.log(Events, "documentClick");
//        Utility.enforceTypes(arguments, Event);

        if (event.altKey){
            console.log(event);
            window.inspectedElement = event.target;
            console.log(event.target);
            return;
        }

        if (event.ctrlKey) return;
        let dialog = jQuery("#cwrcSearchDialog").get(0);
        if (Utility.isDescendent(dialog, event.target)) return;
        this.controller.unselectAll();

        event.stopPropagation();
    }
    entityPanelClick(event) {
        Utility.log(Events, "entityPanelClick");
        Utility.enforceTypes(arguments, Event);

        if (!event.ctrlKey) {
            this.controller.unselectAll();
        }

        event.stopPropagation();
    }
    menuClearSelection() {
        Utility.log(Events, "menuClearSelection");
        Utility.enforceTypes(arguments);

        this.controller.unselectAll();
        window.getSelection().empty();
    }
    menuShowTagsChange(value){
        Utility.log(Events, "menuShowTagsChange");
        Utility.enforceTypes(arguments, Boolean);

        let settings = new Storage();

        if (value === true){
            this.view.attachStyle("tags.css");
            settings.setValue("tags", "show", "true");
        } else {
            this.view.detachStyle("tags.css");
            settings.setValue("tags", "show", "false");
        }
    }
    menuClose(){
        Utility.log(Events, "menuClose");
        Utility.enforceTypes(arguments);
        this.controller.closeDocument();
    }

    menuCopy() {
        Utility.log(Events, "menuCopy");
        Utility.enforceTypes(arguments);

        this.controller.copyInfo();
    }

    menuContextChange(contextName) {
        Utility.log(Events, "menuContextChange");
        if (this.clearConsole) console.clear();
        Utility.enforceTypes(arguments, String);

        let onContextLoadFailure = function (status, text) {
            let msg = "Failed to load context\n";
            msg += "return status : " + status;
            console.log(text);
            window.alert(msg);
            this.view.showThrobber(false);
        }.bind(this);

        let onContextLoadSuccess = function () {
            this.view.showThrobber(false);
            this.view.popThrobberMessage();
        }.bind(this);

        this.view.showThrobber(true);
        this.view.pushThrobberMessage("Loading Context");
        this.controller.loadContext(contextName.toLowerCase(), onContextLoadSuccess, onContextLoadFailure);
    }
    menuDelete() {
        Utility.log(Events, "menuDelete");
        Utility.enforceTypes(arguments);

        this.controller.deleteSelectedEntities();

        event.stopPropagation();
    }
    menuFind() {
        Utility.log(Events, "menuFind");
        Utility.enforceTypes(arguments);
        this.controller.fillFind();
    }

    menuMerge() {
        Utility.log(Events, "menuMerge");
        Utility.enforceTypes(arguments);
        event.stopPropagation();

        let response = this.controller.mergeSelectedEntities();
//        if (response.hasMessage()) this.view.showUserMessage(response.message);
    }

    menuOpen() {
        Utility.log(Events, "menuOpen");
        Utility.enforceTypes(arguments);
        this.controller.loadDocument();
    }

    menuPaste() {
        Utility.log(Events, "menuPaste");
        Utility.enforceTypes(arguments);

        this.controller.pasteInfo();
    }

    menuRedo() {
        Utility.log(Events, "menuRedo");
        Utility.enforceTypes(arguments);

        this.controller.unselectAll();
        this.model.advanceState();
    }
    menuResetAll() {
        Utility.log(Events, "menuResetAll");
        Utility.enforceTypes(arguments);

        localStorage.clear();
        location.reload(true);
    }
    menuSameSelect(event) {
        Utility.log(Events, "menuSameSelect");
        Utility.enforceTypes(arguments, Event);


        this.controller.selectByEntity();
        event.stopPropagation();
    }
    menuSave() {
        Utility.log(Events, "menuSave");
        Utility.enforceTypes(arguments);
        this.view.showThrobber(true);
        this.controller.saveContents(() => this.view.showThrobber(false),(status, text) =>{
            window.alert("Content Save Failed : " + status);
            console.log("Content Save Failed");
            console.log(text);
            this.view.showThrobber(false)
        });
    }
    menuSettings(event) {
        Utility.log(Events, "menuSettings");
        Utility.enforceTypes(arguments, Event);

        var child = window.open("settings.html", "_blank");
        child.entityPanel = document.getElementById("entityPanel");
    }
    menuSmartSelect(event) {
        Utility.log(Events, "menuSmartSelect");
        Utility.enforceTypes(arguments, Event);

        event.stopPropagation();

        this.controller.smartSelect();

    }
    menuTag() {
        Utility.log(Events, "menuTag");
        Utility.enforceTypes(arguments);
        let response = this.controller.tagSelectedRange();
    }

    menuUndo() {
        Utility.log(Events, "menuUndo");
        Utility.enforceTypes(arguments);

        this.controller.unselectAll();
        this.model.revertState();
    }

    menuUntag() {
        Utility.log(Events, "menuUntag");
        Utility.enforceTypes(arguments);
        let response = this.controller.untagAll();
    }

    searchNext(text){
        Utility.log(Events, "searchNext");
        Utility.enforceTypes(arguments, String);
        this.controller.search(text, "next");
    }

    searchPrev(text){
        Utility.log(Events, "searchPrev");
        Utility.enforceTypes(arguments, String);
        console.log(this.controller);
        this.controller.search(text, "prev");
    }

    selDictionaryClick(event) {
        Utility.log(Events, "selDictionaryClick");
        Utility.enforceTypes(arguments, Event);

        event.stopPropagation();
    }
    selDictionaryChange(event, newValue) {
        Utility.log(Events, "selDictionaryChange");
        if (this.clearConsole) console.clear();
        Utility.enforceTypes(arguments, Event, String);

        this.controller.setDictionary(newValue);
    }

    showSearchDialog(event) {
        Utility.log(Events, "showSearchDialog");
        Utility.enforceTypes(arguments, Event);

        this.controller.showSearchDialog();
        event.stopPropagation();
    }
    taggedEntityClick(taggedEntity) {
        Utility.log(Events, "taggedEntityClick");
        Utility.enforceTypes(arguments, HTMLDivElement);

        if (window.event.altKey) {
            /* strictly for debugging */
            window.debug = taggedEntity;
            console.log(taggedEntity);
            event.stopPropagation();
        } else {
            if (!event.ctrlKey && !event.metaKey) {
                this.controller.setSelected(taggedEntity);
            } else {
                this.controller.toggleSelect(taggedEntity);
            }
            event.stopPropagation();
        }
    }
    taggedEntityDoubleClick(event, taggedEntity) {
        Utility.log(Events, "taggedEntityDoubleClick");
        Utility.enforceTypes(arguments, Event, TaggedEntity);

        if (window.event.altKey) {
            /* do nothing */
        } else {
            event.preventDefault();
            this.controller.selectSameEntities(taggedEntity);
        }
    }

    textBoxBlur(event) {
        Utility.log(Events, "textBoxBlur");
        event.stopPropagation();
    }

    textBoxClick(event) {
        Utility.log(Events, "textBoxClick");
        event.stopPropagation();
    }
    textBoxInput(event) {
        Utility.log(Events, "textBoxInput");
        event.stopPropagation();
        this.controller.notifyDialogInput();
    }
    textBoxChange(event) {
        Utility.log(Events, "textBoxChange");
        event.stopPropagation();
    }
}