class EntityValues {
	constructor(entity, lemma, link, tag) {
		this.entityValue = null;
		this.lemmaValue = null;
		this.linkValue = null;
		this.tagValue = null;
		this.entityValue = entity;
		this.lemmaValue = lemma;
		this.linkValue = link;
		this.tagValue = tag;
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
		return new EntityValues(text, lemma, link, tag);
	}
	copyTo(dest) {
		
		if (this.text() !== null) dest.text(this.text());
		if (this.lemma() !== null) dest.lemma(this.lemma());
		if (this.link() !== null) dest.link(this.link());
		if (this.tag() !== null) dest.tag(this.tag());
		
		return this;
	}
	copy() {
		return new EntityValues(this.text(), this.lemma(), this.link(), this.tag());
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
};

if (typeof module !== "undefined") module.exports = EntityValues;