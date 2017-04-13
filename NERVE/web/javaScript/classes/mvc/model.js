/* global trace, Utility, Listeners */

class Model {
    constructor(view, settings) {
        Model.traceLevel = 0;
        Utility.log(Model, "constructor");
        Utility.enforceTypes(arguments, View, Storage);

        this.view = view;
        this.settings = settings;
        this.variables = {};

        /* refers to the index of the last saved state -1 if never saved */
        this.stateIndex = -1;
        this.maxStateIndex = 30;
        this.__resetState();
    }

    loadStoredDoc(){
        if (this.settings.hasValue("document") && this.settings.hasValue("filename")){
            this.setDocument(this.settings.getValue("document"), this.settings.getValue("filename"));
            $(".selected").removeClass("selected");
            return true;
        }
        return false;
    }

    reset(){
        Utility.log(Model, "reset");
        Utility.enforceTypes(arguments);
        this.__resetState();
        this.view.setDocument("");
        this.view.setFilename("");
        this.settings.deleteValue("document");
        this.settings.deleteValue("filename");
    }

    setListener(listener) {
        Utility.log(Model, "setListener");
        Utility.enforceTypes(arguments, Listeners);
        this.listener = listener;
    }

    /**
     * Assign a $name = value variable that will serve as find replace when
     * loading the context.
     * @param {type} name
     * @param {type} value
     * @returns {undefined}
     */
    setVariable(name, value) {
        Utility.log(Model, "setVariable");
        Utility.enforceTypes(arguments, String, String);
        this.variables[name] = value;
    }

    setContext(context) {
        Utility.log(Model, "setContext");
        Utility.enforceTypes(arguments, Context);
        this.context = context;
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

        this.settings.setValue("document", this.getDocument());
        this.stateList[this.stateIndex] = this.getDocument();
    }

    revertState() {
        Utility.log(Model, "revertState");
        Utility.enforceTypes(arguments);

        if (this.stateIndex <= 0) return false;

        this.stateIndex = this.stateIndex - 1;
        let document = this.stateList[this.stateIndex];

        this.settings.setValue("document", this.getDocument());
        this.view.setDocument(document);

        $(".taggedentity").removeClass("selected");
    }

    advanceState() {
        Utility.log(Model, "advanceState");
        Utility.enforceTypes(arguments);

        if (typeof this.stateList[this.stateIndex + 1] === "undefined" || this.stateList[this.stateIndex + 1] === null) return;

        this.stateIndex = this.stateIndex + 1;
        let document = this.stateList[this.stateIndex];

        this.settings.setValue("current", "document", document);
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
        this.view.setDocument(text);
        this.view.setFilename(filename);
        this.settings.setValue("document", text);
        this.settings.setValue("filename", filename);
        this.__resetState();
    }

    getFilename() {
        Utility.log(Model, "getFilename");
        Utility.enforceTypes(arguments);
        return this.settings.getValue( "filename");
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

    setEntityValues(selector, values){
        Utility.log(Model, "setEntityValues");
        Utility.enforceTypes(arguments, [HTMLDivElement, jQuery], Object);

        $(selector).entityTag(values.tagName);
        $(selector).lemma(values.lemma);
        $(selector).link(values.link);
    }

    setupTaggedEntity(selector){
        Utility.log(Model, "setupTaggedEntity");
        Utility.enforceTypes(arguments, [HTMLDivElement, jQuery]);

        $(selector).each((i, ele)=>{
            if ($(ele).link() === "" || typeof $(ele).link() === "undefined"){
                $(ele).removeClass("linked");
            } else {
                $(ele).addClass("linked");
            }
        });
    }
}

Model.xmlAttr = function(element, attr, value){
    let rvalue = {};
    if ($(element).attr("xmlattrs") === undefined){
        $(element).attr("xmlattrs", "");
        return rvalue;
    }
    let xmlAttr = $(element).attr("xmlattrs").split(";");

    for (let s of xmlAttr){
        console.log(s);
    }

    if (typeof value === "undefined") return xmlAttr[0];
};

