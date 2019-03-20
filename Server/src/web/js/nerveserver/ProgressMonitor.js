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
	end() {
		
		this.notifyListeners("serverEnd");
	}
	start(message) {
		
		this.notifyListeners("serverStart", message);
	}
	updateMessage(message) {
		
		this.notifyListeners("serverUpdateMessage", message);
	}
	updateProgress(i) {
		
		this.notifyListeners("serverUpdateProgress", i);
	}
};

if (typeof module !== "undefined") module.exports = ProgressMonitor;