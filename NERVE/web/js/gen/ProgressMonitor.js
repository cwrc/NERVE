class ProgressMonitor extends require('../mvc/model/AbstractModel') {
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
	notifyProgress(pp) {
		
		this.notifyListeners("notifyProgress", pp);
	}
};

if (typeof module !== "undefined") module.exports = ProgressMonitor;