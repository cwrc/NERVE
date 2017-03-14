/* global super, Utility */

class SearchCollection extends Collection {
    constructor(element, hasContext) {
        super();
        SearchCollection.traceLevel = 2;
        Utility.log(SearchCollection, "constructor");
        Utility.enforceTypes(arguments, HTMLElement, HasContext);

        this.element = element;
        this.hasContext = hasContext;
    }
    __getContext() {
        Utility.enforceTypes(arguments);

        return this.hasContext.getContext();
    }
    addRange(range) {
        Utility.log(SearchCollection, "addRange");
        Utility.enforceTypes(arguments, Range);

        let newNode = document.createElement("selected");
        range = this.__trimRange(range);

        try {
            range.surroundContents(newNode);
        } catch (e) {
            if (e instanceof DOMException) return;
            else throw e;
        }

        super.add(newNode);
    }
    search(term) {
        Utility.log(SearchCollection, "search");
        Utility.enforceTypes(arguments, String);

        term = term.trim();
        if (term === "") return;
        var x = this.__searchRecurse(this.element, term, []);

        for (var range of x) {
            this.addRange(range);
        }

        document.getElementById("entityPanel").focus();
    }
    remove(obj, unwrap = false) {
        Utility.log(SearchCollection, "remove");
        Utility.enforceTypes(arguments, Object, ["optional", Boolean]);

        if (unwrap) this.unwrap(obj);
    }
    clear(unwrap = false) {
        Utility.log(SearchCollection, "clear");
        Utility.enforceTypes(arguments, ["optional", Boolean]);

        if (unwrap) {
            super.forEach(s => this.unwrap(s));
        }
        super.clear();
        this.element.normalize();
    }
    unwrap(ele) {
        Utility.log(SearchCollection, "unwrap");
        Utility.enforceTypes(arguments, HTMLElement);

        let parent = ele.parentNode;

        while (ele.firstChild) {
            parent.insertBefore(ele.firstChild, ele);
        }
        parent.removeChild(ele);
    }
    __searchRecurse(ele, term, rangeObjects) {
        Utility.log(SearchCollection, "__searchRecurse");
        Utility.enforceTypes(arguments, [HTMLElement, Comment], String, Array);

        for (var child of ele.childNodes) {
            if (child.nodeName.toLowerCase() === this.__getContext().getHTMLLabel("tagged").toLowerCase()) {
                continue;
            } else if (child.nodeName.toLowerCase() === "selected") {
                continue;
            } else if (child.nodeName !== "#text") {
                this.__searchRecurse(child, term, rangeObjects);
            } else if (typeof child.textContent !== "undefined") {

                var text = child.textContent;
                var index = 0;

                while (index !== -1 && index < text.length) {
                    index = text.indexOf(term, index);

                    if (index >= 0) {
                        let range = document.createRange();
                        range.setStart(child, index);
                        range.setEnd(child, index + term.length);
                        rangeObjects.push(range);
                        index = index + term.length;
                    }
                }
            }
        }
        return rangeObjects;
    }
    __trimRange(range) {
        Utility.log(SearchCollection, "__trimRange");
        Utility.enforceTypes(arguments, Range);

        while (range.toString().charAt(range.toString().length - 1) === ' ') {
            range.setEnd(range.endContainer, range.endOffset - 1);
        }

        while (range.toString().charAt(0) === ' ') {
            range.setStart(range.startContainer, range.startOffset + 1);
        }

        return range;
    }
}