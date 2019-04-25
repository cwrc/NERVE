"use strict";
class ProgressMonitor extends require('@thaerious/nidget').AbstractModel {
	constructor() {
		super();
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.sharcnet.dh.nerve.ProgressMonitor";
	}
	static __isEnum() {
		return false;
	}
};

if (typeof module !== "undefined") module.exports = ProgressMonitor;