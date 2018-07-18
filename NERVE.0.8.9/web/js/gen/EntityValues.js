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
	[Symbol.iterator]() {
		return this.values.keySet();
	}
	copyTo(dest) {
		
		if (this.text() !== null) dest.text(this.text());
		if (this.lemma() !== null) dest.lemma(this.lemma());
		if (this.link() !== null) dest.link(this.link());
		if (this.tag() !== null) dest.tag(this.tag());
		
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
	text(value) {
		
		if (typeof value === "undefined") return this.values.get("text");
		
		this.values.put("text", value);
		return this;
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
	get(key) {
		return this.values.get(key);
	}
	has(key) {
		return this.values.containsKey(key);
	}
	tag(value) {
		
		if (typeof value === "undefined") return this.values.get("tag");
		
		this.values.put("tag", value);
		return this;
	}
	hasText() {
		return this.values.containsKey("text");
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
};

if (typeof module !== "undefined") module.exports = EntityValues;