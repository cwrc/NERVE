const EntityValues = require("./EntityValues");
class Dictionary {
	constructor() {
		this.DEFAULT_DICTIONARY = "custom";
		this.SQL_CONFIG = "WEB-INF/config.txt";
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.sharcnet.dh.nerve.Dictionary";
	}
	static __isEnum() {
		return false;
	}
	addEntity(value) {
		return this.__jjjWebsocket.methodRequest(this, "addEntity", arguments);
	}
	deleteEntity(value) {
		return this.__jjjWebsocket.methodRequest(this, "deleteEntity", arguments);
	}
	getEntities(entity) {
		return this.__jjjWebsocket.methodRequest(this, "getEntities", arguments);
	}
	lookup(text, lemma, tag, source) {
		return this.__jjjWebsocket.methodRequest(this, "lookup", arguments);
	}
	lookupCollection(values) {
		return this.__jjjWebsocket.methodRequest(this, "lookupCollection", arguments);
	}
	pollEntity(entity) {
		return this.__jjjWebsocket.methodRequest(this, "pollEntity", arguments);
	}
};

if (typeof module !== "undefined") module.exports = Dictionary;