AbstractModel = require("./AbstractModel");

class SearchModel extends AbstractModel{
    constructor(srcSelector){
        Utility.log(SearchModel, "constructor");
        // Utility.enforceTypes(arguments, String);

        super();

        this.rootElement = $(srcSelector)[0];
        this.current = -1;
        this.instances = [];
        this.lastTerm = "";
    }

    reset(){
        this.current = -1;
        this.instances = [];
        this.lastTerm = "";
    }

    search(term) {
        Utility.log(SearchModel, "search");
        // Utility.enforceTypes(arguments, String);

        if (term === null || this.lastTerm === term || term.length === 0) return this.instances.length;
        this.lastTerm = term;

        term = term.trim();
        if (term === "") return;
        this.instances = this.__searchRecurse(this.rootElement, term, []);
        if (this.instances.length === 0) return 0;
        this.current = -1;
        $("#entityPanel").focus();

        return this.instances.length;
    }

    next(){
        Utility.log(SearchModel, "next");
        // Utility.enforceTypes(arguments);
        let last = this.current;
        this.current++;
        if (this.current >= this.instances.length) this.current = 0;
        if (last !== this.current) this.notifyListeners("notifySearchChange", this.instances[this.current]);
    }

    prev(){
        Utility.log(SearchModel, "prev");
        // Utility.enforceTypes(arguments);
        let last = this.current;
        this.current--;
        if (this.current < 0) this.current = this.instances.length - 1;
        if (last !== this.current) this.notifyListeners("notifySearchChange", this.instances[this.current]);
    }

    __searchRecurse(ele, term, foundObjects) {
        Utility.log(SearchModel, "__searchRecurse");
        // Utility.enforceTypes(arguments, [HTMLElement, Comment], String, Array);

        for (var child of ele.childNodes) {
            if (child.nodeName !== "#text") {
                this.__searchRecurse(child, term, foundObjects);
            } else if (typeof child.textContent !== "undefined") {

                var text = child.textContent;
                var index = 0;

                while (index !== -1 && index < text.length) {
                    index = text.indexOf(term, index);

                    if (index >= 0) {
                        let range = document.createRange();
                        range.setStart(child, index);
                        range.setEnd(child, index + term.length);
                        foundObjects.push(range);
                        index = index + term.length;
                    }
                }
            }
        }
        return foundObjects;
    }
}

module.exports = SearchModel;