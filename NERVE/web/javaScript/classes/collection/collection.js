/* global Utility */

class Collection {
    constructor(array) {
        Collection.traceLevel = 0;
        Utility.log(Collection, "constructor");
        Utility.enforceTypes(arguments, ["optional", Array, HTMLCollection]);

        this.innerArray = [];
        if (typeof array !== "undefined" & array !== null) {
            this.innerArray = Array(array.length);
            let i = array.length;
            while (i--) this.innerArray[i] = array[i];
        }
    }
    $(){
        return $(this.innerArray);
    }
    add(obj) {
        Utility.log(Collection, "add");
        Utility.enforceTypes(arguments, Object);

        if (this.innerArray.indexOf(obj) !== -1) return;
        this.innerArray.push(obj);
    }

    addAll(collection){
        Utility.log(Collection, "addAll");
        Utility.enforceTypes(arguments, Collection);

        collection.forEach((item)=>this.add(item));
    }

    getFunctional(evaluator) {
        Utility.log(Collection, "getFunctional");
        Utility.enforceTypes(arguments, Function);

        let collection = new Collection();

        this.forEach((entity) => {
            if (evaluator(entity)) {
                collection.add(entity);
            }
        });

        return collection;
    }

    addStream(stream) {
        Utility.log(Collection, "add");
        Utility.enforceTypes(arguments, Stream);

        stream.forEach((e) => this.add(e));
        return this;
    }
    clear() {
        Utility.log(Collection, "clear");
        Utility.enforceTypes(arguments);

        this.innerArray = [];
    }
    each(callback) {
        Utility.log(Collection, "each");
        Utility.enforceTypes(arguments, Function);

        for (var i = 0; i < this.innerArray.length; i++) {
            callback(this.innerArray[i]);
        }
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

        var x = this.innerArray.indexOf(obj);
        if (x === -1) {
            return;
        }
        this.innerArray.splice(x, 1);
        return obj;
    }
    contains(obj) {
        Utility.log(Collection, "contains");
        Utility.enforceTypes(arguments, Object);

        let rvalue = false;

        this.each((thisObj) => {
            if (thisObj === obj) {
                rvalue = true;
            }
        });

        return rvalue;
    }
    stream() {
        return new Stream(this.innerArray);
    }
    /**
     * Return a non-reflective shallow copy of this collection as an array.
     * @returns {Array|Collection.toArray.rvalue}
     */
    toArray() {
        Utility.log(Collection, "toArray");
        Utility.enforceTypes(arguments);
        let rvalue = Array(this.innerArray.length);
        let i = this.innerArray.length;
        while (i--) rvalue[i] = this.innerArray[i];
        return rvalue;
    }
}

class Stream {
    constructor(array) {
        Utility.log(Stream, "constructor");
        Utility.enforceTypes(arguments, [Array, HTMLCollection]);
        this.innerArray = array;
    }
    forEach(callback) {
        Utility.log(Stream, "forEach");
        Utility.enforceTypes(arguments, Function);

        for (var i = 0; i < this.innerArray.length; i++) {
            callback(this.innerArray[i]);
        }
    }
    filter(predicate) {
        Utility.log(Stream, "filter");
        Utility.enforceTypes(arguments, Function);

        let rvalue = new Collection();
        this.forEach((item) => {
            if (predicate(item)) rvalue.add(item);
        });

        return rvalue.stream();
    }
    toArray() {
        Utility.log(Stream, "toArray");
        Utility.enforceTypes(arguments);

        let rvalue = [];
        for (let i = 0; i < this.innerArray.length; i++) rvalue.push(rvalue[i]);
        return rvalue;
    }
    toString(callback, deliminator = "") {
        let rvalue = "";
        for (var i = 0; i < this.innerArray.length - 1; i++) {
            rvalue += callback(this.innerArray[i]);
            rvalue += deliminator;
        }
        rvalue += this.innerArray[this.innerArray.length - 1];
        return rvalue;
    }
}