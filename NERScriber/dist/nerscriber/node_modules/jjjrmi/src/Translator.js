"use strict";
let Encoder = require("./Encoder");
let Decoder = require("./Decoder");
let ArrayList = require("./java-equiv/ArrayList");
let EncodedJSON = require("./EncodedJSON");

class BiMap {
    constructor() {
        this.objectMap = new Map();
        this.reverseMap = new Map();
    }
    clear() {
        this.objectMap.clear();
        this.reverseMap.clear();
    }
    keys() {
        return this.objectMap.keys();
    }
    removeByKey(key) {
        let obj = this.objectMap.get(key);
        this.objectMap.delete(key);
        this.reverseMap.delete(obj);
    }
    removeByValue(obj) {
        let key = this.reverseMap.get(obj);
        this.objectMap.delete(key);
        this.reverseMap.delete(obj);
    }
    get(key) {
        return this.objectMap.get(key);
    }
    put(key, value) {
        this.objectMap.set(key, value);
        this.reverseMap.set(value, key);
    }
    getKey(value) {
        return this.reverseMap.get(value);
    }
    containsKey(key) {
        return this.objectMap.has(key);
    }
    containsValue(value) {
        return this.reverseMap.has(value);
    }
    /* remove target freom the translator replacing it with source, maintaining the same key */
    swap(source, target) {
        let key = this.getKey(target);
        this.objectMap.set(key, source);
        this.reverseMap.delete(target);
        this.reverseMap.set(source, key);
    }
}

class ClassMap {
    constructor() {
        this.classmap = new Map();
    }
    registerPackage(pkg) {
        for (let aClass in pkg)
            this.registerClass(pkg[aClass]);
    }

    registerClass(aClass) {
        if (typeof aClass !== "function") throw new Error(`paramater 'class' of method 'registerClass' is '${typeof aClass.__getClass}', expected 'function'`);
        if (typeof aClass.__getClass !== "function") throw new Error(`in Class ${aClass.constructor.name} method __getClass of type ${typeof aClass.__getClass}`);
        this.classmap.set(aClass.__getClass(), aClass);
    }

    getClass(classname) {
        if (!this.classmap.has(classname)) throw new Error(`Class ${classname} not registered.`);
        return this.classmap.get(classname);
    }

    copyFrom(map) {
        for (let classname of map.keys()) {
            this.classmap.set(classname, map.get(classname));
        }
    }
}

class Translator extends ClassMap {
    constructor() {
        super();
        this.handlers = new Map();
        this.encodeListeners = new ArrayList();
        this.decodeListeners = new ArrayList();
        this.deferred = new ArrayList();
        this.objectMap = new BiMap();
        this.tempReferences = new ArrayList();
        this.nextKey = 0;
    }
    addDecodeListener(lst) {
        this.decodeListeners.add(lst);
    }
    addEncodeListener(lst) {
        this.encodeListeners.add(lst);
    }
    addReference(reference, object) {
        this.objectMap.put(reference, object);
    }
    addTempReference(reference, object) {
        this.objectMap.put(reference, object);
        this.tempReferences.add(reference);
    }
    allocNextKey() {
        return "C" + this.nextKey++;
    }
    clear() {
        this.objectMap.clear();
        this.tempReferences.clear();
    }
    clearTempReferences() {
        for (let ref of this.tempReferences) {
            this.removeByKey(ref);
        }
        this.tempReferences.clear();
    }
    decode(json) {
        if (json === null) throw new Error("JSON object is null.");
        if (typeof json === "undefined") throw new Error("JSON object is undefined.");
        if (typeof json === "string") json = JSON.parse(json);

        let rvalue = null;
        let eson = new EncodedJSON(json);
        new Decoder(eson, this, null).decode(r => {
            while (!this.deferred.isEmpty())
                this.deferred.remove(0).resume();
            this.clearTempReferences();
            rvalue = r;
        });
        return rvalue;
    }
    deferDecoding(decoder) {
        this.deferred.add(decoder);
    }
    encode(object) {
        let toJSON = new Encoder(object, this).encode();
        this.clearTempReferences();
        return toJSON;
    }
    getAllReferredObjects() {
        let values = this.objectMap.values();
        return new ArrayList(values);
    }
    getHandler(aClass) {
        return this.handlers.get(aClass.__getClass());
    }
    hasHandler(aClass) {
        return this.handlers.has(aClass.__getClass());
    }
    setHandler(aClass, handler) {
        this.handlers.set(aClass.__getClass(), handler);
    }
    getReference(object) {
        return this.objectMap.getKey(object);
    }
    getReferredObject(reference) {
        return this.objectMap.get(reference);
    }
    hasReference(reference) {
        return this.objectMap.containsKey(reference);
    }
    hasReferredObject(object) {
        return this.objectMap.containsValue(object);
    }
    notifyDecode(object) {
        for (let decodeListener of this.decodeListeners) {
            decodeListener(object);
        }
    }
    notifyEncode(object) {
        for (let encodeListener of this.encodeListeners) {
            encodeListener(object);
        }
    }
    removeByKey(key) {
        if (!this.objectMap.containsKey(key))
            return false;
        this.objectMap.removeByKey(key);
        return true;
    }
    removeByValue(obj) {
        if (!this.objectMap.containsValue(obj))
            return false;

        this.objectMap.remove(this.objectMap.getKey(obj));
        return true;
    }
}
;
module.exports = Translator;