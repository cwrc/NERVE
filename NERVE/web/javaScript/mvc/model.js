/* global trace, Utility, Listeners */

class Model {
    constructor(view) {
        Utility.log(Model, "constructor");
        Utility.enforceTypes(arguments, View);

        this.storage = new Storage("NERVE_CONTROLLER");
        this.view = view;
        this.variables = {};
        this.listeners = [];

        /* refers to the index of the last saved state -1 if never saved */
        this.stateIndex = -1;
        this.maxStateIndex = 30;
        this.__resetState();
    }

    reset() {
        Utility.log(Model, "reset");
        Utility.enforceTypes(arguments);
        this.__resetState();
        this.view.setDocument("");
        this.view.setFilename("");
    }

    addListener(listener) {
        Utility.log(Model, "addListener");
        Utility.enforceTypes(arguments, Listeners);
        this.listeners.push(listener);
    }

    /**
     * Call 'saveState()' after any change that you want to be able to recover
     * to.  This is typically any change in the model that can be seen by the
     * user.
     * @returns {undefined}
     */
    saveState() {
        Utility.log(Model, "saveState");
        Utility.enforceTypes(arguments);

        if (this.stateIndex === this.maxStateIndex) {
            this.stateList = this.stateList.slice(1, this.stateIndex);
        } else {
            this.stateIndex = this.stateIndex + 1;
            for (let i = this.stateIndex; i < this.maxStateIndex; i++) {
                this.stateList[i] = null;
            }
        }

        this.storage.setValue("document", this.getDocument());
        this.stateList[this.stateIndex] = this.getDocument();
    }
    revertState() {
        Utility.log(Model, "revertState");
        Utility.enforceTypes(arguments);

        if (this.stateIndex <= 0) return false;

        console.log(this.stateIndex + " " + (this.stateIndex - 1));

        this.stateIndex = this.stateIndex - 1;
        let document = this.stateList[this.stateIndex];

        this.storage.setValue("document", this.getDocument());
        this.view.setDocument(document);
    }
    advanceState() {
        Utility.log(Model, "advanceState");
        Utility.enforceTypes(arguments);

        if (typeof this.stateList[this.stateIndex + 1] === "undefined" || this.stateList[this.stateIndex + 1] === null) return;

        this.stateIndex = this.stateIndex + 1;
        let document = this.stateList[this.stateIndex];

        this.storage.setValue("current", "document", document);
        this.view.setDocument(document);

        $(".taggedentity").removeClass("selected");
    }
    __resetState() {
        Utility.log(Model, "__resetState");
        Utility.enforceTypes(arguments);

        this.stateList = [];
        this.stateIndex = 0;

        for (let i = 0; i < this.maxStateIndex; i++) {
            this.stateList[i] = null;
        }

        this.stateList[0] = this.getDocument();
    }
    setDocument(text, filename) {
        Utility.log(Model, "setDocument");
        Utility.enforceTypes(arguments, String, String);
        this.storage.setValue("document", text);
        this.storage.setValue("filename", filename);
        this.__resetState();
    }
    getFilename() {
        Utility.log(Model, "getFilename");
        Utility.enforceTypes(arguments);
        return this.storage.getValue("filename");
    }
    /**
     * Return a string representing the current document.
     * @returns {String}
     */
    getDocument() {
        Utility.log(Model, "getDocument");
        Utility.enforceTypes(arguments);
        return $("#entityPanel").html();
    }
}