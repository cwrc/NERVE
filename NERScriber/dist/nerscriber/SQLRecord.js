"use strict";
const SQLEntry = require("./SQLEntry");
class SQLRecord {
	constructor() {
		
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.sharcnet.dh.sql.SQLRecord";
	}
	static __isEnum() {
		return false;
	}
	[Symbol.iterator]() {
		return this.entries[Symbol.iterator]();
	}
};

if (typeof module !== "undefined") module.exports = SQLRecord;