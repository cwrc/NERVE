(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.JJJRMISocket = f()}})(function(){var define,module,exports;return (function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
Constants = {};
Constants.KeyParam = "key";
Constants.FlagParam = "flags";
Constants.TypeParam = "type";
Constants.PrimitiveParam = "primitive";
Constants.ValueParam = "value";
Constants.FieldsParam = "fields";
Constants.NameParam = "name";
Constants.ElementsParam = "elements";
Constants.PointerParam = "ptr";
Constants.TransientValue = "trans";
Constants.NullValue = "null";
Constants.EnumParam = "enum";

module.exports = Constants;
},{}],2:[function(require,module,exports){
/* global Constants, JJJRMISocket */
let Constants = require("./Constants");

class Decoder {
    constructor(json, objectMap, jjjWebsocket, deferred, classmap) {
        if (typeof json === "undefined") {
            console.log(json);
            throw new Error("undefined json object");
        }

        if (typeof json === "string") this.json = JSON.parse(json);
        else this.json = json;
        this.objectMap = objectMap;
        this.jjjWebsocket = jjjWebsocket;
        this.deferred = deferred;
        this.classmap = classmap;

        if (typeof deferred === "undefined") throw new Error("undefined deferred");
        if (typeof classmap === "undefined") throw new Error("undefined classmap");
    }
    decode(callback) {
        let result = undefined;

        if (typeof this.json[Constants.TypeParam] !== "undefined" && this.json[Constants.TypeParam] === Constants.NullValue) {
            result = null;
        } else if (typeof this.json[Constants.PointerParam] !== "undefined") {
            result = this.objectMap.get(this.json[Constants.PointerParam]);
        } else if (typeof this.json[Constants.EnumParam] !== "undefined") {
            let className = this.json[Constants.EnumParam];
            let fieldName = this.json[Constants.ValueParam];
            let aClass = this.classmap.get(className);

            if (typeof aClass === "undefined") {
                throw new Error("classname '" + className + "' not found");
            }

            result = aClass[fieldName];
        } else if (typeof this.json[Constants.ValueParam] !== "undefined") {
            result = this.json[Constants.ValueParam];
        } else if (typeof this.json[Constants.ElementsParam] !== "undefined") {
            result = new RestoredArray(this.json, this.objectMap, this.webSocket, this.deferred, this.classmap).toObject();
        } else if (typeof this.json[Constants.FieldsParam] !== "undefined") {
            result = new RestoredObject(this.json, this.objectMap, this.jjjWebsocket, this.deferred, this.classmap).toObject();
        } else {
            console.log("Unknown object type during decoding");
            console.log(this.json);
            console.log("+---------------------------------+");
            window.jjjdebug = this.json;
            throw new Error("Unknown object type during decoding; see window.jjjdebug");
        }

        if (typeof result !== "undefined") callback(result);
        else {
            this.deferred.push({
                decoder: this,
                callback: callback
            });
        }
    }
}

class RestoredArray {
    constructor(json, objectMap, webSocket, deferred, classmap) {
        this.json = json;
        this.objectMap = objectMap;
        this.webSocket = webSocket;
        this.elements = this.json[Constants.ElementsParam];
        this.deferred = deferred;

        this.restoreCount = 0;
        this.retArray = [];
        this.classmap = classmap;

        if (typeof deferred === "undefined") throw new Error("undefined deferred");
        if (typeof classmap === "undefined") throw new Error("undefined classmap");
    }
    toObject() {
        this.decodeArray();
        if (this.restoreCount === this.elements.length) return this.retArray;
        return undefined;
    }
    decodeArray() {
        for (let i = 0; i < this.elements.length; i++) {
            let decoder = new Decoder(this.elements[i], this.objectMap, this.webSocket, this.deferred, this.classmap);
            decoder.decode(function (result){
                this.retArray[i] = result;
                this.restoreCount++;
            }.bind(this));
        }
    }
    length() {
        return this.elements.length;
    }
}

class RestoredObject {
    constructor(json, objectMap, jjjWebsocket, deferred, classmap) {
        this.json = json;
        this.objectMap = objectMap;
        this.jjjWebsocket = jjjWebsocket;
        this.deferred = deferred;
        this.classmap = classmap;

        if (typeof deferred === "undefined") throw new Error("undefined deferred");
        if (typeof classmap === "undefined") throw new Error("undefined classmap");
    }
    decodeField(field, callback) {
        let decoder = new Decoder(this.json[Constants.FieldsParam][field], this.objectMap, this.jjjWebsocket, this.deferred, this.classmap);
        decoder.decode(callback);
    }
    toObject(object = null) {
        let className = this.json[Constants.TypeParam];
        let aClass = this.classmap.get(className);

        if (typeof aClass === "undefined") throw new Error(`Class ${className} not found`);
        if (object === null) object = new aClass();

        if (typeof object.constructor.__isTransient !== "function") {
            window.err = {
                className : className,
                aClass : aClass,
                object : object
            }
            throw new Error(`Field '__isTransient' of class '${object.constructor.name}' is not of type function, found type '${typeof object.constructor.__isTransient}'. (see window.err)`);
        }

        if (this.jjjWebsocket !== null && !object.constructor.__isTransient() && typeof this.json[Constants.KeyParam] !== "undefined") {
            this.objectMap.set(this.json[Constants.KeyParam], object);

            /* set websocket so object can call sever methods and vice versa - not applicable to transient objects */
            object.__jjjWebsocket = this.jjjWebsocket;
        }

        if (typeof object.__decode === "function") {
            object.__decode(this, this.objectMap, this.jjjWebsocket);
        } else {
            for (let field in this.json[Constants.FieldsParam]) {
                this.decodeField(field, (result) => object[field] = result);
            }
        }

        return object;
    }
}

module.exports = Decoder;
},{"./Constants":1}],3:[function(require,module,exports){
/* global Constants */
let Constants = require("./Constants");

class Encoder {
    constructor(object, objectMap, keys) {
        this.object = object;
        this.objectMap = objectMap;
        this.keys = keys;
    }
    encode() {
        if (typeof this.object === "undefined" || this.object === null) {
            return new EncodedNull().toJSON();
        } else if (typeof this.object === "number" || typeof this.object === "string" || typeof this.object === "boolean") {
            return new EncodedPrimitive(this.object).toJSON();
        } else if (this.objectMap.hasValue(this.object)) {
            return new EncodedReference(this.objectMap.getKey(this.object)).toJSON();
        } else if (this.object instanceof Array) {
            return new EncodedArray(this.object, this.objectMap, this.keys).toJSON();
        }

        if (typeof this.object.constructor.__isEnum === "undefined") return null;
        if (typeof this.object.constructor.__getClass === "undefined") return null;

        if (this.object.constructor.__isEnum()) {
            return new EncodedEnum(this.object, this.objectMap, this.keys).toJSON();
        } else {
            return new EncodedObject(this.object, this.objectMap, this.keys).toJSON();
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
    constructor(object, objectMap, keys) {
        this.json = {};
        this.object = object;
        this.objectMap = objectMap;
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
            parent.push(new Encoder(element, this.objectMap, this.keys).encode());
        }
    }
    toJSON() {
        return this.json;
    }
}

class EncodedEnum {
    constructor(object, objectMap, keys) {
        this.json = {};
        this.json[Constants.ValueParam] = object.toString();
        this.json[Constants.EnumParam] = object.constructor.__getClass();
    }

    toJSON() {
        return this.json;
    }
}

class EncodedObject {
    constructor(object, objectMap, keys) {
        this.json = {};
        this.object = object;
        this.objectMap = objectMap;
        this.keys = keys;

        if (typeof object.constructor.__isTransient !== "function") {
            window.object = object;
            throw new Error(`Field '__isTransient' of class '${object.constructor.name}' is not of type function, found type '${typeof object.constructor.__isTransient}'.`);
        }

        if (!object.constructor.__isTransient()) {
            let key = keys.allocNextKey();
            this.json[Constants.KeyParam] = key;
            objectMap.set(key, object);
        }

        this.json[Constants.TypeParam] = object.constructor.__getClass();
        this.json[Constants.FieldsParam] = {};

        if (typeof object.__encode === "function") {
            object.__encode(this);
        } else {
            for (let field in this.object) {
                this.setField(field, this.object[field]);
            }
        }
    }

    setField(name, value) {
        this.json[Constants.FieldsParam][name] = new Encoder(value, this.objectMap, this.keys).encode();
    }

    toJSON() {
        return this.json;
    }
}

module.exports = Encoder;
},{"./Constants":1}],4:[function(require,module,exports){
let Translator = require("./Translator");
let jjjrmi = require("./gen/jjjrmi");
let ArrayList = require("./java-equiv/ArrayList");
let HashMap = require("./java-equiv/HashMap");
Console = console;

class JJJRMISocket {
    constructor(socketName, parent) {
        this.parent = parent;
        this.jjjSocketName = socketName;
        this.translator = new Translator(this, JJJRMISocket.classes);
        this.callback = {};
        this.flags = Object.assign(JJJRMISocket.flags);
    }
    async connect(url) {
        if (this.flags.CONNECT) console.log(`${this.jjjSocketName} connecting`);
        if (!url) url = this.getAddress();

        let cb = function (resolve, reject) {
            this.socket = new WebSocket(url);
            this.onready = resolve;
            this.onreject = reject;
            this.socket.onerror = (err) => {
                console.error("websocket error");
                console.error(err);
                reject(err);
            };
            this.socket.onmessage = (evt) => this.onMessage(evt);
            this.nextUID = 0;
            this.callback = {};
        }.bind(this);

        return new Promise(cb);
    }

    getAddress(){
        let prequel = "ws://";
        if (window.location.protocol === "https:") prequel = "wss://";
        let pathname = window.location.pathname.substr(1);
        pathname = pathname.substr(0, pathname.indexOf("/"));
        return `${prequel}${window.location.host}/${pathname}/${this.jjjSocketName}`;
    }

    /**
     * Send a method request to the server.
     * callbacks.
     * @param {type} src
     * @param {type} methodName
     * @param {type} args
     * @returns {undefined}
     */
    methodRequest(src, methodName, args) {
        if (!this.translator.hasObject(src)){
            console.warn("see window.debug for source");
            window.debug = src;
            throw new Error(`Attempting to call server side method on non-received object: ${src.constructor.name}.${methodName}`);
        }
        let uid = this.nextUID++;
        let ptr = this.translator.getKey(src);

        let argsArray = [];
        for (let i in args) argsArray.push(args[i]);

        let f = function (resolve, reject) {
            this.callback[uid] = {
                resolve: resolve,
                reject: reject
            };
            let packet = new MethodRequest(uid, ptr, methodName, argsArray);
            let encodedPacket = this.translator.encode(packet);
            if (this.flags.SENT) console.log(encodedPacket);
            let encodedString = JSON.stringify(encodedPacket, null, 4);
            this.socket.send(encodedString);
        }.bind(this);

        return new Promise(f);
    }
    /**
     * All received messages are parsed by this method.  All messages must of the java type 'RMIResponse' which will
     * always contain the field 'type:RMIResponseType'.
     * @param {type} evt
     * @returns {undefined}
     */
    onMessage(evt) {
        let rmiMessage = this.translator.decode(evt.data);
        if (this.flags.RECEIVED && this.flags.VERBOSE){
            let json = JSON.parse(evt.data);
            console.log(JSON.stringify(json, null, 2));
        }
        if (this.flags.RECEIVED) console.log(rmiMessage);

        switch (rmiMessage.type) {
            case jjjrmi.RMIMessageType.FORGET:{
                if (this.flags.CONNECT) console.log(this.jjjSocketName + " FORGET");
                if (this.flags.ONMESSAGE) console.log(this.jjjSocketName + " FORGET");
                this.translator.removeKey(rmiMessage.key);
                break;
            }
            case jjjrmi.RMIMessageType.LOAD:{
                if (this.flags.CONNECT) console.log(this.jjjSocketName + " LOAD");
                if (this.flags.ONMESSAGE) console.log(this.jjjSocketName + " LOAD");
                this.copyFields(rmiMessage.source, this.parent);
                this.translator.swap(this.parent, rmiMessage.source);
                break;
            }
            case jjjrmi.RMIMessageType.READY:{
                if (this.flags.CONNECT || this.flags.ONMESSAGE) console.log(this.jjjSocketName + " READY");
                this.onready();
                break;
            }
            /* client originated request */
            case jjjrmi.RMIMessageType.LOCAL:{
                if (this.flags.ONMESSAGE) console.log(`Response to client side request: ${this.jjjSocketName} ${rmiMessage.methodName}`);
                let callback = this.callback[rmiMessage.uid];
                delete(this.callback[rmiMessage.uid]);
                callback.resolve(rmiMessage.rvalue);
                break;
            }
            /* server originated request */
            case jjjrmi.RMIMessageType.REMOTE:{
                let target = this.translator.getObject(rmiMessage.ptr);
                let r = this.remoteMethodCallback(target, rmiMessage.methodName, rmiMessage.args);
                let response = new InvocationResponse(rmiMessage.uid, InvocationResponseCode.SUCCESS);
                let encodedResponse = this.translator.encode(response);
                let encodedString = JSON.stringify(encodedResponse, null, 4);

                if (this.flags.ONMESSAGE) console.log(`Server side request: ${this.jjjSocketName} ${target.constructor.name}.${rmiMessage.methodName}`);
                this.socket.send(encodedString);
                break;
            }
            case jjjrmi.RMIMessageType.EXCEPTION:{
                if (!this.flags.SILENT) console.log(this.jjjSocketName + " EXCEPTION " + rmiMessage.methodName);
                if (!this.flags.SILENT) console.warn(rmiMessage);
                let callback = this.callback[rmiMessage.uid];
                delete(this.callback[rmiMessage.uid]);
                callback.reject(rmiMessage);
                break;
            }
            case jjjrmi.RMIMessageType.REJECTED_CONNECTION:{
                if (this.flags.CONNECT || this.flags.ONMESSAGE) console.log(this.jjjSocketName + " REJECTED_CONNECTION");
                this.onreject();
                break;
            }
        }
    }

    copyFields(source, target){
        for (let field in source){
            if (!field.startsWith("__")){
                target[field] = source[field];
            }
        }
    }

    /**
     * Handles a server originated request.  Will throw a warning if the client does not have a method to handle the
     * request.
     * @param {type} target
     * @param {type} methodName
     * @param {type} args
     * @returns {undefined}
     */
    remoteMethodCallback(target, methodName, args) {
        if (typeof target[methodName] !== "function") {
            if (!JJJRMISocket.silent) console.warn(this.socket.url + ":" + target.constructor.name + " does not have remotely invokable method '" + methodName + "'.");
        } else {
            return target[methodName].apply(target, args);
        }
    }
};

JJJRMISocket.flags = {
        SILENT: false,
        CONNECT: false,
        ONMESSAGE: false, /* show that a server object has been received and an action may be taken */
        SENT: false,
        RECEIVED: false, /* show the received server object, verbose shows the text as well */
        VERBOSE: false,
        ONREGISTER: true /* report classes as they are registered */
};

JJJRMISocket.classes = new Map();

JJJRMISocket.registerClass = function(aClass){
    if (typeof aClass !== "function") throw new Error(`paramater aClass of type ${typeof aClass.__getClass}`);
    if (typeof aClass.__getClass !== "function") throw new Error(`in Class ${aClass.constructor.name} method __getClass of type ${typeof aClass.__getClass}`);
    if (JJJRMISocket.flags.ONREGISTER) console.log(`Register ${aClass.__getClass()}`);
    JJJRMISocket.classes.set(aClass.__getClass(), aClass);
};

/* for registering all classes returned from generated JS */
JJJRMISocket.registerPackage = function(package){
    for (let aClass in package) JJJRMISocket.registerClass(package[aClass]);
};

/* register the classes required for JJJRMISocket */
JJJRMISocket.registerPackage(jjjrmi);
JJJRMISocket.registerClass(ArrayList);
JJJRMISocket.registerClass(HashMap);

jjjrmisocket = {};
jjjrmisocket.JJJRMISocket = JJJRMISocket;
jjjrmisocket.Translator = Translator;
jjjrmisocket.ArrayList = ArrayList;
jjjrmisocket.HashMap = HashMap;
module.exports = jjjrmisocket;
},{"./Translator":5,"./gen/jjjrmi":6,"./java-equiv/ArrayList":7,"./java-equiv/HashMap":8}],5:[function(require,module,exports){
let Encoder = require("./Encoder");
let Decoder = require("./Decoder");

class BiMap{
    constructor(){
        this.objectMap = new Map();
        this.reverseMap = new Map();
    }

    removeByKey(key){
        let obj = this.objectMap.get(key);
        this.objectMap.delete(key);
        this.reverseMap.delete(obj);
    }

    removeByValue(obj){
        let key = this.reverseMap.get(key);
        this.objectMap.delete(key);
        this.reverseMap.delete(obj);
    }

    get(key){
        return this.objectMap.get(key);
    }

    set(key, value){
        this.objectMap.set(key, value);
        this.reverseMap.set(value, key);
    }

    getKey(value){
        return this.reverseMap.get(value);
    }

    has(key){
        return this.objectMap.has(key);
    }

    hasValue(value){
        return this.reverseMap.has(value);
    }

    /* remove target freom the translator replacing it with source, maintaining the same key */
    swap(source, target){
        let key = this.getKey(target);
        this.objectMap.set(key, source);
        this.reverseMap.delete(target);
        this.reverseMap.set(source, key);
    }
}

class Translator{
    constructor(jjjWebsocket, classmap){
        this.objectMap = new BiMap();
        this.next = -1;
        this.jjjWebsocket = jjjWebsocket;
        this.deferred = [];
        this.classmap = classmap;

        if (typeof classmap === "undefined") throw new Error("undefined classmap");
    }

    clear(){
    }

    removeObject(obj){
        this.objectMap.removeByValue(obj);
    }

    removeKey(key){
        this.objectMap.removeByKey(key);
    }

    encode(object){
        return new Encoder(object, this.objectMap, this).encode();
    }

    decode(jsonObject){
        let result = undefined;
        new Decoder(jsonObject, this.objectMap, this.jjjWebsocket, this.deferred, this.classmap).decode((r)=>result = r);

        while (this.deferred.length > 0){
            let defItem = this.deferred.shift();
            defItem.decoder.decode(defItem.callback);
        }

        return result;
    }

    hasObject(obj){
        return this.objectMap.hasValue(obj);
    }

    getObject(key){
        return this.objectMap.get(key);
    }

    getKey(obj){
        return this.objectMap.getKey(obj);
    }

    allocNextKey(){
        this.next++;
        return "C" + this.next;
    }

    /* remove target form he translator replacing it with source, maintaining the same key */
    swap(source, target){
        this.objectMap.swap(source, target);
    }
}

module.exports = Translator;
},{"./Decoder":2,"./Encoder":3}],6:[function(require,module,exports){
let jjjrmi = {};

ServerSideExceptionMessage = class ServerSideExceptionMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.ServerSideExceptionMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.ServerSideExceptionMessage = ServerSideExceptionMessage;
ServerResponseMessage = class ServerResponseMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.ServerResponseMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.ServerResponseMessage = ServerResponseMessage;
RejectedConnectionMessage = class RejectedConnectionMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.RejectedConnectionMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.RejectedConnectionMessage = RejectedConnectionMessage;
ReadyMessage = class ReadyMessage {
	constructor() {
	}
    foo(){console.log("FOO");}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.ReadyMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.ReadyMessage = ReadyMessage;
RMIMessageType = class RMIMessageType {
	constructor(value) {
		this.__value = value;
	}
	toString() {
		return this.__value;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.RMIMessageType";
	}
	static __isEnum() {
		return true;
	}
};
RMIMessageType.valueArray = [];
RMIMessageType.valueArray.push(RMIMessageType.LOCAL = new RMIMessageType("LOCAL"));
RMIMessageType.valueArray.push(RMIMessageType.REMOTE = new RMIMessageType("REMOTE"));
RMIMessageType.valueArray.push(RMIMessageType.READY = new RMIMessageType("READY"));
RMIMessageType.valueArray.push(RMIMessageType.LOAD = new RMIMessageType("LOAD"));
RMIMessageType.valueArray.push(RMIMessageType.EXCEPTION = new RMIMessageType("EXCEPTION"));
RMIMessageType.valueArray.push(RMIMessageType.FORGET = new RMIMessageType("FORGET"));
RMIMessageType.valueArray.push(RMIMessageType.REJECTED_CONNECTION = new RMIMessageType("REJECTED_CONNECTION"));
RMIMessageType.values = function(){return RMIMessageType.valueArray;};
jjjrmi.RMIMessageType = RMIMessageType;
RMIMessage = class RMIMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.RMIMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.RMIMessage = RMIMessage;
MethodResponse = class MethodResponse {
	constructor(uid, objectPTR, methodName, rvalue) {
		this.uid = uid;
		this.methodName = methodName;
		this.rvalue = rvalue;
		this.objectPTR = objectPTR;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.MethodResponse";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.MethodResponse = MethodResponse;
MethodRequest = class MethodRequest {
	constructor(uid, ptr, methodName, args) {
		this.uid = uid;
		this.objectPTR = ptr;
		this.methodName = methodName;
		this.methodArguments = args;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.MethodRequest";
	}
	static __isEnum() {
		return false;
	}
	update(parameters) {
		for(let i = 0; i < parameters.length; i++){
			let parameter = parameters[i];
			if (this.methodArguments[i] === null)continue;

			if (parameter.getType().isArray()){
				let argument = this.methodArguments[i];
				let newInstance = Array.newInstance(parameter.getType().getComponentType(), argument.length);
				for(let j = 0; j < argument.length; j++)Array.set(newInstance, j, argument[j]);

				this.methodArguments[i] = newInstance;
				return ;
			}
			switch (parameter.getType().getCanonicalName()){
				case "java.lang.String": break;

				case "boolean": ;
				case "java.lang.Boolean": break;

				case "byte": ;
				case "java.lang.Byte": {
					this.methodArguments[i] = Byte.parseByte(this.methodArguments[i].toString());
					break;
				}
				case "char": ;
				case "java.lang.Character": {
					this.methodArguments[i] = this.methodArguments[i].toString().charAt(0);
					break;
				}
				case "short": ;
				case "java.lang.Short": {
					this.methodArguments[i] = Short.parseShort(this.methodArguments[i].toString());
					break;
				}
				case "long": ;
				case "java.lang.Long": {
					this.methodArguments[i] = Long.parseLong(this.methodArguments[i].toString());
					break;
				}
				case "float": ;
				case "java.lang.Float": {
					this.methodArguments[i] = Float.parseFloat(this.methodArguments[i].toString());
					break;
				}
				case "double": ;
				case "java.lang.Double": {
					this.methodArguments[i] = Double.parseDouble(this.methodArguments[i].toString());
					break;
				}
				case "int": ;
				case "java.lang.Integer": break;

			}
		}
	}
};
jjjrmi.MethodRequest = MethodRequest;
LoadMessage = class LoadMessage {
	constructor() {

	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.LoadMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.LoadMessage = LoadMessage;
InvocationResponseCode = class InvocationResponseCode {
	constructor(value) {
		this.__value = value;
	}
	toString() {
		return this.__value;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.InvocationResponseCode";
	}
	static __isEnum() {
		return true;
	}
};
InvocationResponseCode.valueArray = [];
InvocationResponseCode.valueArray.push(InvocationResponseCode.FAILED = new InvocationResponseCode("FAILED"));
InvocationResponseCode.valueArray.push(InvocationResponseCode.SUCCESS = new InvocationResponseCode("SUCCESS"));
InvocationResponseCode.values = function(){return InvocationResponseCode.valueArray;};
jjjrmi.InvocationResponseCode = InvocationResponseCode;
InvocationResponse = class InvocationResponse {
	constructor(uid, code) {
		this.uid = uid;
		this.code = code;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.InvocationResponse";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.InvocationResponse = InvocationResponse;
ForgetMessage = class ForgetMessage {
	constructor() {

	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.ForgetMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.ForgetMessage = ForgetMessage;
ClientRequestMessage = class ClientRequestMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.ClientRequestMessage";
	}
	static __isEnum() {
		return false;
	}
};
jjjrmi.ClientRequestMessage = ClientRequestMessage;
ClientMessageType = class ClientMessageType {
	constructor(value) {
		this.__value = value;
	}
	toString() {
		return this.__value;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.ClientMessageType";
	}
	static __isEnum() {
		return true;
	}
};
ClientMessageType.valueArray = [];
ClientMessageType.valueArray.push(ClientMessageType.METHOD_REQUEST = new ClientMessageType("METHOD_REQUEST"));
ClientMessageType.valueArray.push(ClientMessageType.INVOCATION_RESPONSE = new ClientMessageType("INVOCATION_RESPONSE"));
ClientMessageType.values = function(){return ClientMessageType.valueArray;};
jjjrmi.ClientMessageType = ClientMessageType;
ClientMessage = class ClientMessage {
	constructor(type) {
		this.type = type;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.socket.message.ClientMessage";
	}
	static __isEnum() {
		return false;
	}
	getType() {
		return this.type;
	}
};
jjjrmi.ClientMessage = ClientMessage;

if (typeof module !== "undefined") module.exports = jjjrmi;
},{}],7:[function(require,module,exports){
/* global Symbol */

ArrayList = class ArrayList {
    constructor() {
        this.elementData = [];
    }
    static __isTransient() {
        return true;
    }
    static __getClass() {
        return "java.util.ArrayList";
    }
    static __isEnum() {
        return false;
    }
    addAll(c) {
        if (typeof c === "number") throw new Error("unsupported java to js operation");
        for (let e of c) this.add(e);
    }
    isEmpty() {
        return this.size === 0;
    }
    removeAll(c) {
        for (let e of c){
            this.remove(e);
        }
    }
    retainAll(c) {
        let newElementData = [];
        for (let e of c){
            if (this.contains(e)) newElementData.add(e);
        }
        this.elementData = newElementData;
    }
    size() {
        return this.elementData.length;
    }
    clone() {
        let that = new ArrayList();
        for (let e of this) {
            that.add(e);
        }
        return that;
    }
    get(index) {
        return this.elementData[index];
    }
    set(index, element) {
        let old = this.elementData[index];
        this.elementData[index] = element;
        return old;
    }
    toArray(a = []) {
        for (let i = 0; i < this.elementData.length; i++) a[i] = this.elementData[i];
        return a;
    }
    iterator() {
        throw new Error("unsupported java to js operation");
    }
    subList(fromIndex, toIndex) {
        throw new Error("unsupported java to js operation");
    }
    listIterator() {
        throw new Error("unsupported java to js operation");
    }
    listIterator(index) {
        throw new Error("unsupported java to js operation");
    }
    add(index, element) {
        this.splice(index, 0, element);
    }
    add(e) {
        this.elementData.push(e);
        return true;
    }
    clear() {
        this.elementData = [];
    }
    contains(o) {
        return this.elementData.indexOf(o) !== -1;
    }
    indexOf(o) {
        return this.elementData.indexOf(o);
    }
    [Symbol.iterator] () {
        return this.elementData[Symbol.iterator]();
    }
    lastIndexOf(o) {
        return this.elementData.lastIndexOf(o);
    }
    remove(index) {
        let r = this.elementData.splice(index, 1);
        return r[0];
    }
    remove(o) {
        let r = this.elementData.splice(this.indexOf(o), 1);
        return r[0];
    }
    removeRange(fromIndex, toIndex) {
        this.elementData.splice(fromIndex, toIndex - fromIndex);
    }
};

if (typeof module !== "undefined") module.exports = ArrayList;
},{}],8:[function(require,module,exports){
/* global Symbol */

HashMap = class HashMap {
    constructor() {
        this.map = new Map();
    }
    static __isTransient() {
        return true;
    }
    static __getClass() {
        return "java.util.HashMap";
    }
    static __isEnum() {
        return false;
    }
    /**
     * Returns the number of key-value mappings in this map.
     *
     * @return the number of key-value mappings in this map
     */
    size() {
        return this.map.size;
    }
    /**
     * Returns <tt>true</tt> if this map contains no key-value mappings.
     *
     * @return <tt>true</tt> if this map contains no key-value mappings
     */
    isEmpty() {
        return this.map.size === 0;
    }
    /**
     * Returns the value to which the specified key is mapped,
     * or {@code null} if this map contains no mapping for the key.
     *
     * <p>More formally, if this map contains a mapping from a key
     * {@code k} to a value {@code v} such that {@code (key==null ? k==null :
     * key.equals(k))}, then this method returns {@code v}; otherwise
     * it returns {@code null}.  (There can be at most one such mapping.)
     *
     * <p>A return value of {@code null} does not <i>necessarily</i>
     * indicate that the map contains no mapping for the key; it's also
     * possible that the map explicitly maps the key to {@code null}.
     * The {@link #containsKey containsKey} operation may be used to
     * distinguish these two cases.
     *
     * @see #put(Object, Object)
     */
    get(key) {
        return this.map.get(key);
    }
    /**
     * Returns <tt>true</tt> if this map contains a mapping for the
     * specified key.
     *
     * @param   key   The key whose presence in this map is to be tested
     * @return <tt>true</tt> if this map contains a mapping for the specified
     * key.
     */
    containsKey(key) {
        return this.map.has(key);
    }
    /**
     * Associates the specified value with the specified key in this map.
     * If the map previously contained a mapping for the key, the old
     * value is replaced.
     *
     * @param key key with which the specified value is to be associated
     * @param value value to be associated with the specified key
     * @return the previous value associated with <tt>key</tt>, or
     *         <tt>null</tt> if there was no mapping for <tt>key</tt>.
     *         (A <tt>null</tt> return can also indicate that the map
     *         previously associated <tt>null</tt> with <tt>key</tt>.)
     */
    put(key, value) {
        let r = this.get(key);
        this.map.set(key, value);
        return r;
    }
    /**
     * Copies all of the mappings from the specified map to this map.
     * These mappings will replace any mappings that this map had for
     * any of the keys currently in the specified map.
     *
     * @param m mappings to be stored in this map
     * @throws NullPointerException if the specified map is null
     */
    putAll(that) {

    }
    /**
     * Removes the mapping for the specified key from this map if present.
     *
     * @param  key key whose mapping is to be removed from the map
     * @return the previous value associated with <tt>key</tt>, or
     *         <tt>null</tt> if there was no mapping for <tt>key</tt>.
     *         (A <tt>null</tt> return can also indicate that the map
     *         previously associated <tt>null</tt> with <tt>key</tt>.)
     */
    remove(key) {
        let r = this.get(key);
        this.map.delete(key);
        return r;
    }
    /**
     * Removes all of the mappings from this map.
     * The map will be empty after this call returns.
     */
    clear() {
        this.map.clear();
    }
    /**
     * Returns <tt>true</tt> if this map maps one or more keys to the
     * specified value.
     *
     * @param value value whose presence in this map is to be tested
     * @return <tt>true</tt> if this map maps one or more keys to the
     *         specified value
     */
    containsValue(value) {
        for (let v of this.map.values()) {
            if (v === value) return true;
        }
        return false;
    }
    /**
     * Returns a {@link Set} view of the keys contained in this map.
     * The set is backed by the map, so changes to the map are
     * reflected in the set, and vice-versa.  If the map is modified
     * while an iteration over the set is in progress (except through
     * the iterator's own <tt>remove</tt> operation), the results of
     * the iteration are undefined.  The set supports element removal,
     * which removes the corresponding mapping from the map, via the
     * <tt>Iterator.remove</tt>, <tt>Set.remove</tt>,
     * <tt>removeAll</tt>, <tt>retainAll</tt>, and <tt>clear</tt>
     * operations.  It does not support the <tt>add</tt> or <tt>addAll</tt>
     * operations.
     */
    keySet() {
        return this.map.keys();
    }
    /**
     * Returns a {@link Collection} view of the values contained in this map.
     * The collection is backed by the map, so changes to the map are
     * reflected in the collection, and vice-versa.  If the map is
     * modified while an iteration over the collection is in progress
     * (except through the iterator's own <tt>remove</tt> operation),
     * the results of the iteration are undefined.  The collection
     * supports element removal, which removes the corresponding
     * mapping from the map, via the <tt>Iterator.remove</tt>,
     * <tt>Collection.remove</tt>, <tt>removeAll</tt>,
     * <tt>retainAll</tt> and <tt>clear</tt> operations.  It does not
     * support the <tt>add</tt> or <tt>addAll</tt> operations.
     */
    values() {
        return this.map.values();
    }

    __decode(resObj) {
        let keys = null;
        let values = null;

        let cb1 = function (r) {
            keys = r;
            resObj.decodeField("values", cb2);
        };

        let cb2 = function (r) {
            values = r;
            for (let i = 0; i < keys.length; i++) {
                this.put(keys[i], values[i]);
            }
        }.bind(this);

        resObj.decodeField("keys", cb1);
    }

    __encode(encodedObject) {
        let keys = [];
        let values = [];

        this.map.forEach((value, key)=>{
            keys.push(key);
            values.push(value);
        });

        encodedObject.setField("keys", keys);
        encodedObject.setField("values", values);
    }
};


if (typeof module !== "undefined") module.exports = HashMap;
},{}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyZC9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwid2ViL3NyYy9Db25zdGFudHMuanMiLCJ3ZWIvc3JjL0RlY29kZXIuanMiLCJ3ZWIvc3JjL0VuY29kZXIuanMiLCJ3ZWIvc3JjL1NvY2tldC5qcyIsIndlYi9zcmMvVHJhbnNsYXRvci5qcyIsIndlYi9zcmMvZ2VuL2pqanJtaS5qcyIsIndlYi9zcmMvamF2YS1lcXVpdi9BcnJheUxpc3QuanMiLCJ3ZWIvc3JjL2phdmEtZXF1aXYvSGFzaE1hcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJDb25zdGFudHMgPSB7fTtcbkNvbnN0YW50cy5LZXlQYXJhbSA9IFwia2V5XCI7XG5Db25zdGFudHMuRmxhZ1BhcmFtID0gXCJmbGFnc1wiO1xuQ29uc3RhbnRzLlR5cGVQYXJhbSA9IFwidHlwZVwiO1xuQ29uc3RhbnRzLlByaW1pdGl2ZVBhcmFtID0gXCJwcmltaXRpdmVcIjtcbkNvbnN0YW50cy5WYWx1ZVBhcmFtID0gXCJ2YWx1ZVwiO1xuQ29uc3RhbnRzLkZpZWxkc1BhcmFtID0gXCJmaWVsZHNcIjtcbkNvbnN0YW50cy5OYW1lUGFyYW0gPSBcIm5hbWVcIjtcbkNvbnN0YW50cy5FbGVtZW50c1BhcmFtID0gXCJlbGVtZW50c1wiO1xuQ29uc3RhbnRzLlBvaW50ZXJQYXJhbSA9IFwicHRyXCI7XG5Db25zdGFudHMuVHJhbnNpZW50VmFsdWUgPSBcInRyYW5zXCI7XG5Db25zdGFudHMuTnVsbFZhbHVlID0gXCJudWxsXCI7XG5Db25zdGFudHMuRW51bVBhcmFtID0gXCJlbnVtXCI7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29uc3RhbnRzOyIsIi8qIGdsb2JhbCBDb25zdGFudHMsIEpKSlJNSVNvY2tldCAqL1xubGV0IENvbnN0YW50cyA9IHJlcXVpcmUoXCIuL0NvbnN0YW50c1wiKTtcblxuY2xhc3MgRGVjb2RlciB7XG4gICAgY29uc3RydWN0b3IoanNvbiwgb2JqZWN0TWFwLCBqampXZWJzb2NrZXQsIGRlZmVycmVkLCBjbGFzc21hcCkge1xuICAgICAgICBpZiAodHlwZW9mIGpzb24gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGpzb24pO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5kZWZpbmVkIGpzb24gb2JqZWN0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBqc29uID09PSBcInN0cmluZ1wiKSB0aGlzLmpzb24gPSBKU09OLnBhcnNlKGpzb24pO1xuICAgICAgICBlbHNlIHRoaXMuanNvbiA9IGpzb247XG4gICAgICAgIHRoaXMub2JqZWN0TWFwID0gb2JqZWN0TWFwO1xuICAgICAgICB0aGlzLmpqaldlYnNvY2tldCA9IGpqaldlYnNvY2tldDtcbiAgICAgICAgdGhpcy5kZWZlcnJlZCA9IGRlZmVycmVkO1xuICAgICAgICB0aGlzLmNsYXNzbWFwID0gY2xhc3NtYXA7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBkZWZlcnJlZCA9PT0gXCJ1bmRlZmluZWRcIikgdGhyb3cgbmV3IEVycm9yKFwidW5kZWZpbmVkIGRlZmVycmVkXCIpO1xuICAgICAgICBpZiAodHlwZW9mIGNsYXNzbWFwID09PSBcInVuZGVmaW5lZFwiKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmRlZmluZWQgY2xhc3NtYXBcIik7XG4gICAgfVxuICAgIGRlY29kZShjYWxsYmFjaykge1xuICAgICAgICBsZXQgcmVzdWx0ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5qc29uW0NvbnN0YW50cy5UeXBlUGFyYW1dICE9PSBcInVuZGVmaW5lZFwiICYmIHRoaXMuanNvbltDb25zdGFudHMuVHlwZVBhcmFtXSA9PT0gQ29uc3RhbnRzLk51bGxWYWx1ZSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5qc29uW0NvbnN0YW50cy5Qb2ludGVyUGFyYW1dICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLm9iamVjdE1hcC5nZXQodGhpcy5qc29uW0NvbnN0YW50cy5Qb2ludGVyUGFyYW1dKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5qc29uW0NvbnN0YW50cy5FbnVtUGFyYW1dICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBsZXQgY2xhc3NOYW1lID0gdGhpcy5qc29uW0NvbnN0YW50cy5FbnVtUGFyYW1dO1xuICAgICAgICAgICAgbGV0IGZpZWxkTmFtZSA9IHRoaXMuanNvbltDb25zdGFudHMuVmFsdWVQYXJhbV07XG4gICAgICAgICAgICBsZXQgYUNsYXNzID0gdGhpcy5jbGFzc21hcC5nZXQoY2xhc3NOYW1lKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBhQ2xhc3MgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjbGFzc25hbWUgJ1wiICsgY2xhc3NOYW1lICsgXCInIG5vdCBmb3VuZFwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzdWx0ID0gYUNsYXNzW2ZpZWxkTmFtZV07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuanNvbltDb25zdGFudHMuVmFsdWVQYXJhbV0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuanNvbltDb25zdGFudHMuVmFsdWVQYXJhbV07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuanNvbltDb25zdGFudHMuRWxlbWVudHNQYXJhbV0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN0b3JlZEFycmF5KHRoaXMuanNvbiwgdGhpcy5vYmplY3RNYXAsIHRoaXMud2ViU29ja2V0LCB0aGlzLmRlZmVycmVkLCB0aGlzLmNsYXNzbWFwKS50b09iamVjdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLmpzb25bQ29uc3RhbnRzLkZpZWxkc1BhcmFtXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3RvcmVkT2JqZWN0KHRoaXMuanNvbiwgdGhpcy5vYmplY3RNYXAsIHRoaXMuampqV2Vic29ja2V0LCB0aGlzLmRlZmVycmVkLCB0aGlzLmNsYXNzbWFwKS50b09iamVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbmtub3duIG9iamVjdCB0eXBlIGR1cmluZyBkZWNvZGluZ1wiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuanNvbik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIistLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXCIpO1xuICAgICAgICAgICAgd2luZG93LmpqamRlYnVnID0gdGhpcy5qc29uO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBvYmplY3QgdHlwZSBkdXJpbmcgZGVjb2Rpbmc7IHNlZSB3aW5kb3cuampqZGVidWdcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gXCJ1bmRlZmluZWRcIikgY2FsbGJhY2socmVzdWx0KTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlZmVycmVkLnB1c2goe1xuICAgICAgICAgICAgICAgIGRlY29kZXI6IHRoaXMsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgUmVzdG9yZWRBcnJheSB7XG4gICAgY29uc3RydWN0b3IoanNvbiwgb2JqZWN0TWFwLCB3ZWJTb2NrZXQsIGRlZmVycmVkLCBjbGFzc21hcCkge1xuICAgICAgICB0aGlzLmpzb24gPSBqc29uO1xuICAgICAgICB0aGlzLm9iamVjdE1hcCA9IG9iamVjdE1hcDtcbiAgICAgICAgdGhpcy53ZWJTb2NrZXQgPSB3ZWJTb2NrZXQ7XG4gICAgICAgIHRoaXMuZWxlbWVudHMgPSB0aGlzLmpzb25bQ29uc3RhbnRzLkVsZW1lbnRzUGFyYW1dO1xuICAgICAgICB0aGlzLmRlZmVycmVkID0gZGVmZXJyZWQ7XG5cbiAgICAgICAgdGhpcy5yZXN0b3JlQ291bnQgPSAwO1xuICAgICAgICB0aGlzLnJldEFycmF5ID0gW107XG4gICAgICAgIHRoaXMuY2xhc3NtYXAgPSBjbGFzc21hcDtcblxuICAgICAgICBpZiAodHlwZW9mIGRlZmVycmVkID09PSBcInVuZGVmaW5lZFwiKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmRlZmluZWQgZGVmZXJyZWRcIik7XG4gICAgICAgIGlmICh0eXBlb2YgY2xhc3NtYXAgPT09IFwidW5kZWZpbmVkXCIpIHRocm93IG5ldyBFcnJvcihcInVuZGVmaW5lZCBjbGFzc21hcFwiKTtcbiAgICB9XG4gICAgdG9PYmplY3QoKSB7XG4gICAgICAgIHRoaXMuZGVjb2RlQXJyYXkoKTtcbiAgICAgICAgaWYgKHRoaXMucmVzdG9yZUNvdW50ID09PSB0aGlzLmVsZW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMucmV0QXJyYXk7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGRlY29kZUFycmF5KCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBkZWNvZGVyID0gbmV3IERlY29kZXIodGhpcy5lbGVtZW50c1tpXSwgdGhpcy5vYmplY3RNYXAsIHRoaXMud2ViU29ja2V0LCB0aGlzLmRlZmVycmVkLCB0aGlzLmNsYXNzbWFwKTtcbiAgICAgICAgICAgIGRlY29kZXIuZGVjb2RlKGZ1bmN0aW9uIChyZXN1bHQpe1xuICAgICAgICAgICAgICAgIHRoaXMucmV0QXJyYXlbaV0gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN0b3JlQ291bnQrKztcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbGVuZ3RoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50cy5sZW5ndGg7XG4gICAgfVxufVxuXG5jbGFzcyBSZXN0b3JlZE9iamVjdCB7XG4gICAgY29uc3RydWN0b3IoanNvbiwgb2JqZWN0TWFwLCBqampXZWJzb2NrZXQsIGRlZmVycmVkLCBjbGFzc21hcCkge1xuICAgICAgICB0aGlzLmpzb24gPSBqc29uO1xuICAgICAgICB0aGlzLm9iamVjdE1hcCA9IG9iamVjdE1hcDtcbiAgICAgICAgdGhpcy5qampXZWJzb2NrZXQgPSBqampXZWJzb2NrZXQ7XG4gICAgICAgIHRoaXMuZGVmZXJyZWQgPSBkZWZlcnJlZDtcbiAgICAgICAgdGhpcy5jbGFzc21hcCA9IGNsYXNzbWFwO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZGVmZXJyZWQgPT09IFwidW5kZWZpbmVkXCIpIHRocm93IG5ldyBFcnJvcihcInVuZGVmaW5lZCBkZWZlcnJlZFwiKTtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGFzc21hcCA9PT0gXCJ1bmRlZmluZWRcIikgdGhyb3cgbmV3IEVycm9yKFwidW5kZWZpbmVkIGNsYXNzbWFwXCIpO1xuICAgIH1cbiAgICBkZWNvZGVGaWVsZChmaWVsZCwgY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IGRlY29kZXIgPSBuZXcgRGVjb2Rlcih0aGlzLmpzb25bQ29uc3RhbnRzLkZpZWxkc1BhcmFtXVtmaWVsZF0sIHRoaXMub2JqZWN0TWFwLCB0aGlzLmpqaldlYnNvY2tldCwgdGhpcy5kZWZlcnJlZCwgdGhpcy5jbGFzc21hcCk7XG4gICAgICAgIGRlY29kZXIuZGVjb2RlKGNhbGxiYWNrKTtcbiAgICB9XG4gICAgdG9PYmplY3Qob2JqZWN0ID0gbnVsbCkge1xuICAgICAgICBsZXQgY2xhc3NOYW1lID0gdGhpcy5qc29uW0NvbnN0YW50cy5UeXBlUGFyYW1dO1xuICAgICAgICBsZXQgYUNsYXNzID0gdGhpcy5jbGFzc21hcC5nZXQoY2xhc3NOYW1lKTtcblxuICAgICAgICBpZiAodHlwZW9mIGFDbGFzcyA9PT0gXCJ1bmRlZmluZWRcIikgdGhyb3cgbmV3IEVycm9yKGBDbGFzcyAke2NsYXNzTmFtZX0gbm90IGZvdW5kYCk7XG4gICAgICAgIGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IG5ldyBhQ2xhc3MoKTtcblxuICAgICAgICBpZiAodHlwZW9mIG9iamVjdC5jb25zdHJ1Y3Rvci5fX2lzVHJhbnNpZW50ICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHdpbmRvdy5lcnIgPSB7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lIDogY2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgIGFDbGFzcyA6IGFDbGFzcyxcbiAgICAgICAgICAgICAgICBvYmplY3QgOiBvYmplY3RcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmllbGQgJ19faXNUcmFuc2llbnQnIG9mIGNsYXNzICcke29iamVjdC5jb25zdHJ1Y3Rvci5uYW1lfScgaXMgbm90IG9mIHR5cGUgZnVuY3Rpb24sIGZvdW5kIHR5cGUgJyR7dHlwZW9mIG9iamVjdC5jb25zdHJ1Y3Rvci5fX2lzVHJhbnNpZW50fScuIChzZWUgd2luZG93LmVycilgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmpqaldlYnNvY2tldCAhPT0gbnVsbCAmJiAhb2JqZWN0LmNvbnN0cnVjdG9yLl9faXNUcmFuc2llbnQoKSAmJiB0eXBlb2YgdGhpcy5qc29uW0NvbnN0YW50cy5LZXlQYXJhbV0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHRoaXMub2JqZWN0TWFwLnNldCh0aGlzLmpzb25bQ29uc3RhbnRzLktleVBhcmFtXSwgb2JqZWN0KTtcblxuICAgICAgICAgICAgLyogc2V0IHdlYnNvY2tldCBzbyBvYmplY3QgY2FuIGNhbGwgc2V2ZXIgbWV0aG9kcyBhbmQgdmljZSB2ZXJzYSAtIG5vdCBhcHBsaWNhYmxlIHRvIHRyYW5zaWVudCBvYmplY3RzICovXG4gICAgICAgICAgICBvYmplY3QuX19qampXZWJzb2NrZXQgPSB0aGlzLmpqaldlYnNvY2tldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0Ll9fZGVjb2RlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIG9iamVjdC5fX2RlY29kZSh0aGlzLCB0aGlzLm9iamVjdE1hcCwgdGhpcy5qampXZWJzb2NrZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgZmllbGQgaW4gdGhpcy5qc29uW0NvbnN0YW50cy5GaWVsZHNQYXJhbV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlY29kZUZpZWxkKGZpZWxkLCAocmVzdWx0KSA9PiBvYmplY3RbZmllbGRdID0gcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlY29kZXI7IiwiLyogZ2xvYmFsIENvbnN0YW50cyAqL1xubGV0IENvbnN0YW50cyA9IHJlcXVpcmUoXCIuL0NvbnN0YW50c1wiKTtcblxuY2xhc3MgRW5jb2RlciB7XG4gICAgY29uc3RydWN0b3Iob2JqZWN0LCBvYmplY3RNYXAsIGtleXMpIHtcbiAgICAgICAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XG4gICAgICAgIHRoaXMub2JqZWN0TWFwID0gb2JqZWN0TWFwO1xuICAgICAgICB0aGlzLmtleXMgPSBrZXlzO1xuICAgIH1cbiAgICBlbmNvZGUoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vYmplY3QgPT09IFwidW5kZWZpbmVkXCIgfHwgdGhpcy5vYmplY3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRW5jb2RlZE51bGwoKS50b0pTT04oKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5vYmplY3QgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIHRoaXMub2JqZWN0ID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiB0aGlzLm9iamVjdCA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRW5jb2RlZFByaW1pdGl2ZSh0aGlzLm9iamVjdCkudG9KU09OKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vYmplY3RNYXAuaGFzVmFsdWUodGhpcy5vYmplY3QpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVuY29kZWRSZWZlcmVuY2UodGhpcy5vYmplY3RNYXAuZ2V0S2V5KHRoaXMub2JqZWN0KSkudG9KU09OKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vYmplY3QgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFbmNvZGVkQXJyYXkodGhpcy5vYmplY3QsIHRoaXMub2JqZWN0TWFwLCB0aGlzLmtleXMpLnRvSlNPTigpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9iamVjdC5jb25zdHJ1Y3Rvci5fX2lzRW51bSA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vYmplY3QuY29uc3RydWN0b3IuX19nZXRDbGFzcyA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgaWYgKHRoaXMub2JqZWN0LmNvbnN0cnVjdG9yLl9faXNFbnVtKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRW5jb2RlZEVudW0odGhpcy5vYmplY3QsIHRoaXMub2JqZWN0TWFwLCB0aGlzLmtleXMpLnRvSlNPTigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFbmNvZGVkT2JqZWN0KHRoaXMub2JqZWN0LCB0aGlzLm9iamVjdE1hcCwgdGhpcy5rZXlzKS50b0pTT04oKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY2xhc3MgRW5jb2RlZE51bGwge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmpzb24gPSB7fTtcbiAgICAgICAgdGhpcy5qc29uW0NvbnN0YW50cy5UeXBlUGFyYW1dID0gQ29uc3RhbnRzLk51bGxWYWx1ZTtcbiAgICB9XG4gICAgdG9KU09OKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qc29uO1xuICAgIH1cbn1cblxuY2xhc3MgRW5jb2RlZFByaW1pdGl2ZSB7XG4gICAgY29uc3RydWN0b3IodmFsdWUpIHtcbiAgICAgICAgdGhpcy5qc29uID0ge307XG4gICAgICAgIHRoaXMuanNvbltDb25zdGFudHMuUHJpbWl0aXZlUGFyYW1dID0gdHlwZW9mIHZhbHVlO1xuICAgICAgICB0aGlzLmpzb25bQ29uc3RhbnRzLlZhbHVlUGFyYW1dID0gdmFsdWU7XG4gICAgfVxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuanNvbjtcbiAgICB9XG59XG5cbmNsYXNzIEVuY29kZWRSZWZlcmVuY2Uge1xuICAgIGNvbnN0cnVjdG9yKHJlZikge1xuICAgICAgICB0aGlzLmpzb24gPSB7fTtcbiAgICAgICAgdGhpcy5qc29uW0NvbnN0YW50cy5Qb2ludGVyUGFyYW1dID0gcmVmO1xuICAgIH1cbiAgICB0b0pTT04oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmpzb247XG4gICAgfVxufVxuXG5jbGFzcyBFbmNvZGVkQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKG9iamVjdCwgb2JqZWN0TWFwLCBrZXlzKSB7XG4gICAgICAgIHRoaXMuanNvbiA9IHt9O1xuICAgICAgICB0aGlzLm9iamVjdCA9IG9iamVjdDtcbiAgICAgICAgdGhpcy5vYmplY3RNYXAgPSBvYmplY3RNYXA7XG4gICAgICAgIHRoaXMua2V5cyA9IGtleXM7XG4gICAgICAgIHRoaXMuanNvbltDb25zdGFudHMuRWxlbWVudHNQYXJhbV0gPSBbXTtcbiAgICAgICAgdGhpcy5lbmNvZGUoKTtcbiAgICB9XG4gICAgZW5jb2RlKCkge1xuICAgICAgICB0aGlzLnNldFZhbHVlcyh0aGlzLmpzb25bQ29uc3RhbnRzLkVsZW1lbnRzUGFyYW1dLCB0aGlzLm9iamVjdCk7XG4gICAgfVxuICAgIHNldFZhbHVlcyhwYXJlbnQsIGN1cnJlbnQpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjdXJyZW50Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgZWxlbWVudCA9IGN1cnJlbnRbaV07XG4gICAgICAgICAgICBwYXJlbnQucHVzaChuZXcgRW5jb2RlcihlbGVtZW50LCB0aGlzLm9iamVjdE1hcCwgdGhpcy5rZXlzKS5lbmNvZGUoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9KU09OKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qc29uO1xuICAgIH1cbn1cblxuY2xhc3MgRW5jb2RlZEVudW0ge1xuICAgIGNvbnN0cnVjdG9yKG9iamVjdCwgb2JqZWN0TWFwLCBrZXlzKSB7XG4gICAgICAgIHRoaXMuanNvbiA9IHt9O1xuICAgICAgICB0aGlzLmpzb25bQ29uc3RhbnRzLlZhbHVlUGFyYW1dID0gb2JqZWN0LnRvU3RyaW5nKCk7XG4gICAgICAgIHRoaXMuanNvbltDb25zdGFudHMuRW51bVBhcmFtXSA9IG9iamVjdC5jb25zdHJ1Y3Rvci5fX2dldENsYXNzKCk7XG4gICAgfVxuXG4gICAgdG9KU09OKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5qc29uO1xuICAgIH1cbn1cblxuY2xhc3MgRW5jb2RlZE9iamVjdCB7XG4gICAgY29uc3RydWN0b3Iob2JqZWN0LCBvYmplY3RNYXAsIGtleXMpIHtcbiAgICAgICAgdGhpcy5qc29uID0ge307XG4gICAgICAgIHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuICAgICAgICB0aGlzLm9iamVjdE1hcCA9IG9iamVjdE1hcDtcbiAgICAgICAgdGhpcy5rZXlzID0ga2V5cztcblxuICAgICAgICBpZiAodHlwZW9mIG9iamVjdC5jb25zdHJ1Y3Rvci5fX2lzVHJhbnNpZW50ICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHdpbmRvdy5vYmplY3QgPSBvYmplY3Q7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZpZWxkICdfX2lzVHJhbnNpZW50JyBvZiBjbGFzcyAnJHtvYmplY3QuY29uc3RydWN0b3IubmFtZX0nIGlzIG5vdCBvZiB0eXBlIGZ1bmN0aW9uLCBmb3VuZCB0eXBlICcke3R5cGVvZiBvYmplY3QuY29uc3RydWN0b3IuX19pc1RyYW5zaWVudH0nLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFvYmplY3QuY29uc3RydWN0b3IuX19pc1RyYW5zaWVudCgpKSB7XG4gICAgICAgICAgICBsZXQga2V5ID0ga2V5cy5hbGxvY05leHRLZXkoKTtcbiAgICAgICAgICAgIHRoaXMuanNvbltDb25zdGFudHMuS2V5UGFyYW1dID0ga2V5O1xuICAgICAgICAgICAgb2JqZWN0TWFwLnNldChrZXksIG9iamVjdCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmpzb25bQ29uc3RhbnRzLlR5cGVQYXJhbV0gPSBvYmplY3QuY29uc3RydWN0b3IuX19nZXRDbGFzcygpO1xuICAgICAgICB0aGlzLmpzb25bQ29uc3RhbnRzLkZpZWxkc1BhcmFtXSA9IHt9O1xuXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0Ll9fZW5jb2RlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIG9iamVjdC5fX2VuY29kZSh0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAobGV0IGZpZWxkIGluIHRoaXMub2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGaWVsZChmaWVsZCwgdGhpcy5vYmplY3RbZmllbGRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldEZpZWxkKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuanNvbltDb25zdGFudHMuRmllbGRzUGFyYW1dW25hbWVdID0gbmV3IEVuY29kZXIodmFsdWUsIHRoaXMub2JqZWN0TWFwLCB0aGlzLmtleXMpLmVuY29kZSgpO1xuICAgIH1cblxuICAgIHRvSlNPTigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuanNvbjtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW5jb2RlcjsiLCJsZXQgVHJhbnNsYXRvciA9IHJlcXVpcmUoXCIuL1RyYW5zbGF0b3JcIik7XG5sZXQgampqcm1pID0gcmVxdWlyZShcIi4vZ2VuL2pqanJtaVwiKTtcbmxldCBBcnJheUxpc3QgPSByZXF1aXJlKFwiLi9qYXZhLWVxdWl2L0FycmF5TGlzdFwiKTtcbmxldCBIYXNoTWFwID0gcmVxdWlyZShcIi4vamF2YS1lcXVpdi9IYXNoTWFwXCIpO1xuQ29uc29sZSA9IGNvbnNvbGU7XG5cbmNsYXNzIEpKSlJNSVNvY2tldCB7XG4gICAgY29uc3RydWN0b3Ioc29ja2V0TmFtZSwgcGFyZW50KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgICAgICB0aGlzLmpqalNvY2tldE5hbWUgPSBzb2NrZXROYW1lO1xuICAgICAgICB0aGlzLnRyYW5zbGF0b3IgPSBuZXcgVHJhbnNsYXRvcih0aGlzLCBKSkpSTUlTb2NrZXQuY2xhc3Nlcyk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSB7fTtcbiAgICAgICAgdGhpcy5mbGFncyA9IE9iamVjdC5hc3NpZ24oSkpKUk1JU29ja2V0LmZsYWdzKTtcbiAgICB9XG4gICAgYXN5bmMgY29ubmVjdCh1cmwpIHtcbiAgICAgICAgaWYgKHRoaXMuZmxhZ3MuQ09OTkVDVCkgY29uc29sZS5sb2coYCR7dGhpcy5qampTb2NrZXROYW1lfSBjb25uZWN0aW5nYCk7XG4gICAgICAgIGlmICghdXJsKSB1cmwgPSB0aGlzLmdldEFkZHJlc3MoKTtcblxuICAgICAgICBsZXQgY2IgPSBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgICAgIHRoaXMub25yZWFkeSA9IHJlc29sdmU7XG4gICAgICAgICAgICB0aGlzLm9ucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgICAgICAgdGhpcy5zb2NrZXQub25lcnJvciA9IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwid2Vic29ja2V0IGVycm9yXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLnNvY2tldC5vbm1lc3NhZ2UgPSAoZXZ0KSA9PiB0aGlzLm9uTWVzc2FnZShldnQpO1xuICAgICAgICAgICAgdGhpcy5uZXh0VUlEID0gMDtcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2sgPSB7fTtcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShjYik7XG4gICAgfVxuXG4gICAgZ2V0QWRkcmVzcygpe1xuICAgICAgICBsZXQgcHJlcXVlbCA9IFwid3M6Ly9cIjtcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCA9PT0gXCJodHRwczpcIikgcHJlcXVlbCA9IFwid3NzOi8vXCI7XG4gICAgICAgIGxldCBwYXRobmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHIoMSk7XG4gICAgICAgIHBhdGhuYW1lID0gcGF0aG5hbWUuc3Vic3RyKDAsIHBhdGhuYW1lLmluZGV4T2YoXCIvXCIpKTtcbiAgICAgICAgcmV0dXJuIGAke3ByZXF1ZWx9JHt3aW5kb3cubG9jYXRpb24uaG9zdH0vJHtwYXRobmFtZX0vJHt0aGlzLmpqalNvY2tldE5hbWV9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGEgbWV0aG9kIHJlcXVlc3QgdG8gdGhlIHNlcnZlci5cbiAgICAgKiBjYWxsYmFja3MuXG4gICAgICogQHBhcmFtIHt0eXBlfSBzcmNcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1ldGhvZE5hbWVcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGFyZ3NcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIG1ldGhvZFJlcXVlc3Qoc3JjLCBtZXRob2ROYW1lLCBhcmdzKSB7XG4gICAgICAgIGlmICghdGhpcy50cmFuc2xhdG9yLmhhc09iamVjdChzcmMpKXtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcInNlZSB3aW5kb3cuZGVidWcgZm9yIHNvdXJjZVwiKTtcbiAgICAgICAgICAgIHdpbmRvdy5kZWJ1ZyA9IHNyYztcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQXR0ZW1wdGluZyB0byBjYWxsIHNlcnZlciBzaWRlIG1ldGhvZCBvbiBub24tcmVjZWl2ZWQgb2JqZWN0OiAke3NyYy5jb25zdHJ1Y3Rvci5uYW1lfS4ke21ldGhvZE5hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHVpZCA9IHRoaXMubmV4dFVJRCsrO1xuICAgICAgICBsZXQgcHRyID0gdGhpcy50cmFuc2xhdG9yLmdldEtleShzcmMpO1xuXG4gICAgICAgIGxldCBhcmdzQXJyYXkgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSBpbiBhcmdzKSBhcmdzQXJyYXkucHVzaChhcmdzW2ldKTtcblxuICAgICAgICBsZXQgZiA9IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tbdWlkXSA9IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlOiByZXNvbHZlLFxuICAgICAgICAgICAgICAgIHJlamVjdDogcmVqZWN0XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IHBhY2tldCA9IG5ldyBNZXRob2RSZXF1ZXN0KHVpZCwgcHRyLCBtZXRob2ROYW1lLCBhcmdzQXJyYXkpO1xuICAgICAgICAgICAgbGV0IGVuY29kZWRQYWNrZXQgPSB0aGlzLnRyYW5zbGF0b3IuZW5jb2RlKHBhY2tldCk7XG4gICAgICAgICAgICBpZiAodGhpcy5mbGFncy5TRU5UKSBjb25zb2xlLmxvZyhlbmNvZGVkUGFja2V0KTtcbiAgICAgICAgICAgIGxldCBlbmNvZGVkU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoZW5jb2RlZFBhY2tldCwgbnVsbCwgNCk7XG4gICAgICAgICAgICB0aGlzLnNvY2tldC5zZW5kKGVuY29kZWRTdHJpbmcpO1xuICAgICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGYpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBbGwgcmVjZWl2ZWQgbWVzc2FnZXMgYXJlIHBhcnNlZCBieSB0aGlzIG1ldGhvZC4gIEFsbCBtZXNzYWdlcyBtdXN0IG9mIHRoZSBqYXZhIHR5cGUgJ1JNSVJlc3BvbnNlJyB3aGljaCB3aWxsXG4gICAgICogYWx3YXlzIGNvbnRhaW4gdGhlIGZpZWxkICd0eXBlOlJNSVJlc3BvbnNlVHlwZScuXG4gICAgICogQHBhcmFtIHt0eXBlfSBldnRcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIG9uTWVzc2FnZShldnQpIHtcbiAgICAgICAgbGV0IHJtaU1lc3NhZ2UgPSB0aGlzLnRyYW5zbGF0b3IuZGVjb2RlKGV2dC5kYXRhKTtcbiAgICAgICAgaWYgKHRoaXMuZmxhZ3MuUkVDRUlWRUQgJiYgdGhpcy5mbGFncy5WRVJCT1NFKXtcbiAgICAgICAgICAgIGxldCBqc29uID0gSlNPTi5wYXJzZShldnQuZGF0YSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShqc29uLCBudWxsLCAyKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZmxhZ3MuUkVDRUlWRUQpIGNvbnNvbGUubG9nKHJtaU1lc3NhZ2UpO1xuXG4gICAgICAgIHN3aXRjaCAocm1pTWVzc2FnZS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIGpqanJtaS5STUlNZXNzYWdlVHlwZS5GT1JHRVQ6e1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZsYWdzLkNPTk5FQ1QpIGNvbnNvbGUubG9nKHRoaXMuampqU29ja2V0TmFtZSArIFwiIEZPUkdFVFwiKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mbGFncy5PTk1FU1NBR0UpIGNvbnNvbGUubG9nKHRoaXMuampqU29ja2V0TmFtZSArIFwiIEZPUkdFVFwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0b3IucmVtb3ZlS2V5KHJtaU1lc3NhZ2Uua2V5KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2Ugampqcm1pLlJNSU1lc3NhZ2VUeXBlLkxPQUQ6e1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZsYWdzLkNPTk5FQ1QpIGNvbnNvbGUubG9nKHRoaXMuampqU29ja2V0TmFtZSArIFwiIExPQURcIik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmxhZ3MuT05NRVNTQUdFKSBjb25zb2xlLmxvZyh0aGlzLmpqalNvY2tldE5hbWUgKyBcIiBMT0FEXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29weUZpZWxkcyhybWlNZXNzYWdlLnNvdXJjZSwgdGhpcy5wYXJlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNsYXRvci5zd2FwKHRoaXMucGFyZW50LCBybWlNZXNzYWdlLnNvdXJjZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIGpqanJtaS5STUlNZXNzYWdlVHlwZS5SRUFEWTp7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmxhZ3MuQ09OTkVDVCB8fCB0aGlzLmZsYWdzLk9OTUVTU0FHRSkgY29uc29sZS5sb2codGhpcy5qampTb2NrZXROYW1lICsgXCIgUkVBRFlcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5vbnJlYWR5KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBjbGllbnQgb3JpZ2luYXRlZCByZXF1ZXN0ICovXG4gICAgICAgICAgICBjYXNlIGpqanJtaS5STUlNZXNzYWdlVHlwZS5MT0NBTDp7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmxhZ3MuT05NRVNTQUdFKSBjb25zb2xlLmxvZyhgUmVzcG9uc2UgdG8gY2xpZW50IHNpZGUgcmVxdWVzdDogJHt0aGlzLmpqalNvY2tldE5hbWV9ICR7cm1pTWVzc2FnZS5tZXRob2ROYW1lfWApO1xuICAgICAgICAgICAgICAgIGxldCBjYWxsYmFjayA9IHRoaXMuY2FsbGJhY2tbcm1pTWVzc2FnZS51aWRdO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSh0aGlzLmNhbGxiYWNrW3JtaU1lc3NhZ2UudWlkXSk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sucmVzb2x2ZShybWlNZXNzYWdlLnJ2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBzZXJ2ZXIgb3JpZ2luYXRlZCByZXF1ZXN0ICovXG4gICAgICAgICAgICBjYXNlIGpqanJtaS5STUlNZXNzYWdlVHlwZS5SRU1PVEU6e1xuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLnRyYW5zbGF0b3IuZ2V0T2JqZWN0KHJtaU1lc3NhZ2UucHRyKTtcbiAgICAgICAgICAgICAgICBsZXQgciA9IHRoaXMucmVtb3RlTWV0aG9kQ2FsbGJhY2sodGFyZ2V0LCBybWlNZXNzYWdlLm1ldGhvZE5hbWUsIHJtaU1lc3NhZ2UuYXJncyk7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlID0gbmV3IEludm9jYXRpb25SZXNwb25zZShybWlNZXNzYWdlLnVpZCwgSW52b2NhdGlvblJlc3BvbnNlQ29kZS5TVUNDRVNTKTtcbiAgICAgICAgICAgICAgICBsZXQgZW5jb2RlZFJlc3BvbnNlID0gdGhpcy50cmFuc2xhdG9yLmVuY29kZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgbGV0IGVuY29kZWRTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShlbmNvZGVkUmVzcG9uc2UsIG51bGwsIDQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmxhZ3MuT05NRVNTQUdFKSBjb25zb2xlLmxvZyhgU2VydmVyIHNpZGUgcmVxdWVzdDogJHt0aGlzLmpqalNvY2tldE5hbWV9ICR7dGFyZ2V0LmNvbnN0cnVjdG9yLm5hbWV9LiR7cm1pTWVzc2FnZS5tZXRob2ROYW1lfWApO1xuICAgICAgICAgICAgICAgIHRoaXMuc29ja2V0LnNlbmQoZW5jb2RlZFN0cmluZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIGpqanJtaS5STUlNZXNzYWdlVHlwZS5FWENFUFRJT046e1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5mbGFncy5TSUxFTlQpIGNvbnNvbGUubG9nKHRoaXMuampqU29ja2V0TmFtZSArIFwiIEVYQ0VQVElPTiBcIiArIHJtaU1lc3NhZ2UubWV0aG9kTmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmZsYWdzLlNJTEVOVCkgY29uc29sZS53YXJuKHJtaU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGxldCBjYWxsYmFjayA9IHRoaXMuY2FsbGJhY2tbcm1pTWVzc2FnZS51aWRdO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSh0aGlzLmNhbGxiYWNrW3JtaU1lc3NhZ2UudWlkXSk7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sucmVqZWN0KHJtaU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBqampybWkuUk1JTWVzc2FnZVR5cGUuUkVKRUNURURfQ09OTkVDVElPTjp7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmxhZ3MuQ09OTkVDVCB8fCB0aGlzLmZsYWdzLk9OTUVTU0FHRSkgY29uc29sZS5sb2codGhpcy5qampTb2NrZXROYW1lICsgXCIgUkVKRUNURURfQ09OTkVDVElPTlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9ucmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb3B5RmllbGRzKHNvdXJjZSwgdGFyZ2V0KXtcbiAgICAgICAgZm9yIChsZXQgZmllbGQgaW4gc291cmNlKXtcbiAgICAgICAgICAgIGlmICghZmllbGQuc3RhcnRzV2l0aChcIl9fXCIpKXtcbiAgICAgICAgICAgICAgICB0YXJnZXRbZmllbGRdID0gc291cmNlW2ZpZWxkXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgYSBzZXJ2ZXIgb3JpZ2luYXRlZCByZXF1ZXN0LiAgV2lsbCB0aHJvdyBhIHdhcm5pbmcgaWYgdGhlIGNsaWVudCBkb2VzIG5vdCBoYXZlIGEgbWV0aG9kIHRvIGhhbmRsZSB0aGVcbiAgICAgKiByZXF1ZXN0LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdGFyZ2V0XG4gICAgICogQHBhcmFtIHt0eXBlfSBtZXRob2ROYW1lXG4gICAgICogQHBhcmFtIHt0eXBlfSBhcmdzXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICByZW1vdGVNZXRob2RDYWxsYmFjayh0YXJnZXQsIG1ldGhvZE5hbWUsIGFyZ3MpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXRbbWV0aG9kTmFtZV0gIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgaWYgKCFKSkpSTUlTb2NrZXQuc2lsZW50KSBjb25zb2xlLndhcm4odGhpcy5zb2NrZXQudXJsICsgXCI6XCIgKyB0YXJnZXQuY29uc3RydWN0b3IubmFtZSArIFwiIGRvZXMgbm90IGhhdmUgcmVtb3RlbHkgaW52b2thYmxlIG1ldGhvZCAnXCIgKyBtZXRob2ROYW1lICsgXCInLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbbWV0aG9kTmFtZV0uYXBwbHkodGFyZ2V0LCBhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkpKSlJNSVNvY2tldC5mbGFncyA9IHtcbiAgICAgICAgU0lMRU5UOiBmYWxzZSxcbiAgICAgICAgQ09OTkVDVDogZmFsc2UsXG4gICAgICAgIE9OTUVTU0FHRTogZmFsc2UsIC8qIHNob3cgdGhhdCBhIHNlcnZlciBvYmplY3QgaGFzIGJlZW4gcmVjZWl2ZWQgYW5kIGFuIGFjdGlvbiBtYXkgYmUgdGFrZW4gKi9cbiAgICAgICAgU0VOVDogZmFsc2UsXG4gICAgICAgIFJFQ0VJVkVEOiBmYWxzZSwgLyogc2hvdyB0aGUgcmVjZWl2ZWQgc2VydmVyIG9iamVjdCwgdmVyYm9zZSBzaG93cyB0aGUgdGV4dCBhcyB3ZWxsICovXG4gICAgICAgIFZFUkJPU0U6IGZhbHNlLFxuICAgICAgICBPTlJFR0lTVEVSOiB0cnVlIC8qIHJlcG9ydCBjbGFzc2VzIGFzIHRoZXkgYXJlIHJlZ2lzdGVyZWQgKi9cbn07XG5cbkpKSlJNSVNvY2tldC5jbGFzc2VzID0gbmV3IE1hcCgpO1xuXG5KSkpSTUlTb2NrZXQucmVnaXN0ZXJDbGFzcyA9IGZ1bmN0aW9uKGFDbGFzcyl7XG4gICAgaWYgKHR5cGVvZiBhQ2xhc3MgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKGBwYXJhbWF0ZXIgYUNsYXNzIG9mIHR5cGUgJHt0eXBlb2YgYUNsYXNzLl9fZ2V0Q2xhc3N9YCk7XG4gICAgaWYgKHR5cGVvZiBhQ2xhc3MuX19nZXRDbGFzcyAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoYGluIENsYXNzICR7YUNsYXNzLmNvbnN0cnVjdG9yLm5hbWV9IG1ldGhvZCBfX2dldENsYXNzIG9mIHR5cGUgJHt0eXBlb2YgYUNsYXNzLl9fZ2V0Q2xhc3N9YCk7XG4gICAgaWYgKEpKSlJNSVNvY2tldC5mbGFncy5PTlJFR0lTVEVSKSBjb25zb2xlLmxvZyhgUmVnaXN0ZXIgJHthQ2xhc3MuX19nZXRDbGFzcygpfWApO1xuICAgIEpKSlJNSVNvY2tldC5jbGFzc2VzLnNldChhQ2xhc3MuX19nZXRDbGFzcygpLCBhQ2xhc3MpO1xufTtcblxuLyogZm9yIHJlZ2lzdGVyaW5nIGFsbCBjbGFzc2VzIHJldHVybmVkIGZyb20gZ2VuZXJhdGVkIEpTICovXG5KSkpSTUlTb2NrZXQucmVnaXN0ZXJQYWNrYWdlID0gZnVuY3Rpb24ocGFja2FnZSl7XG4gICAgZm9yIChsZXQgYUNsYXNzIGluIHBhY2thZ2UpIEpKSlJNSVNvY2tldC5yZWdpc3RlckNsYXNzKHBhY2thZ2VbYUNsYXNzXSk7XG59O1xuXG4vKiByZWdpc3RlciB0aGUgY2xhc3NlcyByZXF1aXJlZCBmb3IgSkpKUk1JU29ja2V0ICovXG5KSkpSTUlTb2NrZXQucmVnaXN0ZXJQYWNrYWdlKGpqanJtaSk7XG5KSkpSTUlTb2NrZXQucmVnaXN0ZXJDbGFzcyhBcnJheUxpc3QpO1xuSkpKUk1JU29ja2V0LnJlZ2lzdGVyQ2xhc3MoSGFzaE1hcCk7XG5cbmpqanJtaXNvY2tldCA9IHt9O1xuampqcm1pc29ja2V0LkpKSlJNSVNvY2tldCA9IEpKSlJNSVNvY2tldDtcbmpqanJtaXNvY2tldC5UcmFuc2xhdG9yID0gVHJhbnNsYXRvcjtcbmpqanJtaXNvY2tldC5BcnJheUxpc3QgPSBBcnJheUxpc3Q7XG5qampybWlzb2NrZXQuSGFzaE1hcCA9IEhhc2hNYXA7XG5tb2R1bGUuZXhwb3J0cyA9IGpqanJtaXNvY2tldDsiLCJsZXQgRW5jb2RlciA9IHJlcXVpcmUoXCIuL0VuY29kZXJcIik7XG5sZXQgRGVjb2RlciA9IHJlcXVpcmUoXCIuL0RlY29kZXJcIik7XG5cbmNsYXNzIEJpTWFwe1xuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMub2JqZWN0TWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnJldmVyc2VNYXAgPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQnlLZXkoa2V5KXtcbiAgICAgICAgbGV0IG9iaiA9IHRoaXMub2JqZWN0TWFwLmdldChrZXkpO1xuICAgICAgICB0aGlzLm9iamVjdE1hcC5kZWxldGUoa2V5KTtcbiAgICAgICAgdGhpcy5yZXZlcnNlTWFwLmRlbGV0ZShvYmopO1xuICAgIH1cblxuICAgIHJlbW92ZUJ5VmFsdWUob2JqKXtcbiAgICAgICAgbGV0IGtleSA9IHRoaXMucmV2ZXJzZU1hcC5nZXQoa2V5KTtcbiAgICAgICAgdGhpcy5vYmplY3RNYXAuZGVsZXRlKGtleSk7XG4gICAgICAgIHRoaXMucmV2ZXJzZU1hcC5kZWxldGUob2JqKTtcbiAgICB9XG5cbiAgICBnZXQoa2V5KXtcbiAgICAgICAgcmV0dXJuIHRoaXMub2JqZWN0TWFwLmdldChrZXkpO1xuICAgIH1cblxuICAgIHNldChrZXksIHZhbHVlKXtcbiAgICAgICAgdGhpcy5vYmplY3RNYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB0aGlzLnJldmVyc2VNYXAuc2V0KHZhbHVlLCBrZXkpO1xuICAgIH1cblxuICAgIGdldEtleSh2YWx1ZSl7XG4gICAgICAgIHJldHVybiB0aGlzLnJldmVyc2VNYXAuZ2V0KHZhbHVlKTtcbiAgICB9XG5cbiAgICBoYXMoa2V5KXtcbiAgICAgICAgcmV0dXJuIHRoaXMub2JqZWN0TWFwLmhhcyhrZXkpO1xuICAgIH1cblxuICAgIGhhc1ZhbHVlKHZhbHVlKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucmV2ZXJzZU1hcC5oYXModmFsdWUpO1xuICAgIH1cblxuICAgIC8qIHJlbW92ZSB0YXJnZXQgZnJlb20gdGhlIHRyYW5zbGF0b3IgcmVwbGFjaW5nIGl0IHdpdGggc291cmNlLCBtYWludGFpbmluZyB0aGUgc2FtZSBrZXkgKi9cbiAgICBzd2FwKHNvdXJjZSwgdGFyZ2V0KXtcbiAgICAgICAgbGV0IGtleSA9IHRoaXMuZ2V0S2V5KHRhcmdldCk7XG4gICAgICAgIHRoaXMub2JqZWN0TWFwLnNldChrZXksIHNvdXJjZSk7XG4gICAgICAgIHRoaXMucmV2ZXJzZU1hcC5kZWxldGUodGFyZ2V0KTtcbiAgICAgICAgdGhpcy5yZXZlcnNlTWFwLnNldChzb3VyY2UsIGtleSk7XG4gICAgfVxufVxuXG5jbGFzcyBUcmFuc2xhdG9ye1xuICAgIGNvbnN0cnVjdG9yKGpqaldlYnNvY2tldCwgY2xhc3NtYXApe1xuICAgICAgICB0aGlzLm9iamVjdE1hcCA9IG5ldyBCaU1hcCgpO1xuICAgICAgICB0aGlzLm5leHQgPSAtMTtcbiAgICAgICAgdGhpcy5qampXZWJzb2NrZXQgPSBqampXZWJzb2NrZXQ7XG4gICAgICAgIHRoaXMuZGVmZXJyZWQgPSBbXTtcbiAgICAgICAgdGhpcy5jbGFzc21hcCA9IGNsYXNzbWFwO1xuXG4gICAgICAgIGlmICh0eXBlb2YgY2xhc3NtYXAgPT09IFwidW5kZWZpbmVkXCIpIHRocm93IG5ldyBFcnJvcihcInVuZGVmaW5lZCBjbGFzc21hcFwiKTtcbiAgICB9XG5cbiAgICBjbGVhcigpe1xuICAgIH1cblxuICAgIHJlbW92ZU9iamVjdChvYmope1xuICAgICAgICB0aGlzLm9iamVjdE1hcC5yZW1vdmVCeVZhbHVlKG9iaik7XG4gICAgfVxuXG4gICAgcmVtb3ZlS2V5KGtleSl7XG4gICAgICAgIHRoaXMub2JqZWN0TWFwLnJlbW92ZUJ5S2V5KGtleSk7XG4gICAgfVxuXG4gICAgZW5jb2RlKG9iamVjdCl7XG4gICAgICAgIHJldHVybiBuZXcgRW5jb2RlcihvYmplY3QsIHRoaXMub2JqZWN0TWFwLCB0aGlzKS5lbmNvZGUoKTtcbiAgICB9XG5cbiAgICBkZWNvZGUoanNvbk9iamVjdCl7XG4gICAgICAgIGxldCByZXN1bHQgPSB1bmRlZmluZWQ7XG4gICAgICAgIG5ldyBEZWNvZGVyKGpzb25PYmplY3QsIHRoaXMub2JqZWN0TWFwLCB0aGlzLmpqaldlYnNvY2tldCwgdGhpcy5kZWZlcnJlZCwgdGhpcy5jbGFzc21hcCkuZGVjb2RlKChyKT0+cmVzdWx0ID0gcik7XG5cbiAgICAgICAgd2hpbGUgKHRoaXMuZGVmZXJyZWQubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICBsZXQgZGVmSXRlbSA9IHRoaXMuZGVmZXJyZWQuc2hpZnQoKTtcbiAgICAgICAgICAgIGRlZkl0ZW0uZGVjb2Rlci5kZWNvZGUoZGVmSXRlbS5jYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGhhc09iamVjdChvYmope1xuICAgICAgICByZXR1cm4gdGhpcy5vYmplY3RNYXAuaGFzVmFsdWUob2JqKTtcbiAgICB9XG5cbiAgICBnZXRPYmplY3Qoa2V5KXtcbiAgICAgICAgcmV0dXJuIHRoaXMub2JqZWN0TWFwLmdldChrZXkpO1xuICAgIH1cblxuICAgIGdldEtleShvYmope1xuICAgICAgICByZXR1cm4gdGhpcy5vYmplY3RNYXAuZ2V0S2V5KG9iaik7XG4gICAgfVxuXG4gICAgYWxsb2NOZXh0S2V5KCl7XG4gICAgICAgIHRoaXMubmV4dCsrO1xuICAgICAgICByZXR1cm4gXCJDXCIgKyB0aGlzLm5leHQ7XG4gICAgfVxuXG4gICAgLyogcmVtb3ZlIHRhcmdldCBmb3JtIGhlIHRyYW5zbGF0b3IgcmVwbGFjaW5nIGl0IHdpdGggc291cmNlLCBtYWludGFpbmluZyB0aGUgc2FtZSBrZXkgKi9cbiAgICBzd2FwKHNvdXJjZSwgdGFyZ2V0KXtcbiAgICAgICAgdGhpcy5vYmplY3RNYXAuc3dhcChzb3VyY2UsIHRhcmdldCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zbGF0b3I7IiwibGV0IGpqanJtaSA9IHt9O1xuXG5TZXJ2ZXJTaWRlRXhjZXB0aW9uTWVzc2FnZSA9IGNsYXNzIFNlcnZlclNpZGVFeGNlcHRpb25NZXNzYWdlIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0c3RhdGljIF9faXNUcmFuc2llbnQoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0c3RhdGljIF9fZ2V0Q2xhc3MoKSB7XG5cdFx0cmV0dXJuIFwiY2EuZmEuampqcm1pLnNvY2tldC5tZXNzYWdlLlNlcnZlclNpZGVFeGNlcHRpb25NZXNzYWdlXCI7XG5cdH1cblx0c3RhdGljIF9faXNFbnVtKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcbmpqanJtaS5TZXJ2ZXJTaWRlRXhjZXB0aW9uTWVzc2FnZSA9IFNlcnZlclNpZGVFeGNlcHRpb25NZXNzYWdlO1xuU2VydmVyUmVzcG9uc2VNZXNzYWdlID0gY2xhc3MgU2VydmVyUmVzcG9uc2VNZXNzYWdlIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdH1cblx0c3RhdGljIF9faXNUcmFuc2llbnQoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0c3RhdGljIF9fZ2V0Q2xhc3MoKSB7XG5cdFx0cmV0dXJuIFwiY2EuZmEuampqcm1pLnNvY2tldC5tZXNzYWdlLlNlcnZlclJlc3BvbnNlTWVzc2FnZVwiO1xuXHR9XG5cdHN0YXRpYyBfX2lzRW51bSgpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5qampybWkuU2VydmVyUmVzcG9uc2VNZXNzYWdlID0gU2VydmVyUmVzcG9uc2VNZXNzYWdlO1xuUmVqZWN0ZWRDb25uZWN0aW9uTWVzc2FnZSA9IGNsYXNzIFJlamVjdGVkQ29ubmVjdGlvbk1lc3NhZ2Uge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0fVxuXHRzdGF0aWMgX19pc1RyYW5zaWVudCgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRzdGF0aWMgX19nZXRDbGFzcygpIHtcblx0XHRyZXR1cm4gXCJjYS5mYS5qampybWkuc29ja2V0Lm1lc3NhZ2UuUmVqZWN0ZWRDb25uZWN0aW9uTWVzc2FnZVwiO1xuXHR9XG5cdHN0YXRpYyBfX2lzRW51bSgpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5qampybWkuUmVqZWN0ZWRDb25uZWN0aW9uTWVzc2FnZSA9IFJlamVjdGVkQ29ubmVjdGlvbk1lc3NhZ2U7XG5SZWFkeU1lc3NhZ2UgPSBjbGFzcyBSZWFkeU1lc3NhZ2Uge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0fVxuICAgIGZvbygpe2NvbnNvbGUubG9nKFwiRk9PXCIpO31cblx0c3RhdGljIF9faXNUcmFuc2llbnQoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0c3RhdGljIF9fZ2V0Q2xhc3MoKSB7XG5cdFx0cmV0dXJuIFwiY2EuZmEuampqcm1pLnNvY2tldC5tZXNzYWdlLlJlYWR5TWVzc2FnZVwiO1xuXHR9XG5cdHN0YXRpYyBfX2lzRW51bSgpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5qampybWkuUmVhZHlNZXNzYWdlID0gUmVhZHlNZXNzYWdlO1xuUk1JTWVzc2FnZVR5cGUgPSBjbGFzcyBSTUlNZXNzYWdlVHlwZSB7XG5cdGNvbnN0cnVjdG9yKHZhbHVlKSB7XG5cdFx0dGhpcy5fX3ZhbHVlID0gdmFsdWU7XG5cdH1cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX192YWx1ZTtcblx0fVxuXHRzdGF0aWMgX19pc1RyYW5zaWVudCgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRzdGF0aWMgX19nZXRDbGFzcygpIHtcblx0XHRyZXR1cm4gXCJjYS5mYS5qampybWkuc29ja2V0Lm1lc3NhZ2UuUk1JTWVzc2FnZVR5cGVcIjtcblx0fVxuXHRzdGF0aWMgX19pc0VudW0oKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn07XG5STUlNZXNzYWdlVHlwZS52YWx1ZUFycmF5ID0gW107XG5STUlNZXNzYWdlVHlwZS52YWx1ZUFycmF5LnB1c2goUk1JTWVzc2FnZVR5cGUuTE9DQUwgPSBuZXcgUk1JTWVzc2FnZVR5cGUoXCJMT0NBTFwiKSk7XG5STUlNZXNzYWdlVHlwZS52YWx1ZUFycmF5LnB1c2goUk1JTWVzc2FnZVR5cGUuUkVNT1RFID0gbmV3IFJNSU1lc3NhZ2VUeXBlKFwiUkVNT1RFXCIpKTtcblJNSU1lc3NhZ2VUeXBlLnZhbHVlQXJyYXkucHVzaChSTUlNZXNzYWdlVHlwZS5SRUFEWSA9IG5ldyBSTUlNZXNzYWdlVHlwZShcIlJFQURZXCIpKTtcblJNSU1lc3NhZ2VUeXBlLnZhbHVlQXJyYXkucHVzaChSTUlNZXNzYWdlVHlwZS5MT0FEID0gbmV3IFJNSU1lc3NhZ2VUeXBlKFwiTE9BRFwiKSk7XG5STUlNZXNzYWdlVHlwZS52YWx1ZUFycmF5LnB1c2goUk1JTWVzc2FnZVR5cGUuRVhDRVBUSU9OID0gbmV3IFJNSU1lc3NhZ2VUeXBlKFwiRVhDRVBUSU9OXCIpKTtcblJNSU1lc3NhZ2VUeXBlLnZhbHVlQXJyYXkucHVzaChSTUlNZXNzYWdlVHlwZS5GT1JHRVQgPSBuZXcgUk1JTWVzc2FnZVR5cGUoXCJGT1JHRVRcIikpO1xuUk1JTWVzc2FnZVR5cGUudmFsdWVBcnJheS5wdXNoKFJNSU1lc3NhZ2VUeXBlLlJFSkVDVEVEX0NPTk5FQ1RJT04gPSBuZXcgUk1JTWVzc2FnZVR5cGUoXCJSRUpFQ1RFRF9DT05ORUNUSU9OXCIpKTtcblJNSU1lc3NhZ2VUeXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCl7cmV0dXJuIFJNSU1lc3NhZ2VUeXBlLnZhbHVlQXJyYXk7fTtcbmpqanJtaS5STUlNZXNzYWdlVHlwZSA9IFJNSU1lc3NhZ2VUeXBlO1xuUk1JTWVzc2FnZSA9IGNsYXNzIFJNSU1lc3NhZ2Uge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0fVxuXHRzdGF0aWMgX19pc1RyYW5zaWVudCgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRzdGF0aWMgX19nZXRDbGFzcygpIHtcblx0XHRyZXR1cm4gXCJjYS5mYS5qampybWkuc29ja2V0Lm1lc3NhZ2UuUk1JTWVzc2FnZVwiO1xuXHR9XG5cdHN0YXRpYyBfX2lzRW51bSgpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5qampybWkuUk1JTWVzc2FnZSA9IFJNSU1lc3NhZ2U7XG5NZXRob2RSZXNwb25zZSA9IGNsYXNzIE1ldGhvZFJlc3BvbnNlIHtcblx0Y29uc3RydWN0b3IodWlkLCBvYmplY3RQVFIsIG1ldGhvZE5hbWUsIHJ2YWx1ZSkge1xuXHRcdHRoaXMudWlkID0gdWlkO1xuXHRcdHRoaXMubWV0aG9kTmFtZSA9IG1ldGhvZE5hbWU7XG5cdFx0dGhpcy5ydmFsdWUgPSBydmFsdWU7XG5cdFx0dGhpcy5vYmplY3RQVFIgPSBvYmplY3RQVFI7XG5cdH1cblx0c3RhdGljIF9faXNUcmFuc2llbnQoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0c3RhdGljIF9fZ2V0Q2xhc3MoKSB7XG5cdFx0cmV0dXJuIFwiY2EuZmEuampqcm1pLnNvY2tldC5tZXNzYWdlLk1ldGhvZFJlc3BvbnNlXCI7XG5cdH1cblx0c3RhdGljIF9faXNFbnVtKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcbmpqanJtaS5NZXRob2RSZXNwb25zZSA9IE1ldGhvZFJlc3BvbnNlO1xuTWV0aG9kUmVxdWVzdCA9IGNsYXNzIE1ldGhvZFJlcXVlc3Qge1xuXHRjb25zdHJ1Y3Rvcih1aWQsIHB0ciwgbWV0aG9kTmFtZSwgYXJncykge1xuXHRcdHRoaXMudWlkID0gdWlkO1xuXHRcdHRoaXMub2JqZWN0UFRSID0gcHRyO1xuXHRcdHRoaXMubWV0aG9kTmFtZSA9IG1ldGhvZE5hbWU7XG5cdFx0dGhpcy5tZXRob2RBcmd1bWVudHMgPSBhcmdzO1xuXHR9XG5cdHN0YXRpYyBfX2lzVHJhbnNpZW50KCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHN0YXRpYyBfX2dldENsYXNzKCkge1xuXHRcdHJldHVybiBcImNhLmZhLmpqanJtaS5zb2NrZXQubWVzc2FnZS5NZXRob2RSZXF1ZXN0XCI7XG5cdH1cblx0c3RhdGljIF9faXNFbnVtKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHR1cGRhdGUocGFyYW1ldGVycykge1xuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCBwYXJhbWV0ZXJzLmxlbmd0aDsgaSsrKXtcblx0XHRcdGxldCBwYXJhbWV0ZXIgPSBwYXJhbWV0ZXJzW2ldO1xuXHRcdFx0aWYgKHRoaXMubWV0aG9kQXJndW1lbnRzW2ldID09PSBudWxsKWNvbnRpbnVlO1xuXG5cdFx0XHRpZiAocGFyYW1ldGVyLmdldFR5cGUoKS5pc0FycmF5KCkpe1xuXHRcdFx0XHRsZXQgYXJndW1lbnQgPSB0aGlzLm1ldGhvZEFyZ3VtZW50c1tpXTtcblx0XHRcdFx0bGV0IG5ld0luc3RhbmNlID0gQXJyYXkubmV3SW5zdGFuY2UocGFyYW1ldGVyLmdldFR5cGUoKS5nZXRDb21wb25lbnRUeXBlKCksIGFyZ3VtZW50Lmxlbmd0aCk7XG5cdFx0XHRcdGZvcihsZXQgaiA9IDA7IGogPCBhcmd1bWVudC5sZW5ndGg7IGorKylBcnJheS5zZXQobmV3SW5zdGFuY2UsIGosIGFyZ3VtZW50W2pdKTtcblxuXHRcdFx0XHR0aGlzLm1ldGhvZEFyZ3VtZW50c1tpXSA9IG5ld0luc3RhbmNlO1xuXHRcdFx0XHRyZXR1cm4gO1xuXHRcdFx0fVxuXHRcdFx0c3dpdGNoIChwYXJhbWV0ZXIuZ2V0VHlwZSgpLmdldENhbm9uaWNhbE5hbWUoKSl7XG5cdFx0XHRcdGNhc2UgXCJqYXZhLmxhbmcuU3RyaW5nXCI6IGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJib29sZWFuXCI6IDtcblx0XHRcdFx0Y2FzZSBcImphdmEubGFuZy5Cb29sZWFuXCI6IGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJieXRlXCI6IDtcblx0XHRcdFx0Y2FzZSBcImphdmEubGFuZy5CeXRlXCI6IHtcblx0XHRcdFx0XHR0aGlzLm1ldGhvZEFyZ3VtZW50c1tpXSA9IEJ5dGUucGFyc2VCeXRlKHRoaXMubWV0aG9kQXJndW1lbnRzW2ldLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgXCJjaGFyXCI6IDtcblx0XHRcdFx0Y2FzZSBcImphdmEubGFuZy5DaGFyYWN0ZXJcIjoge1xuXHRcdFx0XHRcdHRoaXMubWV0aG9kQXJndW1lbnRzW2ldID0gdGhpcy5tZXRob2RBcmd1bWVudHNbaV0udG9TdHJpbmcoKS5jaGFyQXQoMCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBcInNob3J0XCI6IDtcblx0XHRcdFx0Y2FzZSBcImphdmEubGFuZy5TaG9ydFwiOiB7XG5cdFx0XHRcdFx0dGhpcy5tZXRob2RBcmd1bWVudHNbaV0gPSBTaG9ydC5wYXJzZVNob3J0KHRoaXMubWV0aG9kQXJndW1lbnRzW2ldLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgXCJsb25nXCI6IDtcblx0XHRcdFx0Y2FzZSBcImphdmEubGFuZy5Mb25nXCI6IHtcblx0XHRcdFx0XHR0aGlzLm1ldGhvZEFyZ3VtZW50c1tpXSA9IExvbmcucGFyc2VMb25nKHRoaXMubWV0aG9kQXJndW1lbnRzW2ldLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgXCJmbG9hdFwiOiA7XG5cdFx0XHRcdGNhc2UgXCJqYXZhLmxhbmcuRmxvYXRcIjoge1xuXHRcdFx0XHRcdHRoaXMubWV0aG9kQXJndW1lbnRzW2ldID0gRmxvYXQucGFyc2VGbG9hdCh0aGlzLm1ldGhvZEFyZ3VtZW50c1tpXS50b1N0cmluZygpKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIFwiZG91YmxlXCI6IDtcblx0XHRcdFx0Y2FzZSBcImphdmEubGFuZy5Eb3VibGVcIjoge1xuXHRcdFx0XHRcdHRoaXMubWV0aG9kQXJndW1lbnRzW2ldID0gRG91YmxlLnBhcnNlRG91YmxlKHRoaXMubWV0aG9kQXJndW1lbnRzW2ldLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgXCJpbnRcIjogO1xuXHRcdFx0XHRjYXNlIFwiamF2YS5sYW5nLkludGVnZXJcIjogYnJlYWs7XG5cblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5qampybWkuTWV0aG9kUmVxdWVzdCA9IE1ldGhvZFJlcXVlc3Q7XG5Mb2FkTWVzc2FnZSA9IGNsYXNzIExvYWRNZXNzYWdlIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cblx0fVxuXHRzdGF0aWMgX19pc1RyYW5zaWVudCgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRzdGF0aWMgX19nZXRDbGFzcygpIHtcblx0XHRyZXR1cm4gXCJjYS5mYS5qampybWkuc29ja2V0Lm1lc3NhZ2UuTG9hZE1lc3NhZ2VcIjtcblx0fVxuXHRzdGF0aWMgX19pc0VudW0oKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuampqcm1pLkxvYWRNZXNzYWdlID0gTG9hZE1lc3NhZ2U7XG5JbnZvY2F0aW9uUmVzcG9uc2VDb2RlID0gY2xhc3MgSW52b2NhdGlvblJlc3BvbnNlQ29kZSB7XG5cdGNvbnN0cnVjdG9yKHZhbHVlKSB7XG5cdFx0dGhpcy5fX3ZhbHVlID0gdmFsdWU7XG5cdH1cblx0dG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX192YWx1ZTtcblx0fVxuXHRzdGF0aWMgX19pc1RyYW5zaWVudCgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRzdGF0aWMgX19nZXRDbGFzcygpIHtcblx0XHRyZXR1cm4gXCJjYS5mYS5qampybWkuc29ja2V0Lm1lc3NhZ2UuSW52b2NhdGlvblJlc3BvbnNlQ29kZVwiO1xuXHR9XG5cdHN0YXRpYyBfX2lzRW51bSgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufTtcbkludm9jYXRpb25SZXNwb25zZUNvZGUudmFsdWVBcnJheSA9IFtdO1xuSW52b2NhdGlvblJlc3BvbnNlQ29kZS52YWx1ZUFycmF5LnB1c2goSW52b2NhdGlvblJlc3BvbnNlQ29kZS5GQUlMRUQgPSBuZXcgSW52b2NhdGlvblJlc3BvbnNlQ29kZShcIkZBSUxFRFwiKSk7XG5JbnZvY2F0aW9uUmVzcG9uc2VDb2RlLnZhbHVlQXJyYXkucHVzaChJbnZvY2F0aW9uUmVzcG9uc2VDb2RlLlNVQ0NFU1MgPSBuZXcgSW52b2NhdGlvblJlc3BvbnNlQ29kZShcIlNVQ0NFU1NcIikpO1xuSW52b2NhdGlvblJlc3BvbnNlQ29kZS52YWx1ZXMgPSBmdW5jdGlvbigpe3JldHVybiBJbnZvY2F0aW9uUmVzcG9uc2VDb2RlLnZhbHVlQXJyYXk7fTtcbmpqanJtaS5JbnZvY2F0aW9uUmVzcG9uc2VDb2RlID0gSW52b2NhdGlvblJlc3BvbnNlQ29kZTtcbkludm9jYXRpb25SZXNwb25zZSA9IGNsYXNzIEludm9jYXRpb25SZXNwb25zZSB7XG5cdGNvbnN0cnVjdG9yKHVpZCwgY29kZSkge1xuXHRcdHRoaXMudWlkID0gdWlkO1xuXHRcdHRoaXMuY29kZSA9IGNvZGU7XG5cdH1cblx0c3RhdGljIF9faXNUcmFuc2llbnQoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0c3RhdGljIF9fZ2V0Q2xhc3MoKSB7XG5cdFx0cmV0dXJuIFwiY2EuZmEuampqcm1pLnNvY2tldC5tZXNzYWdlLkludm9jYXRpb25SZXNwb25zZVwiO1xuXHR9XG5cdHN0YXRpYyBfX2lzRW51bSgpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5qampybWkuSW52b2NhdGlvblJlc3BvbnNlID0gSW52b2NhdGlvblJlc3BvbnNlO1xuRm9yZ2V0TWVzc2FnZSA9IGNsYXNzIEZvcmdldE1lc3NhZ2Uge1xuXHRjb25zdHJ1Y3RvcigpIHtcblxuXHR9XG5cdHN0YXRpYyBfX2lzVHJhbnNpZW50KCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHN0YXRpYyBfX2dldENsYXNzKCkge1xuXHRcdHJldHVybiBcImNhLmZhLmpqanJtaS5zb2NrZXQubWVzc2FnZS5Gb3JnZXRNZXNzYWdlXCI7XG5cdH1cblx0c3RhdGljIF9faXNFbnVtKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcbmpqanJtaS5Gb3JnZXRNZXNzYWdlID0gRm9yZ2V0TWVzc2FnZTtcbkNsaWVudFJlcXVlc3RNZXNzYWdlID0gY2xhc3MgQ2xpZW50UmVxdWVzdE1lc3NhZ2Uge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0fVxuXHRzdGF0aWMgX19pc1RyYW5zaWVudCgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRzdGF0aWMgX19nZXRDbGFzcygpIHtcblx0XHRyZXR1cm4gXCJjYS5mYS5qampybWkuc29ja2V0Lm1lc3NhZ2UuQ2xpZW50UmVxdWVzdE1lc3NhZ2VcIjtcblx0fVxuXHRzdGF0aWMgX19pc0VudW0oKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuampqcm1pLkNsaWVudFJlcXVlc3RNZXNzYWdlID0gQ2xpZW50UmVxdWVzdE1lc3NhZ2U7XG5DbGllbnRNZXNzYWdlVHlwZSA9IGNsYXNzIENsaWVudE1lc3NhZ2VUeXBlIHtcblx0Y29uc3RydWN0b3IodmFsdWUpIHtcblx0XHR0aGlzLl9fdmFsdWUgPSB2YWx1ZTtcblx0fVxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gdGhpcy5fX3ZhbHVlO1xuXHR9XG5cdHN0YXRpYyBfX2lzVHJhbnNpZW50KCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHN0YXRpYyBfX2dldENsYXNzKCkge1xuXHRcdHJldHVybiBcImNhLmZhLmpqanJtaS5zb2NrZXQubWVzc2FnZS5DbGllbnRNZXNzYWdlVHlwZVwiO1xuXHR9XG5cdHN0YXRpYyBfX2lzRW51bSgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufTtcbkNsaWVudE1lc3NhZ2VUeXBlLnZhbHVlQXJyYXkgPSBbXTtcbkNsaWVudE1lc3NhZ2VUeXBlLnZhbHVlQXJyYXkucHVzaChDbGllbnRNZXNzYWdlVHlwZS5NRVRIT0RfUkVRVUVTVCA9IG5ldyBDbGllbnRNZXNzYWdlVHlwZShcIk1FVEhPRF9SRVFVRVNUXCIpKTtcbkNsaWVudE1lc3NhZ2VUeXBlLnZhbHVlQXJyYXkucHVzaChDbGllbnRNZXNzYWdlVHlwZS5JTlZPQ0FUSU9OX1JFU1BPTlNFID0gbmV3IENsaWVudE1lc3NhZ2VUeXBlKFwiSU5WT0NBVElPTl9SRVNQT05TRVwiKSk7XG5DbGllbnRNZXNzYWdlVHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpe3JldHVybiBDbGllbnRNZXNzYWdlVHlwZS52YWx1ZUFycmF5O307XG5qampybWkuQ2xpZW50TWVzc2FnZVR5cGUgPSBDbGllbnRNZXNzYWdlVHlwZTtcbkNsaWVudE1lc3NhZ2UgPSBjbGFzcyBDbGllbnRNZXNzYWdlIHtcblx0Y29uc3RydWN0b3IodHlwZSkge1xuXHRcdHRoaXMudHlwZSA9IHR5cGU7XG5cdH1cblx0c3RhdGljIF9faXNUcmFuc2llbnQoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0c3RhdGljIF9fZ2V0Q2xhc3MoKSB7XG5cdFx0cmV0dXJuIFwiY2EuZmEuampqcm1pLnNvY2tldC5tZXNzYWdlLkNsaWVudE1lc3NhZ2VcIjtcblx0fVxuXHRzdGF0aWMgX19pc0VudW0oKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGdldFR5cGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMudHlwZTtcblx0fVxufTtcbmpqanJtaS5DbGllbnRNZXNzYWdlID0gQ2xpZW50TWVzc2FnZTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIpIG1vZHVsZS5leHBvcnRzID0gampqcm1pOyIsIi8qIGdsb2JhbCBTeW1ib2wgKi9cblxuQXJyYXlMaXN0ID0gY2xhc3MgQXJyYXlMaXN0IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50RGF0YSA9IFtdO1xuICAgIH1cbiAgICBzdGF0aWMgX19pc1RyYW5zaWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHN0YXRpYyBfX2dldENsYXNzKCkge1xuICAgICAgICByZXR1cm4gXCJqYXZhLnV0aWwuQXJyYXlMaXN0XCI7XG4gICAgfVxuICAgIHN0YXRpYyBfX2lzRW51bSgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhZGRBbGwoYykge1xuICAgICAgICBpZiAodHlwZW9mIGMgPT09IFwibnVtYmVyXCIpIHRocm93IG5ldyBFcnJvcihcInVuc3VwcG9ydGVkIGphdmEgdG8ganMgb3BlcmF0aW9uXCIpO1xuICAgICAgICBmb3IgKGxldCBlIG9mIGMpIHRoaXMuYWRkKGUpO1xuICAgIH1cbiAgICBpc0VtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaXplID09PSAwO1xuICAgIH1cbiAgICByZW1vdmVBbGwoYykge1xuICAgICAgICBmb3IgKGxldCBlIG9mIGMpe1xuICAgICAgICAgICAgdGhpcy5yZW1vdmUoZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0YWluQWxsKGMpIHtcbiAgICAgICAgbGV0IG5ld0VsZW1lbnREYXRhID0gW107XG4gICAgICAgIGZvciAobGV0IGUgb2YgYyl7XG4gICAgICAgICAgICBpZiAodGhpcy5jb250YWlucyhlKSkgbmV3RWxlbWVudERhdGEuYWRkKGUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWxlbWVudERhdGEgPSBuZXdFbGVtZW50RGF0YTtcbiAgICB9XG4gICAgc2l6ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudERhdGEubGVuZ3RoO1xuICAgIH1cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgbGV0IHRoYXQgPSBuZXcgQXJyYXlMaXN0KCk7XG4gICAgICAgIGZvciAobGV0IGUgb2YgdGhpcykge1xuICAgICAgICAgICAgdGhhdC5hZGQoZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoYXQ7XG4gICAgfVxuICAgIGdldChpbmRleCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50RGF0YVtpbmRleF07XG4gICAgfVxuICAgIHNldChpbmRleCwgZWxlbWVudCkge1xuICAgICAgICBsZXQgb2xkID0gdGhpcy5lbGVtZW50RGF0YVtpbmRleF07XG4gICAgICAgIHRoaXMuZWxlbWVudERhdGFbaW5kZXhdID0gZWxlbWVudDtcbiAgICAgICAgcmV0dXJuIG9sZDtcbiAgICB9XG4gICAgdG9BcnJheShhID0gW10pIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVsZW1lbnREYXRhLmxlbmd0aDsgaSsrKSBhW2ldID0gdGhpcy5lbGVtZW50RGF0YVtpXTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuICAgIGl0ZXJhdG9yKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bnN1cHBvcnRlZCBqYXZhIHRvIGpzIG9wZXJhdGlvblwiKTtcbiAgICB9XG4gICAgc3ViTGlzdChmcm9tSW5kZXgsIHRvSW5kZXgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5zdXBwb3J0ZWQgamF2YSB0byBqcyBvcGVyYXRpb25cIik7XG4gICAgfVxuICAgIGxpc3RJdGVyYXRvcigpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5zdXBwb3J0ZWQgamF2YSB0byBqcyBvcGVyYXRpb25cIik7XG4gICAgfVxuICAgIGxpc3RJdGVyYXRvcihpbmRleCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bnN1cHBvcnRlZCBqYXZhIHRvIGpzIG9wZXJhdGlvblwiKTtcbiAgICB9XG4gICAgYWRkKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuc3BsaWNlKGluZGV4LCAwLCBlbGVtZW50KTtcbiAgICB9XG4gICAgYWRkKGUpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50RGF0YS5wdXNoKGUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudERhdGEgPSBbXTtcbiAgICB9XG4gICAgY29udGFpbnMobykge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50RGF0YS5pbmRleE9mKG8pICE9PSAtMTtcbiAgICB9XG4gICAgaW5kZXhPZihvKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnREYXRhLmluZGV4T2Yobyk7XG4gICAgfVxuICAgIFtTeW1ib2wuaXRlcmF0b3JdICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudERhdGFbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICAgIH1cbiAgICBsYXN0SW5kZXhPZihvKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnREYXRhLmxhc3RJbmRleE9mKG8pO1xuICAgIH1cbiAgICByZW1vdmUoaW5kZXgpIHtcbiAgICAgICAgbGV0IHIgPSB0aGlzLmVsZW1lbnREYXRhLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiByWzBdO1xuICAgIH1cbiAgICByZW1vdmUobykge1xuICAgICAgICBsZXQgciA9IHRoaXMuZWxlbWVudERhdGEuc3BsaWNlKHRoaXMuaW5kZXhPZihvKSwgMSk7XG4gICAgICAgIHJldHVybiByWzBdO1xuICAgIH1cbiAgICByZW1vdmVSYW5nZShmcm9tSW5kZXgsIHRvSW5kZXgpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50RGF0YS5zcGxpY2UoZnJvbUluZGV4LCB0b0luZGV4IC0gZnJvbUluZGV4KTtcbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIikgbW9kdWxlLmV4cG9ydHMgPSBBcnJheUxpc3Q7IiwiLyogZ2xvYmFsIFN5bWJvbCAqL1xuXG5IYXNoTWFwID0gY2xhc3MgSGFzaE1hcCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMubWFwID0gbmV3IE1hcCgpO1xuICAgIH1cbiAgICBzdGF0aWMgX19pc1RyYW5zaWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHN0YXRpYyBfX2dldENsYXNzKCkge1xuICAgICAgICByZXR1cm4gXCJqYXZhLnV0aWwuSGFzaE1hcFwiO1xuICAgIH1cbiAgICBzdGF0aWMgX19pc0VudW0oKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGtleS12YWx1ZSBtYXBwaW5ncyBpbiB0aGlzIG1hcC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gdGhlIG51bWJlciBvZiBrZXktdmFsdWUgbWFwcGluZ3MgaW4gdGhpcyBtYXBcbiAgICAgKi9cbiAgICBzaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAuc2l6ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyA8dHQ+dHJ1ZTwvdHQ+IGlmIHRoaXMgbWFwIGNvbnRhaW5zIG5vIGtleS12YWx1ZSBtYXBwaW5ncy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4gPHR0PnRydWU8L3R0PiBpZiB0aGlzIG1hcCBjb250YWlucyBubyBrZXktdmFsdWUgbWFwcGluZ3NcbiAgICAgKi9cbiAgICBpc0VtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAuc2l6ZSA9PT0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdmFsdWUgdG8gd2hpY2ggdGhlIHNwZWNpZmllZCBrZXkgaXMgbWFwcGVkLFxuICAgICAqIG9yIHtAY29kZSBudWxsfSBpZiB0aGlzIG1hcCBjb250YWlucyBubyBtYXBwaW5nIGZvciB0aGUga2V5LlxuICAgICAqXG4gICAgICogPHA+TW9yZSBmb3JtYWxseSwgaWYgdGhpcyBtYXAgY29udGFpbnMgYSBtYXBwaW5nIGZyb20gYSBrZXlcbiAgICAgKiB7QGNvZGUga30gdG8gYSB2YWx1ZSB7QGNvZGUgdn0gc3VjaCB0aGF0IHtAY29kZSAoa2V5PT1udWxsID8gaz09bnVsbCA6XG4gICAgICoga2V5LmVxdWFscyhrKSl9LCB0aGVuIHRoaXMgbWV0aG9kIHJldHVybnMge0Bjb2RlIHZ9OyBvdGhlcndpc2VcbiAgICAgKiBpdCByZXR1cm5zIHtAY29kZSBudWxsfS4gIChUaGVyZSBjYW4gYmUgYXQgbW9zdCBvbmUgc3VjaCBtYXBwaW5nLilcbiAgICAgKlxuICAgICAqIDxwPkEgcmV0dXJuIHZhbHVlIG9mIHtAY29kZSBudWxsfSBkb2VzIG5vdCA8aT5uZWNlc3NhcmlseTwvaT5cbiAgICAgKiBpbmRpY2F0ZSB0aGF0IHRoZSBtYXAgY29udGFpbnMgbm8gbWFwcGluZyBmb3IgdGhlIGtleTsgaXQncyBhbHNvXG4gICAgICogcG9zc2libGUgdGhhdCB0aGUgbWFwIGV4cGxpY2l0bHkgbWFwcyB0aGUga2V5IHRvIHtAY29kZSBudWxsfS5cbiAgICAgKiBUaGUge0BsaW5rICNjb250YWluc0tleSBjb250YWluc0tleX0gb3BlcmF0aW9uIG1heSBiZSB1c2VkIHRvXG4gICAgICogZGlzdGluZ3Vpc2ggdGhlc2UgdHdvIGNhc2VzLlxuICAgICAqXG4gICAgICogQHNlZSAjcHV0KE9iamVjdCwgT2JqZWN0KVxuICAgICAqL1xuICAgIGdldChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwLmdldChrZXkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIDx0dD50cnVlPC90dD4gaWYgdGhpcyBtYXAgY29udGFpbnMgYSBtYXBwaW5nIGZvciB0aGVcbiAgICAgKiBzcGVjaWZpZWQga2V5LlxuICAgICAqXG4gICAgICogQHBhcmFtICAga2V5ICAgVGhlIGtleSB3aG9zZSBwcmVzZW5jZSBpbiB0aGlzIG1hcCBpcyB0byBiZSB0ZXN0ZWRcbiAgICAgKiBAcmV0dXJuIDx0dD50cnVlPC90dD4gaWYgdGhpcyBtYXAgY29udGFpbnMgYSBtYXBwaW5nIGZvciB0aGUgc3BlY2lmaWVkXG4gICAgICoga2V5LlxuICAgICAqL1xuICAgIGNvbnRhaW5zS2V5KGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAuaGFzKGtleSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFzc29jaWF0ZXMgdGhlIHNwZWNpZmllZCB2YWx1ZSB3aXRoIHRoZSBzcGVjaWZpZWQga2V5IGluIHRoaXMgbWFwLlxuICAgICAqIElmIHRoZSBtYXAgcHJldmlvdXNseSBjb250YWluZWQgYSBtYXBwaW5nIGZvciB0aGUga2V5LCB0aGUgb2xkXG4gICAgICogdmFsdWUgaXMgcmVwbGFjZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ga2V5IGtleSB3aXRoIHdoaWNoIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgdG8gYmUgYXNzb2NpYXRlZFxuICAgICAqIEBwYXJhbSB2YWx1ZSB2YWx1ZSB0byBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXlcbiAgICAgKiBAcmV0dXJuIHRoZSBwcmV2aW91cyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggPHR0PmtleTwvdHQ+LCBvclxuICAgICAqICAgICAgICAgPHR0Pm51bGw8L3R0PiBpZiB0aGVyZSB3YXMgbm8gbWFwcGluZyBmb3IgPHR0PmtleTwvdHQ+LlxuICAgICAqICAgICAgICAgKEEgPHR0Pm51bGw8L3R0PiByZXR1cm4gY2FuIGFsc28gaW5kaWNhdGUgdGhhdCB0aGUgbWFwXG4gICAgICogICAgICAgICBwcmV2aW91c2x5IGFzc29jaWF0ZWQgPHR0Pm51bGw8L3R0PiB3aXRoIDx0dD5rZXk8L3R0Pi4pXG4gICAgICovXG4gICAgcHV0KGtleSwgdmFsdWUpIHtcbiAgICAgICAgbGV0IHIgPSB0aGlzLmdldChrZXkpO1xuICAgICAgICB0aGlzLm1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiByO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgYWxsIG9mIHRoZSBtYXBwaW5ncyBmcm9tIHRoZSBzcGVjaWZpZWQgbWFwIHRvIHRoaXMgbWFwLlxuICAgICAqIFRoZXNlIG1hcHBpbmdzIHdpbGwgcmVwbGFjZSBhbnkgbWFwcGluZ3MgdGhhdCB0aGlzIG1hcCBoYWQgZm9yXG4gICAgICogYW55IG9mIHRoZSBrZXlzIGN1cnJlbnRseSBpbiB0aGUgc3BlY2lmaWVkIG1hcC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBtIG1hcHBpbmdzIHRvIGJlIHN0b3JlZCBpbiB0aGlzIG1hcFxuICAgICAqIEB0aHJvd3MgTnVsbFBvaW50ZXJFeGNlcHRpb24gaWYgdGhlIHNwZWNpZmllZCBtYXAgaXMgbnVsbFxuICAgICAqL1xuICAgIHB1dEFsbCh0aGF0KSB7XG5cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgbWFwcGluZyBmb3IgdGhlIHNwZWNpZmllZCBrZXkgZnJvbSB0aGlzIG1hcCBpZiBwcmVzZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtICBrZXkga2V5IHdob3NlIG1hcHBpbmcgaXMgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBtYXBcbiAgICAgKiBAcmV0dXJuIHRoZSBwcmV2aW91cyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggPHR0PmtleTwvdHQ+LCBvclxuICAgICAqICAgICAgICAgPHR0Pm51bGw8L3R0PiBpZiB0aGVyZSB3YXMgbm8gbWFwcGluZyBmb3IgPHR0PmtleTwvdHQ+LlxuICAgICAqICAgICAgICAgKEEgPHR0Pm51bGw8L3R0PiByZXR1cm4gY2FuIGFsc28gaW5kaWNhdGUgdGhhdCB0aGUgbWFwXG4gICAgICogICAgICAgICBwcmV2aW91c2x5IGFzc29jaWF0ZWQgPHR0Pm51bGw8L3R0PiB3aXRoIDx0dD5rZXk8L3R0Pi4pXG4gICAgICovXG4gICAgcmVtb3ZlKGtleSkge1xuICAgICAgICBsZXQgciA9IHRoaXMuZ2V0KGtleSk7XG4gICAgICAgIHRoaXMubWFwLmRlbGV0ZShrZXkpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgb2YgdGhlIG1hcHBpbmdzIGZyb20gdGhpcyBtYXAuXG4gICAgICogVGhlIG1hcCB3aWxsIGJlIGVtcHR5IGFmdGVyIHRoaXMgY2FsbCByZXR1cm5zLlxuICAgICAqL1xuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLm1hcC5jbGVhcigpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIDx0dD50cnVlPC90dD4gaWYgdGhpcyBtYXAgbWFwcyBvbmUgb3IgbW9yZSBrZXlzIHRvIHRoZVxuICAgICAqIHNwZWNpZmllZCB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB2YWx1ZSB2YWx1ZSB3aG9zZSBwcmVzZW5jZSBpbiB0aGlzIG1hcCBpcyB0byBiZSB0ZXN0ZWRcbiAgICAgKiBAcmV0dXJuIDx0dD50cnVlPC90dD4gaWYgdGhpcyBtYXAgbWFwcyBvbmUgb3IgbW9yZSBrZXlzIHRvIHRoZVxuICAgICAqICAgICAgICAgc3BlY2lmaWVkIHZhbHVlXG4gICAgICovXG4gICAgY29udGFpbnNWYWx1ZSh2YWx1ZSkge1xuICAgICAgICBmb3IgKGxldCB2IG9mIHRoaXMubWFwLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBpZiAodiA9PT0gdmFsdWUpIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBTZXR9IHZpZXcgb2YgdGhlIGtleXMgY29udGFpbmVkIGluIHRoaXMgbWFwLlxuICAgICAqIFRoZSBzZXQgaXMgYmFja2VkIGJ5IHRoZSBtYXAsIHNvIGNoYW5nZXMgdG8gdGhlIG1hcCBhcmVcbiAgICAgKiByZWZsZWN0ZWQgaW4gdGhlIHNldCwgYW5kIHZpY2UtdmVyc2EuICBJZiB0aGUgbWFwIGlzIG1vZGlmaWVkXG4gICAgICogd2hpbGUgYW4gaXRlcmF0aW9uIG92ZXIgdGhlIHNldCBpcyBpbiBwcm9ncmVzcyAoZXhjZXB0IHRocm91Z2hcbiAgICAgKiB0aGUgaXRlcmF0b3IncyBvd24gPHR0PnJlbW92ZTwvdHQ+IG9wZXJhdGlvbiksIHRoZSByZXN1bHRzIG9mXG4gICAgICogdGhlIGl0ZXJhdGlvbiBhcmUgdW5kZWZpbmVkLiAgVGhlIHNldCBzdXBwb3J0cyBlbGVtZW50IHJlbW92YWwsXG4gICAgICogd2hpY2ggcmVtb3ZlcyB0aGUgY29ycmVzcG9uZGluZyBtYXBwaW5nIGZyb20gdGhlIG1hcCwgdmlhIHRoZVxuICAgICAqIDx0dD5JdGVyYXRvci5yZW1vdmU8L3R0PiwgPHR0PlNldC5yZW1vdmU8L3R0PixcbiAgICAgKiA8dHQ+cmVtb3ZlQWxsPC90dD4sIDx0dD5yZXRhaW5BbGw8L3R0PiwgYW5kIDx0dD5jbGVhcjwvdHQ+XG4gICAgICogb3BlcmF0aW9ucy4gIEl0IGRvZXMgbm90IHN1cHBvcnQgdGhlIDx0dD5hZGQ8L3R0PiBvciA8dHQ+YWRkQWxsPC90dD5cbiAgICAgKiBvcGVyYXRpb25zLlxuICAgICAqL1xuICAgIGtleVNldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwLmtleXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBDb2xsZWN0aW9ufSB2aWV3IG9mIHRoZSB2YWx1ZXMgY29udGFpbmVkIGluIHRoaXMgbWFwLlxuICAgICAqIFRoZSBjb2xsZWN0aW9uIGlzIGJhY2tlZCBieSB0aGUgbWFwLCBzbyBjaGFuZ2VzIHRvIHRoZSBtYXAgYXJlXG4gICAgICogcmVmbGVjdGVkIGluIHRoZSBjb2xsZWN0aW9uLCBhbmQgdmljZS12ZXJzYS4gIElmIHRoZSBtYXAgaXNcbiAgICAgKiBtb2RpZmllZCB3aGlsZSBhbiBpdGVyYXRpb24gb3ZlciB0aGUgY29sbGVjdGlvbiBpcyBpbiBwcm9ncmVzc1xuICAgICAqIChleGNlcHQgdGhyb3VnaCB0aGUgaXRlcmF0b3IncyBvd24gPHR0PnJlbW92ZTwvdHQ+IG9wZXJhdGlvbiksXG4gICAgICogdGhlIHJlc3VsdHMgb2YgdGhlIGl0ZXJhdGlvbiBhcmUgdW5kZWZpbmVkLiAgVGhlIGNvbGxlY3Rpb25cbiAgICAgKiBzdXBwb3J0cyBlbGVtZW50IHJlbW92YWwsIHdoaWNoIHJlbW92ZXMgdGhlIGNvcnJlc3BvbmRpbmdcbiAgICAgKiBtYXBwaW5nIGZyb20gdGhlIG1hcCwgdmlhIHRoZSA8dHQ+SXRlcmF0b3IucmVtb3ZlPC90dD4sXG4gICAgICogPHR0PkNvbGxlY3Rpb24ucmVtb3ZlPC90dD4sIDx0dD5yZW1vdmVBbGw8L3R0PixcbiAgICAgKiA8dHQ+cmV0YWluQWxsPC90dD4gYW5kIDx0dD5jbGVhcjwvdHQ+IG9wZXJhdGlvbnMuICBJdCBkb2VzIG5vdFxuICAgICAqIHN1cHBvcnQgdGhlIDx0dD5hZGQ8L3R0PiBvciA8dHQ+YWRkQWxsPC90dD4gb3BlcmF0aW9ucy5cbiAgICAgKi9cbiAgICB2YWx1ZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcC52YWx1ZXMoKTtcbiAgICB9XG5cbiAgICBfX2RlY29kZShyZXNPYmopIHtcbiAgICAgICAgbGV0IGtleXMgPSBudWxsO1xuICAgICAgICBsZXQgdmFsdWVzID0gbnVsbDtcblxuICAgICAgICBsZXQgY2IxID0gZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgIGtleXMgPSByO1xuICAgICAgICAgICAgcmVzT2JqLmRlY29kZUZpZWxkKFwidmFsdWVzXCIsIGNiMik7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGNiMiA9IGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSByO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wdXQoa2V5c1tpXSwgdmFsdWVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHJlc09iai5kZWNvZGVGaWVsZChcImtleXNcIiwgY2IxKTtcbiAgICB9XG5cbiAgICBfX2VuY29kZShlbmNvZGVkT2JqZWN0KSB7XG4gICAgICAgIGxldCBrZXlzID0gW107XG4gICAgICAgIGxldCB2YWx1ZXMgPSBbXTtcblxuICAgICAgICB0aGlzLm1hcC5mb3JFYWNoKCh2YWx1ZSwga2V5KT0+e1xuICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICB2YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVuY29kZWRPYmplY3Quc2V0RmllbGQoXCJrZXlzXCIsIGtleXMpO1xuICAgICAgICBlbmNvZGVkT2JqZWN0LnNldEZpZWxkKFwidmFsdWVzXCIsIHZhbHVlcyk7XG4gICAgfVxufTtcblxuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIikgbW9kdWxlLmV4cG9ydHMgPSBIYXNoTWFwOyJdfQ==
