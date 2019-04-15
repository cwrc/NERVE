"use strict";
class Dictionary {
	constructor() {
		this.DEFAULT_DICTIONARY = "entities";
		this.SQL_CONFIG = "WEB-INF/config.properties";
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.sharcnet.dh.scriber.dictionary.Dictionary";
	}
	static __isEnum() {
		return false;
	}
	addEntities(values) {
		return this.__jjjWebsocket.methodRequest(this, "addEntities", arguments);
	}
	addEntity(value) {
		return this.__jjjWebsocket.methodRequest(this, "addEntity", arguments);
	}
	addTable(table) {
		return this.__jjjWebsocket.methodRequest(this, "addTable", arguments);
	}
	deleteEntity(value) {
		return this.__jjjWebsocket.methodRequest(this, "deleteEntity", arguments);
	}
	getEntities(textArray) {
		return this.__jjjWebsocket.methodRequest(this, "getEntities", arguments);
	}
	lookup(text, lemma, tag, source) {
		return this.__jjjWebsocket.methodRequest(this, "lookup", arguments);
	}
};

if (typeof module !== "undefined") module.exports = Dictionary;