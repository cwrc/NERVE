/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Utility */

class SearchUtility{

    constructor(srcSelector, hasContext){
        Utility.log(SearchUtility, "constructor");
        Utility.enforceTypes(arguments, String, HasContext);

        this.srcSelector = srcSelector;
        this.element = $(srcSelector)[0];
        this.current = -1;
        this.instances = null;
        this.hasContext = hasContext;
        this.term = "";
    }

    search(term) {
        Utility.log(SearchUtility, "search");
        Utility.enforceTypes(arguments, String);

        if (this.term === term || term === "") return this.instances.length;
        this.term = term;

        term = term.trim();
        if (term === "") return;
        this.instances = this.__searchRecurse(this.element, term, []);
        this.current = -1;

        document.getElementById("entityPanel").focus();
        return this.instances.length;
    }

    next(){
        Utility.log(SearchUtility, "next");
        Utility.enforceTypes(arguments);
        this.current++;
        if (this.current >= this.instances.length) this.current = 0;
        console.log(this.current + " / " + this.instances.length);
        return this.instances[this.current];
    }

    prev(){
        Utility.log(SearchUtility, "prev");
        Utility.enforceTypes(arguments);
        this.current--;
        if (this.current < 0) this.current = this.instances.length - 1;
        return this.instances[this.current];
    }

    __searchRecurse(ele, term, foundObjects) {
        Utility.log(SearchUtility, "__searchRecurse");
        Utility.enforceTypes(arguments, [HTMLElement, Comment], String, Array);

        for (var child of ele.childNodes) {
            if (child.nodeName.toLowerCase() === this.hasContext.getContext().getHTMLLabel("tagged").toLowerCase()) {
                let taggedEntity = $(child).data("entityObject");
                if (taggedEntity.getEntity() === term) foundObjects.push(taggedEntity);
                continue;
            } else if (child.nodeName.toLowerCase() === "selected") {
                continue;
            } else if (child.nodeName !== "#text") {
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

