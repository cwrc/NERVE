const EntityValues = require("./EntityValues");
class Dictionary {
	constructor() {
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
	getEntities(context, entity) {
		return this.__jjjWebsocket.methodRequest(this, "getEntities", arguments);
	}
	lookupCollection(values) {
		return this.__jjjWebsocket.methodRequest(this, "lookupCollection", arguments);
	}
	pollEntity(context, entity) {
		return this.__jjjWebsocket.methodRequest(this, "pollEntity", arguments);
	}
};

if (typeof module !== "undefined") module.exports = Dictionary;