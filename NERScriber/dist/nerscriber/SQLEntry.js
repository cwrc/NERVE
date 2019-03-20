class SQLEntry {
	constructor() {
		
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.sharcnet.dh.sql.SQLEntry";
	}
	static __isEnum() {
		return false;
	}
};

if (typeof module !== "undefined") module.exports = SQLEntry;