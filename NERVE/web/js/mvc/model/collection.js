/* global Utility, Symbol */

/**
 * events: notifyCollectionAdd, notifyCollectionClear, notifyCollectionRemove
 * @type type
 */

Utility = require("../../util/utility");
AbstractModel = require("./AbstractModel");

module.exports = class Collection extends AbstractModel{
    constructor(array) {
        Utility.log(Collection, "constructor");
        Utility.enforceTypes(arguments, ["optional", Array, HTMLCollection]);

        super();

        this.innerArray = [];

        if (typeof array !== "undefined" & array !== null) {
            this.innerArray = Array(array.length);
            let i = array.length;
            while (i--) this.innerArray[i] = array[i];
        }
    }

    $() {
        return $(this.innerArray);
    }
    [Symbol.iterator] () {
        return this.innerArray[Symbol.iterator]();
    }
    add(obj) {
        Utility.log(Collection, "add");
        Utility.enforceTypes(arguments, Object);

        console.log(obj);

        if (!this.contains(obj)) {
            this.innerArray.push(obj);
            this.notifyListeners("notifyCollectionAdd", this, obj);
        }
    }
    set(obj) {
        Utility.log(Collection, "add");
        Utility.enforceTypes(arguments, Object);
        this.clear();
        this.add(obj);
    }
    clear() {
        Utility.log(Collection, "clear");
        Utility.enforceTypes(arguments);
        if (this.isEmpty()) return;
        let oldArray = this.innerArray;
        this.innerArray = [];
        this.notifyListeners("notifyCollectionClear", this, oldArray);
    }
    get(i) {
        Utility.log(Collection, "get");
        Utility.enforceTypes(arguments, Number);
        return this.innerArray[i];
    }
    getLast() {
        Utility.log(Collection, "getLast");
        Utility.enforceTypes(arguments);
        return this.innerArray[this.innerArray.length - 1];
    }
    getFirst() {
        Utility.log(Collection, "getFirst");
        Utility.enforceTypes(arguments);
        return this.innerArray[0];
    }
    size() {
        Utility.log(Collection, "size");
        Utility.enforceTypes(arguments);
        return this.innerArray.length;
    }
    isEmpty() {
        Utility.log(Collection, "isEmpty", "", this.innerArray.length === 0);
        Utility.enforceTypes(arguments);
        return this.innerArray.length === 0;
    }
    remove(obj) {
        Utility.log(Collection, "remove");
        Utility.enforceTypes(arguments, Object);
        if (!this.contains(obj)) return null;
        this.innerArray.splice(this.innerArray.indexOf(obj), 1);
        this.notifyListeners();
        this.notifyListeners("notifyCollectionRemove", this, obj);
        return obj;
    }
    contains(obj) {
        Utility.log(Collection, "contains");
        Utility.enforceTypes(arguments, Object);
        return this.innerArray.indexOf(obj) !== -1;
    }
}