SQLResult = class SQLResult {
	constructor() {
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.SQL.SQLResult";
	}
	__isEnum() {
		return false;
	}
	get(i) {
		return this.records[i];
	}
	size() {
		return this.records.length;
	}
	[Symbol.iterator]() {
		return this.records[Symbol.iterator]();
	}
};
JJJRMISocket.classes.set("ca.fa.SQL.SQLResult", SQLResult);
SQLRecord = class SQLRecord {
	constructor() {
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.SQL.SQLRecord";
	}
	__isEnum() {
		return false;
	}
	getEntry(column) {
		for(let i = 0; i < this.entries.length; i++)if (this.entries[i].getName() === column)return this.entries[i];


		return null;
	}
	[Symbol.iterator]() {
		return this.entries[Symbol.iterator]();
	}
};
JJJRMISocket.classes.set("ca.fa.SQL.SQLRecord", SQLRecord);
SQLEntry = class SQLEntry {
	constructor(name, value) {
		this.name = name;
		this.value = value;
	}
	__isTransient() {
		return true;
	}
	__getClass() {
		return "ca.fa.SQL.SQLEntry";
	}
	__isEnum() {
		return false;
	}
	getName() {
		return this.name;
	}
	getValue() {
		return this.value;
	}
};
JJJRMISocket.classes.set("ca.fa.SQL.SQLEntry", SQLEntry);
