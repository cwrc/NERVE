/* global trace, Utility */

class HasContext {
    constructor() {
        EmptySchema.traceLevel = 0;
        Utility.log(EmptySchema, "constructor");
        this.context = new Context();
        this.context.load({tags: []});
    }
    getContext() {
        Utility.log(HasContext, "getContext");
        Utility.enforceTypes(arguments);
        return Utility.assertType(this.context, Context);
    }
}

class Model extends HasContext {
    constructor(view, factory, settings) {
        super();
        Model.traceLevel = 0;
        Utility.log(Model, "constructor");
        Utility.enforceTypes(arguments, View, TaggedEntityFactory, Storage);

        this.view = view;
        this.factory = factory;
        this.settings = settings;
        this.variables = {};

        this.maxStateIndex = 30;
        this.__resetState();

        this.textBoxValueChange = false;
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

    setContext(jsonString, onSuccess = function() {}, onFailure = function(){}) {
        Utility.log(Model, "setContext");
        Utility.enforceTypes(arguments, String, ["optional", Function], ["optional", Function]);

        for (let name in this.variables) {
            jsonString = jsonString.replace("$" + name, this.variables[name]);
        }

        this.context = new Context();
        this.context.load(JSON.parse(jsonString), onSuccess, onFailure);
    }

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

        this.settings.setValue("current", "document", this.getDocument());
        this.stateList[this.stateIndex] = this.getDocument();

    }
    revertState() {
        Utility.log(Model, "revertState");
        Utility.enforceTypes(arguments);

        if (this.stateIndex <= 0) return false;

        this.stateIndex = this.stateIndex - 1;
        let document = this.stateList[this.stateIndex];

        this.settings.setValue("current", "document", this.getDocument());
        this.view.setDocument(document);
        this.__markupDocument();

        return true;
    }
    advanceState() {
        Utility.log(Model, "advanceState");
        Utility.enforceTypes(arguments);

        if (typeof this.stateList[this.stateIndex + 1] === "undefined" || this.stateList[this.stateIndex + 1] === null) return;

        this.stateIndex = this.stateIndex + 1;
        let document = this.stateList[this.stateIndex];

        this.settings.setValue("current", "document", document);
        this.view.setDocument(document);
        this.__markupDocument();


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
        this.settings.setValue("model", "document", this.getDocument());
        this.settings.setValue("model", "filename", filename);

        this.factory.clear();
        let dom = this.view.getDOMObject();
        this.factory.addElementTree(dom);

        this.__resetState();

    }
    getFilename() {
        Utility.log(Model, "getFilename");
        Utility.enforceTypes(arguments);

        return this.settings.getValue("model", "filename", "filename");
    }
    /**
     * Return a string representing the current document.
     * @returns {String}
     */
    getDocument() {
        Utility.log(Model, "getDocument");
        Utility.enforceTypes(arguments);

        return this.view.getDOMObject().innerHTML;
    }

    __markupDocument() {
        Utility.log(Model, "__markupDocument");
        Utility.enforceTypes(arguments);

        this.factory.clear();
        let dom = this.view.getDOMObject();
        var taggedElements = dom.getElementsByTagName("tagged");
        for (var i = 0; i < taggedElements.length; i++) {
            this.factory.fromValidElement(taggedElements[i]);
        }
    }
    
    constructEntityFromElement(element, tagName, identifier = - 1) {
        Utility.log(Model, "constructEntityFromElement");
        Utility.enforceTypes(arguments, HTMLElement, String, ["optional", Number]);

        let taggedEntity = this.factory.constructFromElement(element, tagName, identifier);
        return taggedEntity;
    }
}