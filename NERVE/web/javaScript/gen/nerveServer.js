EntityValues = class EntityValues {
	constructor(entity, lemma, link, tag, collection) {
		this.entity = "";
		this.lemma = "";
		this.link = "";
		this.tagName = "";
		this.collection = "";
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
EncodeResponse = class EncodeResponse {
	constructor() {
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.sharcnet.dh.nerve.EncodeResponse";
	}
	__isEnum() {
		return false;
	}
	setFilename(filename) {
		this.filename = filename;
	}
};
JJJRMISocket.classes.set("ca.sharcnet.dh.nerve.EncodeResponse", EncodeResponse);
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
Scriber = class Scriber {
	constructor() {
		this.listeners = new ArrayList();
		this.__jjjWebsocket = new JJJRMISocket("Scriber", this);
	}
	__isTransient() {
		return false;
	}
	__getClass() {
		return "ca.sharcnet.dh.nerve.Scriber";
	}
	__isEnum() {
		return false;
	}
	async connect(url) {
		await this.__jjjWebsocket.connect(url);
	}
	edit(source) {
		return this.__jjjWebsocket.methodRequest(this, "edit", arguments);
	}
	encode(source) {
		return this.__jjjWebsocket.methodRequest(this, "encode", arguments);
	}
	tag(source) {
		return this.__jjjWebsocket.methodRequest(this, "tag", arguments);
	}
	getContext(contextFileName) {
		return this.__jjjWebsocket.methodRequest(this, "getContext", arguments);
	}
	decode(source) {
		return this.__jjjWebsocket.methodRequest(this, "decode", arguments);
	}
	addListener(listener) {
		this.listeners.add(listener);
	}
	notifyProgress(packet) {
		for(let listener of this.listeners){
			listener.notifyProgress(packet);
		}
	}
};
JJJRMISocket.classes.set("ca.sharcnet.dh.nerve.Scriber", Scriber);
