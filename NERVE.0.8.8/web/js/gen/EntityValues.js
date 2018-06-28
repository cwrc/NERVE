class EntityValues {
	constructor(entity, lemma, link, tag, collection) {
		this.entityValue = null;
		this.lemmaValue = null;
		this.linkValue = null;
		this.tagValue = null;
		this.collectionValue = null;
		this.entityValue = entity;
		this.lemmaValue = lemma;
		this.linkValue = link;
		this.tagValue = tag;
		this.collectionValue = collection;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.sharcnet.dh.nerve.EntityValues";
	}
	static __isEnum() {
		return false;
	}
	static extract(entity) {
		
		let text = $(entity).text();
		let lemma = $(entity).lemma();
		let link = $(entity).link();
		let tag = $(entity).tag();
		let collection = $(entity).attr("data-collection");
		if (!collection) collection = "";
		return new EntityValues(text, lemma, link, tag, collection);
	}
	copyTo(dest) {
		
		if (this.text() !== null) dest.text(this.text());
		if (this.lemma() !== null) dest.lemma(this.lemma());
		if (this.link() !== null) dest.link(this.link());
		if (this.tag() !== null) dest.tag(this.tag());
		if (this.collection() !== null) dest.collection(this.text());
		
		return this;
	}
	copy() {
		return new EntityValues(this.text(), this.lemma(), this.link(), this.tag(), this.collection());
	}
	text(value) {
		
		if (typeof value === "undefined") return this.entityValue;
		
		this.entityValue = value;
		return this.entityValue;
	}
	lemma(value) {
		
		if (typeof value === "undefined") return this.lemmaValue;
		
		this.lemmaValue = value;
		return this.lemmaValue;
	}
	link(value) {
		
		if (typeof value === "undefined") return this.linkValue;
		
		this.linkValue = value;
		return this.linkValue;
	}
	tag(value) {
		
		if (typeof value === "undefined") return this.tagValue;
		
		this.tagValue = value;
		return this.tagValue;
	}
	collection(value) {
		
		if (typeof value === "undefined") return this.collectionValue;
		
		this.collectionValue = value;
		return this.collectionValue;
	}
};

if (typeof module !== "undefined") module.exports = EntityValues;