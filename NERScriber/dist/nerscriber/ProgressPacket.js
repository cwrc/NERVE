"use strict";
const ProgressStage = require("./ProgressStage");
class ProgressPacket {
	constructor() {
		this.progressStage = ProgressStage.CONTINUE;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.sharcnet.dh.scriber.ProgressPacket";
	}
	static __isEnum() {
		return false;
	}
};

if (typeof module !== "undefined") module.exports = ProgressPacket;