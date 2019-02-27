"use strict";
const HashMap = require('jjjrmi').HashMap;
class TagInfo {
	constructor() {
		this.defaults = new HashMap();
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.sharcnet.dh.scriber.context.TagInfo";
	}
	static __isEnum() {
		return false;
	}
	defaults() {
		return new HashMap(this.defaults);
	}
	getDecodeScript() {
		return this.decodeScript;
	}
	getDefault(key) {
		return this.defaults.get(key);
	}
	getDialogMethod() {
		return this.dialogMethod;
	}
	getEncodeScript() {
		return this.encodeScript;
	}
	getIdAttribute() {
		return this.idAttribute;
	}
	getLemmaAttribute() {
		return this.lemmaAttribute;
	}
	getLinkAttribute() {
		return this.linkAttribute;
	}
	getName() {
		return this.name;
	}
	getStandard() {
		return this.standard;
	}
	hasDecodeScript() {
		return !this.decodeScript.isEmpty();
	}
	hasDefault(key) {
		return this.defaults.containsKey(key);
	}
	hasEncodeScript() {
		return !this.encodeScript.isEmpty();
	}
};

if (typeof module !== "undefined") module.exports = TagInfo;