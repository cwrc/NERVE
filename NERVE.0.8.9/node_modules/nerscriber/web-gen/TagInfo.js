class TagInfo {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.sharcnet.nerve.context.TagInfo";
	}
	static __isEnum() {
		return false;
	}
	defaults() {
		return new HashMap(this.defaults);
	}
	hasEncodeScript() {
		return !this.encodeScript.isEmpty();
	}
	hasDecodeScript() {
		return !this.decodeScript.isEmpty();
	}
	getEncodeScript() {
		return this.encodeScript;
	}
	getDecodeScript() {
		return this.decodeScript;
	}
	getDefault(key) {
		return this.defaults.get(key);
	}
	hasDefault(key) {
		return this.defaults.containsKey(key);
	}
	getLemmaAttribute() {
		return this.lemmaAttribute;
	}
	getLinkAttribute() {
		return this.linkAttribute;
	}
	getIdAttribute() {
		return this.idAttribute;
	}
	getDialogMethod() {
		return this.dialogMethod;
	}
	getName() {
		return this.name;
	}
	getStandard() {
		return this.standard;
	}
};

if (typeof module !== "undefined") module.exports = TagInfo;