const HashMap = require ('jjjrmi').HashMap;
class EntityValues {
	constructor() {
		this.values = new HashMap();
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
	clone() {
		let entityValues = new EntityValues();
		for(let key of this.values.keySet()){
			entityValues.set(key, this.get(key));
		}
		return entityValues;
	}
	copyTo(dest) {
		
		if (this.text() !== null) dest.text(this.text());
		if (this.lemma() !== null) dest.lemma(this.lemma());
		if (this.link() !== null) dest.link(this.link());
		if (this.tag() !== null) dest.tag(this.tag());
		
		return this;
	}
	get(key) {
		return this.values.get(key);
	}
	has(key) {
		return this.values.containsKey(key);
	}
	hasLemma() {
		return this.values.containsKey("lemma");
	}
	hasLink() {
		return this.values.containsKey("link");
	}
	hasTag() {
		return this.values.containsKey("tag");
	}
	hasText() {
		return this.values.containsKey("text");
	}
	[Symbol.iterator]() {
		return this.values.keySet();
	}
	lemma(value) {
		
		if (typeof value === "undefined") return this.values.get("lemma");
		
		this.values.put("lemma", value);
		return this;
	}
	link(value) {
		
		if (typeof value === "undefined") return this.values.get("link");
		
		this.values.put("link", value);
		return this;
	}
	set(key, value) {
		this.values.put(key, value);
		return this;
	}
	tag(value) {
		
		if (typeof value === "undefined") return this.values.get("tag");
		
		this.values.put("tag", value);
		return this;
	}
	text(value) {
		
		if (typeof value === "undefined") return this.values.get("text");
		
		this.values.put("text", value);
		return this;
	}
	values(that) {
		
		if (typeof that === "undefined") return this;
		
		this.text(that.text());
		this.lemma(that.lemma());
		this.link(that.link());
		this.tag(that.tag());
		return this;
	}
};

if (typeof module !== "undefined") module.exports = EntityValues;