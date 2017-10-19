EntityValues = class EntityValues {
	constructor(entity, lemma, link, tag, collection) {
		this.entity = entity;
		this.lemma = lemma;
		this.link = link;
		this.tagName = tag;
		this.collection = collection;
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.sharcnet.dh.nerve.EntityValues";
	}
	__isEnum() {
		return false;
	}
	static extract(entity) {
		let text = $(entity).text();
		let lemma = $(entity).lemma();
		let link = $(entity).link();
		let tag = $(entity).entityTag();
		let collection = $(entity).attr("data-collection");
		if (!collection) collection = "";
		return new EntityValues(text, lemma, link, tag, collection);
	}
};
JJJRMISocket.classes.set("ca.sharcnet.dh.nerve.EntityValues", EntityValues);
Dictionary = class Dictionary {
	constructor() {
		this.__jjjWebsocket = new JJJRMISocket("Dictionary", this);
	}
	__isTransient() {
		return false;
	}
	__getClass() {
		return "ca.sharcnet.dh.nerve.Dictionary";
	}
	__isEnum() {
		return false;
	}
	async connect(url) {
		await this.__jjjWebsocket.connect(url);
	}
	getEntities(entity) {
		return this.__jjjWebsocket.methodRequest(this, "getEntities", arguments);
	}
	pollEntity(entity) {
		return this.__jjjWebsocket.methodRequest(this, "pollEntity", arguments);
	}
	addEntity(value) {
		return this.__jjjWebsocket.methodRequest(this, "addEntity", arguments);
	}
	lookupCollection(values) {
		return this.__jjjWebsocket.methodRequest(this, "lookupCollection", arguments);
	}
	deleteEntity(value) {
		return this.__jjjWebsocket.methodRequest(this, "deleteEntity", arguments);
	}
};
JJJRMISocket.classes.set("ca.sharcnet.dh.nerve.Dictionary", Dictionary);
Translate = class Translate {
	constructor() {
		this.__jjjWebsocket = new JJJRMISocket("Translate", this);
	}
	__isTransient() {
		return false;
	}
	__getClass() {
		return "ca.sharcnet.dh.nerve.Translate";
	}
	__isEnum() {
		return false;
	}
	async connect(url) {
		await this.__jjjWebsocket.connect(url);
	}
	decode(source) {
		return this.__jjjWebsocket.methodRequest(this, "decode", arguments);
	}
	encode(source) {
		return this.__jjjWebsocket.methodRequest(this, "encode", arguments);
	}
	onPhase(phase, i, max) {

		this.view.setThrobberMessage(phase);
		this.phaseName = phase;
		this.view.showBaubles(i, max);
	}
	onStep(i, max) {

		this.view.showPercent(Math.trunc(i / max * 100));
	}
	setView(view) {

		this.view = view;
		this.phaseName = "";
	}
};
JJJRMISocket.classes.set("ca.sharcnet.dh.nerve.Translate", Translate);
