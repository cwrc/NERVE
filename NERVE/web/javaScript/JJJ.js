let Constants = {};
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
Constants.EnumParam = "enum";/* global Constants, JJJRMISocket */

class Decoder {
    constructor(json, objectMap, jjjWebsocket, deferred) {
        if (typeof json === "undefined") {
            console.log(json);
            throw new Error("undefined json object");
        }

        if (typeof json === "string") this.json = JSON.parse(json);
        else this.json = json;
        this.objectMap = objectMap;
        this.jjjWebsocket = jjjWebsocket;
        this.deferred = deferred;
        if (typeof deferred === "undefined") throw new Error("undefined deferred");
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
            let aClass = JJJRMISocket.classes.get(className);

            if (typeof aClass === "undefined") {
                throw new Error("classname '" + className + "' not found");
            }

            result = aClass[fieldName];
        } else if (typeof this.json[Constants.ValueParam] !== "undefined") {
            result = this.json[Constants.ValueParam];
        } else if (typeof this.json[Constants.ElementsParam] !== "undefined") {
            result = new RestoredArray(this.json, this.objectMap, this.webSocket, this.deferred).toObject();
        } else if (typeof this.json[Constants.FieldsParam] !== "undefined") {
            result = new RestoredObject(this.json, this.objectMap, this.jjjWebsocket, this.deferred).toObject();
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
    constructor(json, objectMap, webSocket, deferred) {
        this.json = json;
        this.objectMap = objectMap;
        this.webSocket = webSocket;
        this.elements = this.json[Constants.ElementsParam];
        this.deferred = deferred;

        this.restoreCount = 0;
        this.retArray = [];

        if (typeof deferred === "undefined") throw new Error("undefined deferred");
    }
    toObject() {
        this.decodeArray();
        if (this.restoreCount === this.elements.length) return this.retArray;
        return undefined;
    }
    decodeArray() {
        for (let i = 0; i < this.elements.length; i++) {
            let decoder = new Decoder(this.elements[i], this.objectMap, this.webSocket, this.deferred);
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
    constructor(json, objectMap, jjjWebsocket, deferred) {
        this.json = json;
        this.objectMap = objectMap;
        this.jjjWebsocket = jjjWebsocket;
        this.deferred = deferred;
        if (typeof deferred === "undefined") throw new Error("undefined deferred");
    }
    decodeField(field, callback) {
        let decoder = new Decoder(this.json[Constants.FieldsParam][field], this.objectMap, this.jjjWebsocket, this.deferred);
        decoder.decode(callback);
    }
    toObject(object = null) {
        let className = this.json[Constants.TypeParam];
        let aClass = JJJRMISocket.classes.get(className);

        if (typeof aClass === "undefined") throw new Error(`Class ${className} not found`);
        if (object === null) object = new aClass();

        if (typeof object.__isTransient !== "function") {
            window.object = object;
            throw new Error(`Field '__isTransient' of class '${object.constructor.name}' is not of type function, found type '${typeof object.__isTransient}'.`);
        }

        if (this.jjjWebsocket !== null && !object.__isTransient() && typeof this.json[Constants.KeyParam] !== "undefined") {
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
}/* global Constants */

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

        if (typeof object.__isTransient !== "function") {
            window.object = object;
            throw new Error(`Field '__isTransient' of class '${object.constructor.name}' is not of type function, found type '${typeof object.__isTransient}'.`);
        }

        if (!object.__isTransient()) {
            let key = keys.allocNextKey();
            this.json[Constants.KeyParam] = key;
            objectMap.set(key, object);
        }

        this.json[Constants.TypeParam] = object.__getClass();
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
}/* global RMIMessageType */
Console = console;

JJJLogFlags = {
    SILENT: false,
    CONNECT : false,
    ONMESSAGE: false, /* show that a server object has been received and an action may be taken */
    SENT: false,
    RECEIVED: false, /* show the received server object, verbose shows the text as well */
    VERBOSE: false
};

class JJJRMISocket {
    constructor(socketName, parent) {
        this.parent = parent;
        this.jjjSocketName = socketName;
        this.translator = new Translator(this);
        this.callback = {};
    }
    async connect(url) {
        if (JJJLogFlags.CONNECT) console.log(`${this.jjjSocketName} connecting`);
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
            if (JJJLogFlags.SENT) console.log(encodedPacket);
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
        if (JJJLogFlags.RECEIVED && JJJLogFlags.VERBOSE){
            let json = JSON.parse(evt.data);
            console.log(JSON.stringify(json, null, 2));
        }
        if (JJJLogFlags.RECEIVED) console.log(rmiMessage);

        switch (rmiMessage.type) {
            case RMIMessageType.FORGET:{
                if (JJJLogFlags.CONNECT) console.log(this.jjjSocketName + " FORGET");
                if (JJJLogFlags.ONMESSAGE) console.log(this.jjjSocketName + " FORGET");
                this.translator.removeKey(rmiMessage.key);
                break;
            }
            case RMIMessageType.LOAD:{
                if (JJJLogFlags.CONNECT) console.log(this.jjjSocketName + " LOAD");
                if (JJJLogFlags.ONMESSAGE) console.log(this.jjjSocketName + " LOAD");
                this.copyFields(rmiMessage.source, this.parent);
                this.translator.swap(this.parent, rmiMessage.source);
                break;
            }
            case RMIMessageType.READY:{
                if (JJJLogFlags.CONNECT || JJJLogFlags.ONMESSAGE) console.log(this.jjjSocketName + " READY");
                this.onready();
                break;
            }
            /* client originated request */
            case RMIMessageType.LOCAL:{
                if (JJJLogFlags.ONMESSAGE) console.log(`Response to client side request: ${this.jjjSocketName} ${rmiMessage.methodName}`);
                let callback = this.callback[rmiMessage.uid];
                delete(this.callback[rmiMessage.uid]);
                callback.resolve(rmiMessage.rvalue);
                break;
            }
            /* server originated request */
            case RMIMessageType.REMOTE:{
                let target = this.translator.getObject(rmiMessage.ptr);
                let r = this.remoteMethodCallback(target, rmiMessage.methodName, rmiMessage.args);
                let response = new InvocationResponse(rmiMessage.uid, InvocationResponseCode.SUCCESS);
                let encodedResponse = this.translator.encode(response);
                let encodedString = JSON.stringify(encodedResponse, null, 4);

                if (JJJLogFlags.ONMESSAGE) console.log(`Server side request: ${this.jjjSocketName} ${target.constructor.name}.${rmiMessage.methodName}`);
                this.socket.send(encodedString);
                break;
            }
            case RMIMessageType.EXCEPTION:{
                if (!JJJLogFlags.SILENT) console.log(this.jjjSocketName + " EXCEPTION " + rmiMessage.methodName);
                if (!JJJLogFlags.SILENT) console.warn(rmiMessage);
                let callback = this.callback[rmiMessage.uid];
                delete(this.callback[rmiMessage.uid]);
                callback.reject(rmiMessage);
                break;
            }
            case RMIMessageType.REJECTED_CONNECTION:{
                if (JJJLogFlags.CONNECT || JJJLogFlags.ONMESSAGE) console.log(this.jjjSocketName + " REJECTED_CONNECTION");
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
}

JJJRMISocket.classes = new Map();

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
    constructor(jjjWebsocket){
        this.objectMap = new BiMap();
        this.next = -1;
        this.jjjWebsocket = jjjWebsocket;
        this.deferred = [];
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
        new Decoder(jsonObject, this.objectMap, this.jjjWebsocket, this.deferred).decode((r)=>result = r);

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
}ServerSideExceptionMessage = class ServerSideExceptionMessage {
	constructor() {
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.message.ServerSideExceptionMessage";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.ServerSideExceptionMessage", ServerSideExceptionMessage);
ServerResponseMessage = class ServerResponseMessage {
	constructor() {
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.message.ServerResponseMessage";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.ServerResponseMessage", ServerResponseMessage);
RejectedConnectionMessage = class RejectedConnectionMessage {
	constructor() {
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.message.RejectedConnectionMessage";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.RejectedConnectionMessage", RejectedConnectionMessage);
ReadyMessage = class ReadyMessage {
	constructor() {
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.message.ReadyMessage";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.ReadyMessage", ReadyMessage);
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
		return "ca.fa.jjjrmi.socket.message.RMIMessageType";
	}
	__isEnum() {
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
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.RMIMessageType", RMIMessageType);
RMIMessage = class RMIMessage {
	constructor() {
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.message.RMIMessage";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.RMIMessage", RMIMessage);
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
		return "ca.fa.jjjrmi.socket.message.MethodResponse";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.MethodResponse", MethodResponse);
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
		return "ca.fa.jjjrmi.socket.message.MethodRequest";
	}
	__isEnum() {
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
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.MethodRequest", MethodRequest);
LoadMessage = class LoadMessage {
	constructor() {
		
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.message.LoadMessage";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.LoadMessage", LoadMessage);
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
		return "ca.fa.jjjrmi.socket.message.InvocationResponseCode";
	}
	__isEnum() {
		return true;
	}
};
InvocationResponseCode.valueArray = [];
InvocationResponseCode.valueArray.push(InvocationResponseCode.FAILED = new InvocationResponseCode("FAILED"));
InvocationResponseCode.valueArray.push(InvocationResponseCode.SUCCESS = new InvocationResponseCode("SUCCESS"));
InvocationResponseCode.values = function(){return InvocationResponseCode.valueArray;};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.InvocationResponseCode", InvocationResponseCode);
InvocationResponse = class InvocationResponse {
	constructor(uid, code) {
		this.uid = uid;
		this.code = code;
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.message.InvocationResponse";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.InvocationResponse", InvocationResponse);
ForgetMessage = class ForgetMessage {
	constructor() {
		
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.message.ForgetMessage";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.ForgetMessage", ForgetMessage);
ClientRequestMessage = class ClientRequestMessage {
	constructor() {
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.message.ClientRequestMessage";
	}
	__isEnum() {
		return false;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.ClientRequestMessage", ClientRequestMessage);
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
		return "ca.fa.jjjrmi.socket.message.ClientMessageType";
	}
	__isEnum() {
		return true;
	}
};
ClientMessageType.valueArray = [];
ClientMessageType.valueArray.push(ClientMessageType.METHOD_REQUEST = new ClientMessageType("METHOD_REQUEST"));
ClientMessageType.valueArray.push(ClientMessageType.INVOCATION_RESPONSE = new ClientMessageType("INVOCATION_RESPONSE"));
ClientMessageType.values = function(){return ClientMessageType.valueArray;};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.ClientMessageType", ClientMessageType);
ClientMessage = class ClientMessage {
	constructor(type) {
		this.type = type;
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.jjjrmi.socket.message.ClientMessage";
	}
	__isEnum() {
		return false;
	}
	getType() {
		return this.type;
	}
};
JJJRMISocket.classes.set("ca.fa.jjjrmi.socket.message.ClientMessage", ClientMessage);
/* global Symbol */

ArrayList = class ArrayList {
    constructor() {
        this.elementData = [];
    }
    __isTransient() {
        return true;
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
        let r = this.elementData.splice(this.indexOf(o), 1);
        return r[0];
    }
    removeRange(fromIndex, toIndex) {
        this.elementData.splice(fromIndex, toIndex - fromIndex);
    }
};
JJJRMISocket.classes.set("java.util.ArrayList", ArrayList);/* global Symbol */

HashMap = class HashMap {
    constructor() {
        this.map = new Map();
    }
    __isTransient() {
        return true;
    }
    __getClass() {
        return "java.util.HashMap";
    }
    __isEnum() {
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
JJJRMISocket.classes.set("java.util.HashMap", HashMap);