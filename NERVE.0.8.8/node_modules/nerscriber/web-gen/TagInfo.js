const NameSource = require("./NameSource");
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
	hasName(name) {
		if (this.getName(NameSource.DICTIONARY) === name)return true;
		
		if (this.getName(NameSource.DIALOG) === name)return true;
		
		if (this.getName(NameSource.NERMAP) === name)return true;
		
		if (this.getName(NameSource.NAME) === name)return true;
		
		return false;
	}
	getName(nameSource) {
		switch (nameSource){
			case NameSource.DICTIONARY: return this.dictionary;
			
			case NameSource.DIALOG: return this.dialog;
			
			case NameSource.NERMAP: return this.nerMap;
			
			case NameSource.NAME: ;
			default: return this.name;
			
		}
	}
};

if (typeof module !== "undefined") module.exports = TagInfo;