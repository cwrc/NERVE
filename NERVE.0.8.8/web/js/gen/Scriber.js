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
	link(source) {
		return this.__jjjWebsocket.methodRequest(this, "link", arguments);
	}
	encode(source) {
		return this.__jjjWebsocket.methodRequest(this, "encode", arguments);
	}
	tag(source) {
		return this.__jjjWebsocket.methodRequest(this, "tag", arguments);
	}
	edit(source) {
		return this.__jjjWebsocket.methodRequest(this, "edit", arguments);
	}
	decode(source) {
		return this.__jjjWebsocket.methodRequest(this, "decode", arguments);
	}
	getContext(contextFileName) {
		return this.__jjjWebsocket.methodRequest(this, "getContext", arguments);
	}
};

if (typeof module !== "undefined") module.exports = Scriber;