"use strict";
const ArrayList = require ('jjjrmi').ArrayList;
const EncodeResponse = require("./EncodeResponse");
class Scriber {
	constructor() {
		this.config = null;
		this.CONTEXT_PATH = "/WEB-INF/";
		this.DEFAULT_SCHEMA = this.CONTEXT_PATH + "default.rng";
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
	decode(source) {
		return this.__jjjWebsocket.methodRequest(this, "decode", arguments);
	}
	dictionary(source) {
		return this.__jjjWebsocket.methodRequest(this, "dictionary", arguments);
	}
	html(source) {
		return this.__jjjWebsocket.methodRequest(this, "html", arguments);
	}
	link(source) {
		return this.__jjjWebsocket.methodRequest(this, "link", arguments);
	}
	ner(source) {
		return this.__jjjWebsocket.methodRequest(this, "ner", arguments);
	}
};

if (typeof module !== "undefined") module.exports = Scriber;