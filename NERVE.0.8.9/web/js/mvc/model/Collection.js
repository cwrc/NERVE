/* global Utility, Symbol */

/**
 * events: notifyCollectionAdd, notifyCollectionClear, notifyCollectionRemove
 * @type type
 */

Utility = require("../../util/utility");
AbstractModel = require("./AbstractModel");

module.exports = class Collection extends AbstractModel {
    constructor(array) {
        super();
        this.delegate = this;

        this.innerArray = [];

        if (typeof array !== "undefined" & array !== null) {
            this.innerArray = Array(array.length);
            let i = array.length;
            while (i--) this.innerArray[i] = array[i];
        }
    }

    setDelegate(delegate) {
        this.delegate = delegate;
    }

    $() {
        return $(this.innerArray);
    }
    [Symbol.iterator] () {
        return this.innerArray[Symbol.iterator]();
    }
            
    add(obj) {
        let notifyarray = [];
        if (obj instanceof Array) {
            for (let o of obj) {
                if (!this.contains(o)) {
                    this.innerArray.push(o);
                    notifyarray.push(o);
                }
            }
        } else if (!this.contains(obj)) {
            this.innerArray.push(obj);
            notifyarray.push(obj);
        }
        this.delegate.notifyListeners("notifyCollectionAdd", this, notifyarray);
    }
    set(obj) {
        this.clear();
        this.add(obj);
    }
    async clear() {
        if (this.isEmpty()) return;
        let oldArray = this.innerArray;
        this.innerArray = [];
        await this.delegate.notifyListeners("notifyCollectionClear", this, oldArray);
    }
    get(i) {
        return this.innerArray[i];
    }
    getLast() {
        return this.innerArray[this.innerArray.length - 1];
    }
    getFirst() {
        return this.innerArray[0];
    }
    size() {
        return this.innerArray.length;
    }
    isEmpty() {
        return this.innerArray.length === 0;
    }
    remove(obj) {
        if (!this.contains(obj)) return null;
        this.innerArray.splice(this.innerArray.indexOf(obj), 1);
        this.delegate.notifyListeners();
        this.delegate.notifyListeners("notifyCollectionRemove", this, obj);
        return obj;
    }
    contains(obj) {
        return this.innerArray.indexOf(obj) !== -1;
    }
}