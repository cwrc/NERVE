class EncodeResponse {
	constructor() {
		this.filename = "";
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.sharcnet.dh.nerve.EncodeResponse";
	}
	static __isEnum() {
		return false;
	}
	getContext() {
		return this.context;
	}
	getFilename() {
		return this.filename;
	}
	getSchemaURL() {
		return this.schemaURL;
	}
	getText() {
		return this.text;
	}
	setFilename(filename) {
		this.filename = filename;
	}
};

if (typeof module !== "undefined") module.exports = EncodeResponse;