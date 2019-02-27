"use strict";
let Constants = require("./Constants");
let EncodedJSON = require("./EncodedJSON");

class RestoredObject {
    constructor(json, translator) {
        this.json = json;
        this.translator = translator;
        this.fields = json.get(Constants.FieldsParam);
    }
    decode() {
        let className = this.json.get(Constants.TypeParam);
        let aClass = this.translator.getClass(className);

        let newInstance = null;

        /* aready restored, retrieve restored object */;
        /* if handler, create new object with handler */;
        /* create new object from description */;
        if (this.json.has(Constants.KeyParam) && this.translator.hasReference(this.json.get(Constants.KeyParam))) {
            newInstance = this.translator.getReferredObject(this.json.get(Constants.KeyParam));
            return newInstance;
        } else if (this.translator.hasHandler(aClass)) {
            let handler = this.translator.getHandler(aClass);
            newInstance = handler.instatiate();
        } else {
            newInstance = new aClass();
        }

        if (!aClass.__isTransient()) this.translator.addReference(this.json.get(Constants.KeyParam), newInstance);
        else this.translator.addTempReference(this.json.get(Constants.KeyParam), newInstance);

        if (this.translator.hasHandler(aClass)) {
            let handler = this.translator.getHandler(aClass);
            handler.decode(this, newInstance);
        } else if (typeof newInstance.jjjDecode === "function") {
            newInstance.jjjDecode(this);
        } else {
            for (let field in this.json.get(Constants.FieldsParam)) {
                new Decoder(new EncodedJSON(this.json.get(Constants.FieldsParam)[field]), this.translator).decode(r=>newInstance[field] = r);
            }
        }

        this.translator.notifyDecode(newInstance);
        if (typeof newInstance.jjjOnDecode === "function"){
            newInstance.jjjOnDecode();
        }
        return newInstance;
    }
    decodeField(name, callback) {
        new Decoder(new EncodedJSON(this.fields[name]), this.translator).decode(r=>callback(r));
    }
    getJavaField(aClass, name) {
        while (aClass !== Object.class) {
            for (let field of aClass.getDeclaredFields()) {
                if (field.getName() === name) return field;
            }
            aClass = aClass.getSuperclass();
        }
        return null;
    }
    getType() {
        return this.json.get(Constants.TypeParam);
    }
}

class RestoredArray {
    constructor(json, translator) {
        this.json = json;
        this.translator = translator;
        this.elements = json.get(Constants.ElementsParam);
    }
    decode() {
        let newInstance = [];

        for (let i = 0; i < this.elements.length; i++) {
            let element = this.elements[i];
            new Decoder(new EncodedJSON(element), this.translator).decode(r=>newInstance[i] = r);
        }

        return newInstance;
    }
}

class Decoder {
    constructor(json, translator) {
        this.json = json;
        this.translator = translator;
    }
    decode(callback) {
        this.callback = callback;
        /* the value is a primative, check expected type */;
        /* expected type not found, refer to primitive type */;
        if (this.json.has(Constants.TypeParam) && this.json.get(Constants.TypeParam) === Constants.NullValue) callback(null);
        else if (this.json.has(Constants.PointerParam)) {
            if (!this.translator.hasReference(this.json.get(Constants.PointerParam))) this.translator.deferDecoding(this);
            let referredObject = this.translator.getReferredObject(this.json.get(Constants.PointerParam));
            callback(referredObject);
        } else if (this.json.has(Constants.EnumParam)) {
            let className = this.json.get(Constants.EnumParam);
            let fieldName = this.json.get(Constants.ValueParam);
            let aClass = this.translator.getClass(className);
            let result = aClass[fieldName];
            callback(result);
        } else if (this.json.has(Constants.ValueParam)) {
            callback(this.json.get(Constants.ValueParam));
        } else if (this.json.has(Constants.ElementsParam)) {
            let array = new RestoredArray(this.json, this.translator).decode();
            callback(array);
        } else if (this.json.has(Constants.FieldsParam)) {
            let object = new RestoredObject(this.json, this.translator).decode();
            callback(object);
        } else {
            console.log(this.json.toString(2));
            throw new Error("java.lang.RuntimeException");
        }
    }
    resume() {
        this.decode(this.callback);
    }
}

module.exports = Decoder;