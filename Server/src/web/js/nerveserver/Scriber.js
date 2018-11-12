const ArrayList = require ('jjjrmi').ArrayList;
const EncodeResponse = require("./EncodeResponse");
class Scriber {
	constructor() {
		
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.sharcnet.dh.nerve.Scriber";
	}
	static __isEnum() {
		return false;
	}
	decode(source, contextName) {
		return this.__jjjWebsocket.methodRequest(this, "decode", arguments);
	}
	edit(source) {
		return this.__jjjWebsocket.methodRequest(this, "edit", arguments);
	}
	encode(source) {
		return this.__jjjWebsocket.methodRequest(this, "encode", arguments);
	}
	getContext(contextFileName) {
		return this.__jjjWebsocket.methodRequest(this, "getContext", arguments);
	}
	link(source) {
		return this.__jjjWebsocket.methodRequest(this, "link", arguments);
	}
	tag(source) {
		return this.__jjjWebsocket.methodRequest(this, "tag", arguments);
	}
};

if (typeof module !== "undefined") module.exports = Scriber;