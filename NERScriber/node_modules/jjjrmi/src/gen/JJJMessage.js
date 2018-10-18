const JJJMessageType = require("./JJJMessageType");
class JJJMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.frar.jjjrmi.socket.message.JJJMessage";
	}
	static __isEnum() {
		return false;
	}
};

if (typeof module !== "undefined") module.exports = JJJMessage;