"use strict";
/* global Constants */
let Constants = require("./Constants");

class EncoderInterfaceException extends Error{
    constructor(object, method){
        super(`Object of class '${object.constructor.name}' is missing method '${method}'`);
        this.object = object;
    }
    
    getObject(){
        return this.object;
    }
}

class Encoder {
    constructor(object, translator, keys) {
        if (object !== null && typeof object === "object" && !object instanceof Array) {
            if (typeof object.constructor === "undefined") {
                throw new Error(`Object missing constructor.`);
            }
            if (typeof object.constructor.__isTransient !== "function") {
                EncoderInterfaceException(object, "__isTransient");
            }
            if (typeof object.constructor.__isEnum !== "function") {
                EncoderInterfaceException(object, "__isEnum");
            }
            if (typeof object.constructor.__getClass !== "function") {
                EncoderInterfaceException(object, "__getClass");
            }
        }
        
        this.object = object;
        this.translator = translator;
        this.keys = keys;
    }
    encode() {
        /* undefined & NULL objects are treated as NULL */
        if (typeof this.object === "undefined" || this.object === null) {
            return new EncodedNull().toJSON();
        }
        /* primitives */
        else if (typeof this.object === "number" || typeof this.object === "string" || typeof this.object === "boolean") {
            return new EncodedPrimitive(this.object).toJSON();
        }
        /* object is stored from previous transaction */
        else if (this.translator.hasReferredObject(this.object)) {
            return new EncodedReference(this.translator.getReference(this.object)).toJSON();
        }
        /* is array */
        else if (this.object instanceof Array) {
            return new EncodedArray(this.object, this.translator, this.keys).toJSON();
        }
        /* set to null skips encoding all together */
        else if (this.object["jjjEncode"] === null) {
            return null;
        }        
        
        /* The object's class is expected to be generated from java at this point */
        if (typeof this.object.constructor.__isEnum !== "function"){
            throw new EncoderInterfaceException(this.object, "__isEnum");
        }
        if (typeof this.object.constructor.__getClass !== "function"){
            throw new EncoderInterfaceException(this.object, "__getClass");
        }
        if (typeof this.object.constructor.__isTransient !== "function"){
            throw new EncoderInterfaceException(this.object, "__isTransient");
        }
        
        /* is Enum */
        /* handler has been registered */
        if (this.translator.hasHandler(this.object.constructor)) {
            let handler = this.translator.getHandler(this.object.constructor);
            let encodedObject = new EncodedObject(this.object, this.translator, this.keys);
            handler.encode(encodedObject, this.object);
            return encodedObject.toJSON();
        }
        /* object handles it's self */
        else if (typeof this.object["jjjEncode"] === "function") {
            let encodedObject = new EncodedObject(this.object, this.translator, this.keys);
            this.object.jjjEncode(encodedObject);
            return encodedObject.toJSON();
        }        
        else if (this.object.constructor.__isEnum()) {
            return new EncodedEnum(this.object, this.translator, this.keys).toJSON();
        }        
        /* encode object */
        else {
            let encodedObject = new EncodedObject(this.object, this.translator, this.keys);
            encodedObject.encode();
            return encodedObject.toJSON();
        }
    }
}

class EncodedNull {
    constructor() {
        this.json = {};
        this.json[Constants.TypeParam] = Constants.NullValue;
    }
    toJSON() {
        return this.json;
    }
}

class EncodedPrimitive {
    constructor(value) {
        this.json = {};
        this.json[Constants.PrimitiveParam] = typeof value;
        this.json[Constants.ValueParam] = value;
    }
    toJSON() {
        return this.json;
    }
}

class EncodedReference {
    constructor(ref) {
        this.json = {};
        this.json[Constants.PointerParam] = ref;
    }
    toJSON() {
        return this.json;
    }
}

class EncodedArray {
    constructor(object, translator, keys) {
        this.json = {};
        this.object = object;
        this.translator = translator;
        this.keys = keys;
        this.json[Constants.ElementsParam] = [];
        this.encode();
    }
    encode() {
        this.setValues(this.json[Constants.ElementsParam], this.object);
    }
    setValues(parent, current) {
        for (let i = 0; i < current.length; i++) {
            let element = current[i];
            let value = new Encoder(element, this.translator, this.keys).encode();
            if (value !== null) parent.push(value);
        }
    }
    toJSON() {
        return this.json;
    }
}

class EncodedEnum {
    constructor(object, translator, keys) {
        this.json = {};
        this.json[Constants.ValueParam] = object.toString();
        this.json[Constants.EnumParam] = object.constructor.__getClass();
    }

    toJSON() {
        return this.json;
    }
}

class EncodedObject {
    constructor(object, translator, keys) {
        this.json = {};
        this.object = object;
        this.translator = translator;
        this.keys = keys;

        this.json[Constants.TypeParam] = this.object.constructor.__getClass();
        this.json[Constants.FieldsParam] = {};

        let key = this.translator.allocNextKey();
        this.json[Constants.KeyParam] = key;

        if (this.object.constructor.__isTransient()) {
            this.translator.addTempReference(key, this.object);
        } else {
            this.translator.addReference(key, this.object);
        }

        if (typeof object.constructor.__isTransient !== "function") {
            window.object = object;
            throw new Error(`Field '__isTransient' of class '${object.constructor.name}' is not of type function, found type '${typeof object.constructor.__isTransient}'.`);
        }
    }

    encode() {
        for (let field in this.object) {
            this.setField(field, this.object[field]);
        }
        return this.json;
    }

    /**
     * Add a key-value pair to the json object.
     * @param {type} name
     * @param {type} value
     * @returns {undefined}
     */
    setField(name, value) {
        let encodedValue = new Encoder(value, this.translator, this.keys).encode();
        if (encodedValue !== null) this.json[Constants.FieldsParam][name] = encodedValue;
    }

    toJSON() {
        return this.json;
    }
}

module.exports = Encoder;