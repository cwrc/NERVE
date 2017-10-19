let Constants = {};
Constants.KeyParam = "key";
Constants.FlagParam = "flags";
Constants.TypeParam = "type";
Constants.PrimitiveParam = "primitive";
Constants.ValueParam = "value";
Constants.FieldsParam = "fields";
Constants.NameParam = "name";
Constants.ElementsParam = "elements";
Constants.DepthParam = "depth";
Constants.PointerParam = "ptr";
Constants.TransientValue = "trans";
Constants.NullValue = "null";
Constants.EnumParam = "enum";/* global Constants, JJJRMISocket */

class Decoder {
    constructor(json, objectMap, jjjWebsocket) {
        if (typeof json === "string") this.json = JSON.parse(json);
        else this.json = json;
        this.objectMap = objectMap;
        this.jjjWebsocket = jjjWebsocket;
    }

    decode() {
        if (typeof this.json[Constants.TypeParam] !== "undefined" && this.json[Constants.TypeParam] === Constants.NullValue){
            return null;
        } else if (typeof this.json[Constants.PointerParam] !== "undefined") {
            return this.objectMap.get(this.json[Constants.PointerParam]);
        }else if (typeof this.json[Constants.EnumParam] !== "undefined") {
            let className = this.json[Constants.EnumParam];
            let fieldName = this.json[Constants.ValueParam];
            let aClass = JJJRMISocket.classes.get(className);
            return aClass[fieldName];
        } else if (typeof this.json[Constants.ValueParam] !== "undefined") {
            return this.json[Constants.ValueParam];
        } else if (typeof this.json[Constants.ElementsParam] !== "undefined") {
            return new RestoredArray(this.json, this.objectMap).toObject();
        } else if (typeof this.json[Constants.FieldsParam] !== "undefined") {
            return new RestoredObject(this.json, this.objectMap, this.jjjWebsocket).toObject();
        } else {
            console.log("Unknown object type during decoding");
            console.log(this.json);
            console.log("+---------------------------------+");
            window.debug = this;
            throw new Error("Unknown object type during decoding");
        }
    }
}

class RestoredArray {
    constructor(json, objectMap) {
        this.json = json;
        this.objectMap = objectMap;
    }
    toObject() {
        let elements = this.json[Constants.ElementsParam];
        if (typeof this.json[Constants.KeyParam] !== "undefined") {
            this.objectMap.set(this.json[Constants.KeyParam], elements);
        }
        this.decodeArray(elements);
        return elements;
    }
    decodeArray(elements) {
        for (let i = 0; i < elements.length; i++) {
            if (elements[i] instanceof Array) {
                this.decodeArray(elements[i]);
            } else {
                let decoder = new Decoder(elements[i], this.objectMap);
                elements[i] = decoder.decode();
            }
        }
    }
}
class RestoredObject {
    constructor(json, objectMap, jjjWebsocket) {
        this.json = json;
        this.objectMap = objectMap;
        this.jjjWebsocket = jjjWebsocket;
    }
    toObject(object = null) {
        let className = this.json[Constants.TypeParam];
        let aClass = JJJRMISocket.classes.get(className);

        if (typeof aClass === "undefined") throw new Error(`Class ${className} not found`);
        if (object === null) object = new aClass();

        if (typeof object.__isTransient !== "function"){
            window.object = object;
            throw new Error(`Field '__isTransient' of class '${object.constructor.name}' is not of type function, found type '${typeof object.__isTransient}'.`);
        }

        if (!object.__isTransient() && typeof this.json[Constants.KeyParam] !== "undefined") {
            this.objectMap.set(this.json[Constants.KeyParam], object);
        }

        for (let field in this.json[Constants.FieldsParam]) {
            let decoder = new Decoder(this.json[Constants.FieldsParam][field], this.objectMap, this.jjjWebsocket);
            object[field] = decoder.decode();
        }

        object.__jjjWebsocket = this.jjjWebsocket;
        return object;
    }
}/* global Constants */

class Encoder {
    constructor(object, objectMap, keys) {
        this.object = object;
        this.objectMap = objectMap;
        this.keys = keys;
    }
    encode() {
        if (typeof this.object === "undefined" || this.object === null){
            return new EncodedNull().toJSON();
        } else if (typeof this.object === "number" || typeof this.object === "string" || typeof this.object === "boolean") {
            return new EncodedPrimitive(this.object).toJSON();
        } else if (this.objectMap.hasValue(this.object)) {
            return new EncodedReference(this.objectMap.getKey(this.object)).toJSON();
        } else if (this.object instanceof Array) {
            return new EncodedArray(this.object, this.objectMap, this.keys).toJSON();
        }

        if (typeof this.object.__isEnum === "undefined") return null;
        if (typeof this.object.__getClass === "undefined") return null;

        if (this.object.__isEnum()) {
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
        let depth = this.setValues(0, this.json[Constants.ElementsParam], this.object);
        this.json[Constants.DepthParam] = depth;
    }
    setValues(depth, parent, current) {
        for (let i = 0; i < current.length; i++) {
            let element = current[i];
            if (element instanceof Array) {
                let jsonArray = [];
                parent.push(jsonArray);
                this.setValues(depth + 1, jsonArray, current[i]);
            } else {
                parent.push(new Encoder(element, this.objectMap, this.keys).encode());
            }
        }
        return depth + 1;
    }
    toJSON() {
        return this.json;
    }
}

class EncodedEnum {
    constructor(object, objectMap, keys) {
        this.json = {};
        this.json[Constants.ValueParam] = object.toString();
        this.json[Constants.EnumParam] = object.__getClass();
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

        if (typeof object.__isTransient !== "function"){
            window.object = object;
            throw new Error(`Field '__isTransient' of class '${object.constructor.name}' is not of type function, found type '${typeof object.__isTransient}'.`);
        }

        if (!object.__isTransient()){
            let key = keys.allocNextKey();
            this.json[Constants.KeyParam] = key;
            objectMap.set(key, object);
        }

        this.json[Constants.TypeParam] = object.__getClass();
        this.json[Constants.FieldsParam] = {};
        this.encode();


    }
    encode() {
        for (let field in this.object) {
            this.json[Constants.FieldsParam][field] = new Encoder(this.object[field], this.objectMap, this.keys).encode();
        }
    }
    toJSON() {
        return this.json;
    }
}/* global RMIMessageType */

class JJJRMISocket {
    constructor(socketName, parent) {
        this.parent = parent;
        this.jjjSocketName = socketName;
        this.translator = new Translator(this);
        this.callback = {};
    }
    async connect(url) {
        if (!url) url = this.getAddress();

        let cb = function (resolve, reject) {
            this.socket = new WebSocket(url);
            this.onready = resolve;
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
        pathname = pathname.substr(0, pathname.lastIndexOf("/"));
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
        if (!this.translator.hasObject(src)) throw new Error("Attempting to call remote method on unknown object");
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
            let encodedString = JSON.stringify(encodedPacket, null, 4);
            if (JJJRMISocket.devmode >= 3) console.log(encodedString);
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
        if (JJJRMISocket.devmode >= 2) console.log(rmiMessage);

        switch (rmiMessage.type) {
            case RMIMessageType.LOAD:{
                if (JJJRMISocket.devmode >= 1) console.log(this.jjjSocketName + " LOAD");
                this.copyFields(rmiMessage.source, this.parent);
                this.translator.swap(this.parent, rmiMessage.source);
                break;
            }
            case RMIMessageType.READY:{
                if (JJJRMISocket.devmode >= 1) console.log(this.jjjSocketName + " READY");
                this.onready();
                break;
            }
            /* client originated request */
            case RMIMessageType.LOCAL:{
                if (JJJRMISocket.devmode >= 1) console.log(this.jjjSocketName + " LOCAL " + rmiMessage.methodName);
                let callback = this.callback[rmiMessage.uid];
                delete(this.callback[rmiMessage.uid]);
                callback.resolve(rmiMessage.rvalue);
                break;
            }
            /* server originated request */
            case RMIMessageType.REMOTE:{
                if (JJJRMISocket.devmode >= 1) console.log(this.jjjSocketName + ":" + rmiMessage.methodName + " SERVER");
                let target = this.translator.getObject(rmiMessage.ptr);
                let r = this.remoteMethodCallback(target, rmiMessage.methodName, rmiMessage.args);
                let response = new InvocationResponse(rmiMessage.uid, r, InvocationResponseCode.SUCCESS);
                let encodedResponse = this.translator.encode(response);
                let encodedString = JSON.stringify(encodedResponse, null, 4);
                this.socket.send(encodedString);
                break;
            }
            case RMIMessageType.EXCEPTION:{
                if (JJJRMISocket.devmode >= 1) console.log(this.jjjSocketName + " EXCEPTION " + rmiMessage.methodName);
                if (JJJRMISocket.devmode >= 0) console.warn(rmiMessage);
                let callback = this.callback[rmiMessage.uid];
                delete(this.callback[rmiMessage.uid]);
                callback.reject(rmiMessage);
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
            if (JJJRMISocket.devmode >= 0) console.warn(this.socket.url + ":" + target.constructor.name + " does not have remotely invokable method '" + methodName + "'.");
        } else {
            return target[methodName].apply(target, args);
        }
    }
}

JJJRMISocket.classes = new Map();
JJJRMISocket.devmode = 0;
class BiMap{
    constructor(){
        this.objectMap = new Map();
        this.reverseMap = new Map();
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
    constructor(jjjWebsocket){
        this.objectMap = new BiMap();
        this.next = -1;
        this.jjjWebsocket = jjjWebsocket;
    }

    clear(){
    }

    encode(object){
        return new Encoder(object, this.objectMap, this).encode();
    }

    decode(jsonObject){
        return new Decoder(jsonObject, this.objectMap, this.jjjWebsocket).decode();
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

    /* remove target formt he translator replacing it with source, maintaining the same key */
    swap(source, target){
        this.objectMap.swap(source, target);
    }
}ServerSideException = class ServerSideException {
	constructor() {
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.ServerSideException";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.ServerSideException", ServerSideException);
RMIServerResponse = class RMIServerResponse {
	constructor() {
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.RMIServerResponse";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.RMIServerResponse", RMIServerResponse);
RMIMessageType = class RMIMessageType {
	constructor(value) {
		this.__value = value;
	}
	toString() {
		return this.__value;
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.RMIMessageType";
	}
	__isEnum() {
		return true;
	}
};
RMIMessageType.LOCAL = new RMIMessageType("LOCAL");
RMIMessageType.REMOTE = new RMIMessageType("REMOTE");
RMIMessageType.READY = new RMIMessageType("READY");
RMIMessageType.LOAD = new RMIMessageType("LOAD");
RMIMessageType.EXCEPTION = new RMIMessageType("EXCEPTION");
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.RMIMessageType", RMIMessageType);
RMIMessage = class RMIMessage {
	constructor() {
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.RMIMessage";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.RMIMessage", RMIMessage);
RMILoadMessage = class RMILoadMessage {
	constructor() {
		
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.RMILoadMessage";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.RMILoadMessage", RMILoadMessage);
MethodResponse = class MethodResponse {
	constructor(uid, objectPTR, methodName, rvalue) {
		this.uid = uid;
		this.methodName = methodName;
		this.rvalue = rvalue;
		this.objectPTR = objectPTR;
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.MethodResponse";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.MethodResponse", MethodResponse);
MethodRequest = class MethodRequest {
	constructor(uid, ptr, methodName, args) {
		this.uid = uid;
		this.objectPTR = ptr;
		this.methodName = methodName;
		this.methodArguments = args;
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.MethodRequest";
	}
	__isEnum() {
		return false;
	}
	update(parameters) {
		for(let i = 0; i < parameters.length; i++){
			let parameter = parameters[i];
			if (this.methodArguments[i] === null)continue;
			
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
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.MethodRequest", MethodRequest);
InvocationResponseCode = class InvocationResponseCode {
	constructor(value) {
		this.__value = value;
	}
	toString() {
		return this.__value;
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.InvocationResponseCode";
	}
	__isEnum() {
		return true;
	}
};
InvocationResponseCode.FAILED = new InvocationResponseCode("FAILED");
InvocationResponseCode.SUCCESS = new InvocationResponseCode("SUCCESS");
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.InvocationResponseCode", InvocationResponseCode);
InvocationResponse = class InvocationResponse {
	constructor(uid, rvalue, code) {
		this.uid = uid;
		this.returnValue = rvalue;
		this.code = code;
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.InvocationResponse";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.InvocationResponse", InvocationResponse);
InvocationAsyncRequest = class InvocationAsyncRequest {
	constructor() {
		this.cancelled = false;
		this.done = false;
		this.consumer = null;
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.InvocationAsyncRequest";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.InvocationAsyncRequest", InvocationAsyncRequest);
ClientMessageType = class ClientMessageType {
	constructor(value) {
		this.__value = value;
	}
	toString() {
		return this.__value;
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.ClientMessageType";
	}
	__isEnum() {
		return true;
	}
};
ClientMessageType.METHOD_REQUEST = new ClientMessageType("METHOD_REQUEST");
ClientMessageType.INVOCATION_RESPONSE = new ClientMessageType("INVOCATION_RESPONSE");
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.ClientMessageType", ClientMessageType);
ClientMessage = class ClientMessage {
	constructor(type) {
		this.type = type;
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.ClientMessage";
	}
	__isEnum() {
		return false;
	}
	getType() {
		return this.type;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.ClientMessage", ClientMessage);
/* global Symbol */

ArrayList = class ArrayList {
    constructor() {
        this.elementData = [];
    }
    __isTransient() {
        return false;
    }
    __getClass() {
        return "java.util.ArrayList";
    }
    __isEnum() {
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
        let r = this.elementData.splice(indexOf(o), 1);
        return r[0];
    }
    removeRange(fromIndex, toIndex) {
        this.elementData.splice(fromIndex, toIndex - fromIndex);
    }
};
JJJRMISocket.classes.set("java.util.ArrayList", ArrayList);