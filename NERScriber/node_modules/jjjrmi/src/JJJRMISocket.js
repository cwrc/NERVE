let Translator = require("./Translator");
let jjjrmi = require("./gen/package");
let ArrayList = require("./java-equiv/ArrayList");
let HashMap = require("./java-equiv/HashMap");

class JJJRMISocket {
    constructor(socketName) {
        this.jjjSocketName = socketName;
        this.translator = new Translator();
        this.callback = {};
        this.flags = Object.assign(JJJRMISocket.flags);
        this.socket = null;
        this.translator.copyFrom(JJJRMISocket.classes);

        this.translator.addDecodeListener(obj=>obj.__jjjWebsocket = this);
        this.translator.addEncodeListener(obj=>obj.__jjjWebsocket = this);
        this.jjjEncode = null;
    }

    getHandler(aClass) {
        return this.translator.getHandler(aClass);
    }
    hasHandler(aClass) {
        return this.translator.hasHandler(aClass);
    }
    setHandler(aClass, handler) {
        this.translator.setHandler(aClass, handler);
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

    reset(){
        this.translator.clear();
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
        if (!this.translator.hasReferredObject(src)){
            console.warn("see window.debug for source");
            window.debug = src;
            throw new Error(`Attempting to call server side method on non-received object: ${src.constructor.name}.${methodName}`);
        }
        let uid = this.nextUID++;
        let ptr = this.translator.getReference(src);

        let argsArray = [];
        for (let i in args) argsArray.push(args[i]);

        let f = function (resolve, reject) {
            this.callback[uid] = {
                resolve: resolve,
                reject: reject
            };
            let packet = new jjjrmi.MethodRequest(uid, ptr, methodName, argsArray);
            let encodedPacket = this.translator.encode(packet);
            if (this.flags.SENT) console.log(encodedPacket);
            let encodedString = JSON.stringify(encodedPacket, null, 4);
            if (this.flags.SENT && this.flags.VERBOSE) console.log(encodedString);

            if (this.socket !== null) this.socket.send(encodedString);
            else console.warn(`Socket "${this.socketName}" not connected.`);
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
        if (this.flags.RECEIVED && this.flags.VERBOSE){
            let json = JSON.parse(evt.data);
            console.log(JSON.stringify(json, null, 2));
        }
        let rmiMessage = this.translator.decode(evt.data);
        if (this.flags.RECEIVED) console.log(rmiMessage);

        switch (rmiMessage.type) {
            case jjjrmi.JJJMessageType.FORGET:{
                if (this.flags.ONMESSAGE) console.log(this.jjjSocketName + " FORGET");
                this.translator.removeByKey(rmiMessage.key);
                break;
            }
            case jjjrmi.JJJMessageType.READY:{
                if (this.flags.CONNECT || this.flags.ONMESSAGE) console.log(this.jjjSocketName + " READY");
                this.onready(rmiMessage.getRoot());
                break;
            }
            /* client originated request */
            case jjjrmi.JJJMessageType.LOCAL:{
                if (this.flags.ONMESSAGE) console.log(`Response to client side request: ${this.jjjSocketName} ${rmiMessage.methodName}`);
                let callback = this.callback[rmiMessage.uid];
                delete(this.callback[rmiMessage.uid]);
                callback.resolve(rmiMessage.rvalue);
                break;
            }
            /* server originated request */
            case jjjrmi.JJJMessageType.REMOTE:{
            if (this.flags.ONMESSAGE) console.log(`Server side originated request: ${this.jjjSocketName} ${rmiMessage.methodName}`);
                let target = this.translator.getReferredObject(rmiMessage.ptr);
                this.remoteMethodCallback(target, rmiMessage.methodName, rmiMessage.args);
//                let response = new InvocationResponse(rmiMessage.uid, InvocationResponseCode.SUCCESS);
//                let encodedResponse = this.translator.encode(response);
//                let encodedString = JSON.stringify(encodedResponse, null, 4);
//
//                if (this.flags.ONMESSAGE) console.log(`Server side request: ${this.jjjSocketName} ${target.constructor.name}.${rmiMessage.methodName}`);
//                if (socket !== null) this.socket.send(encodedString);
//                else console.warn(`Socket "${this.socketName}" not connected.`);
                break;
            }
            case jjjrmi.JJJMessageType.EXCEPTION:{
                if (!this.flags.SILENT) console.log(this.jjjSocketName + " EXCEPTION " + rmiMessage.methodName);
                if (!this.flags.SILENT) console.warn(rmiMessage);
                let callback = this.callback[rmiMessage.uid];
                delete(this.callback[rmiMessage.uid]);
                callback.reject(rmiMessage);
                break;
            }
            case jjjrmi.JJJMessageType.REJECTED_CONNECTION:{
                if (this.flags.CONNECT || this.flags.ONMESSAGE) console.log(this.jjjSocketName + " REJECTED_CONNECTION");
                this.onreject();
                break;
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
        SILENT: false, /* do not print exceptions to console */
        CONNECT: false, /* show the subset of ONMESSAGE that deals with the initial connection */
        ONMESSAGE: false, /* describe the action taken when a message is received */
        SENT: false, /* show the send object, versbose shows the json text as well */
        RECEIVED: false, /* show the received server object, verbose shows the json text as well */
        VERBOSE: false, /* print raw text for SENT / RECEIVED */
        ONREGISTER: false /* report classes as they are registered */
};

JJJRMISocket.classes = new Map();

JJJRMISocket.registerClass = function(aClass){
    if (typeof aClass !== "function"){
        console.log(aClass);
        throw new Error(`paramater 'class' of method 'registerClass' is '${typeof aClass}', expected 'function'`);
    }
    if (typeof aClass.__getClass !== "function"){
        throw new Error(`in Class ${aClass.constructor.name} method __getClass of type ${typeof aClass.__getClass}`);
    }
    
    if (JJJRMISocket.flags.ONREGISTER) console.log(`Register ${aClass.__getClass()}`);
    
    JJJRMISocket.classes.set(aClass.__getClass(), aClass);
    
    for (let field in aClass){     
        if (JJJRMISocket.flags.ONREGISTER && JJJRMISocket.flags.VERBOSE) console.log(`considering ${aClass.__getClass()}.${field}`);
        if (typeof aClass[field] === "function" && typeof aClass[field].__getClass === "function"){
            JJJRMISocket.registerClass(aClass[field]);
        }
    }
};

/* for registering all classes returned from generated JS */
JJJRMISocket.registerPackage = function(package){
    for (let aClass in package){
        JJJRMISocket.registerClass(package[aClass]);
    }
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