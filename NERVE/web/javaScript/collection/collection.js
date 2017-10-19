/* global Utility, Symbol */

class Collection {
    constructor(array) {
        Collection.traceLevel = 0;
        Utility.log(Collection, "constructor");
        Utility.enforceTypes(arguments, ["optional", Array, HTMLCollection]);

        this.innerArray = [];
        this.listeners = [];

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
    addListener(listener) {
        Utility.log(Collection, "addListener");
        Utility.enforceTypes(arguments, Object);
        this.listeners.push(listener);
        return this;
    }
    notifyListeners() {
        Utility.log(Collection, "notifyListeners");
        Utility.enforceTypes(arguments);
        for (let listener of this.listeners) listener.onChange(this);
    }
    add(obj) {
        Utility.log(Collection, "add");
        Utility.enforceTypes(arguments, Object);

        if (!this.contains(obj)) {
            this.innerArray.push(obj);
            this.notifyListeners();
        }
    }
    set(obj) {
        Utility.log(Collection, "add");
        Utility.enforceTypes(arguments, Object);
        this.innerArray = [obj];
        this.notifyListeners();
    }
    addAll(collection) {
        Utility.log(Collection, "addAll");
        Utility.enforceTypes(arguments, Collection);

        let changed = false;
        for (let obj of collection) {
            if (!this.contains(obj)) {
                this.innerArray.push(obj);
                changed = true;
            }
        }
        if (changed) this.notifyListners();
    }
    clear() {
        Utility.log(Collection, "clear");
        Utility.enforceTypes(arguments);
        this.innerArray = [];
        this.notifyListeners();
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
        Utility.log(Collection, "isEmpty");
        Utility.enforceTypes(arguments);
        return this.innerArray.length === 0;
    }
    remove(obj) {
        Utility.log(Collection, "remove");
        Utility.enforceTypes(arguments, Object);
        if (!this.contains(obj)) return null;
        this.innerArray.splice(this.innerArray.indexOf(obj), 1);
        this.notifyListeners();
        return obj;
    }
    contains(obj) {
        Utility.log(Collection, "contains");
        Utility.enforceTypes(arguments, Object);
        return this.innerArray.indexOf(obj) !== -1;
    }
}