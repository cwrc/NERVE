class ProgressStage {
	constructor(value) {
		this.__value = value;
	}
	toString() {
		return this.__value;
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.sharcnet.nerve.ProgressStage";
	}
	static __isEnum() {
		return true;
	}
};
ProgressStage.valueArray = [];
ProgressStage.valueArray.push(ProgressStage.START = new ProgressStage("START"));
ProgressStage.valueArray.push(ProgressStage.CONTINUE = new ProgressStage("CONTINUE"));
ProgressStage.valueArray.push(ProgressStage.COMPLETE = new ProgressStage("COMPLETE"));
ProgressStage.valueArray.push(ProgressStage.ERROR = new ProgressStage("ERROR"));
ProgressStage.values = function(){return ProgressStage.valueArray;};

if (typeof module !== "undefined") module.exports = ProgressStage;