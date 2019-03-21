"use strict";
const SQLRecord = require("./SQLRecord");
class SQLResult {
	constructor() {
		
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.sharcnet.dh.sql.SQLResult";
	}
	static __isEnum() {
		return false;
	}
	[Symbol.iterator]() {
		return this.records[Symbol.iterator]();
	}
};

if (typeof module !== "undefined") module.exports = SQLResult;