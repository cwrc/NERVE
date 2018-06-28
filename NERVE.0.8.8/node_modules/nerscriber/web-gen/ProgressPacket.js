const ProgressStage = require("./ProgressStage");
class ProgressPacket {
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

if (typeof module !== "undefined") module.exports = ProgressPacket;