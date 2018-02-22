let nerscriber = {};
ProgressPacket = class ProgressPacket {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.sharcnet.nerve.ProgressPacket";
	}
	static __isEnum() {
		return false;
	}
};
nerscriber.ProgressPacket = ProgressPacket;
ProgressCompletePacket = class ProgressCompletePacket extends ProgressPacket {
	constructor() {
		super("", -1, -1);
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.sharcnet.nerve.ProgressCompletePacket";
	}
	static __isEnum() {
		return false;
	}
};
nerscriber.ProgressCompletePacket = ProgressCompletePacket;
TagInfo = class TagInfo {
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
	hasDecodeScript() {
		return !this.decodeScript.isEmpty();
	}
	hasEncodeScript() {
		return !this.encodeScript.isEmpty();
	}
	hasName(name) {
		if (this.getName(NameSource.DICTIONARY) === name)return true;

		if (this.getName(NameSource.DIALOG) === name)return true;

		if (this.getName(NameSource.NERMAP) === name)return true;

		if (this.getName(NameSource.NAME) === name)return true;

		return false;
	}
	hasDefault(key) {
		return this.defaults.containsKey(key);
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
	getName(nameSource) {
		switch (nameSource){
			case NameSource.DICTIONARY: return this.dictionary;

			case NameSource.DIALOG: return this.dialog;

			case NameSource.NERMAP: return this.nerMap;

			case NameSource.NAME: ;
			default: return this.name;

		}
	}
	defaults() {
		return new HashMap(this.defaults);
	}
};
nerscriber.TagInfo = TagInfo;
NameSource = class NameSource {
	constructor(value) {
		this.__value = value;
	}
	toString() {
		return this.__value;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.sharcnet.nerve.context.NameSource";
	}
	static __isEnum() {
		return true;
	}
};
NameSource.valueArray = [];
NameSource.valueArray.push(NameSource.NAME = new NameSource("NAME"));
NameSource.valueArray.push(NameSource.DICTIONARY = new NameSource("DICTIONARY"));
NameSource.valueArray.push(NameSource.DIALOG = new NameSource("DIALOG"));
NameSource.valueArray.push(NameSource.NERMAP = new NameSource("NERMAP"));
NameSource.values = function(){return NameSource.valueArray;};
nerscriber.NameSource = NameSource;
Context = class Context {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.sharcnet.nerve.context.Context";
	}
	static __isEnum() {
		return false;
	}
	hasScriptFilename() {
		return !this.scriptFilename.isEmpty();
	}
	getTagInfo(tagname, source) {
		for(let tagInfo of this.tagList){
			if (tagInfo.getName(source) === tagname)return tagInfo;

		}
		throw new Error("ca.sharcnet.nerve.context.ContextException");
	}
	isTagName(tagname, source) {
		for(let tagInfo of this.tagList){
			if (tagInfo.getName(source) === tagname)return true;

		}
		return false;
	}
	getName() {
		return this.name;
	}
	getSchemaName() {
		return this.schemaName;
	}
	getScriptFilename() {
		return this.scriptFilename;
	}
	readFromDictionary() {
		return this.dictionaries;
	}
	styles() {
		return this.styleList;
	}
	tags() {
		return this.tagList;
	}
};
nerscriber.Context = Context;

if (typeof module !== "undefined") module.exports = nerscriber;