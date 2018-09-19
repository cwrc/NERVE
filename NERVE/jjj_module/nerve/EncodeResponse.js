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
	setFilename(filename) {
		this.filename = filename;
	}
};

if (typeof module !== "undefined") module.exports = EncodeResponse;