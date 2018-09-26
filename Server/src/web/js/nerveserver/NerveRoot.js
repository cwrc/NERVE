const ProgressMonitor = require("./ProgressMonitor");
const Dictionary = require("./Dictionary");
const Scriber = require("./Scriber");
class NerveRoot {
	constructor() {
		this.scriber = new Scriber();
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.sharcnet.dh.nerve.NerveRoot";
	}
	static __isEnum() {
		return false;
	}
	getDictionary() {
		return this.dictionary;
	}
	getProgressMonitor() {
		return this.progressMonitor;
	}
	getScriber() {
		return this.scriber;
	}
};

if (typeof module !== "undefined") module.exports = NerveRoot;