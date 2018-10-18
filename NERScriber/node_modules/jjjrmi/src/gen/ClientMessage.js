const ClientMessageType = require("./ClientMessageType");
class ClientMessage {
	constructor() {
	}
	static __isTransient() {
		return true;
	}
	static __getClass() {
		return "ca.frar.jjjrmi.socket.message.ClientMessage";
	}
	static __isEnum() {
		return false;
	}
};

if (typeof module !== "undefined") module.exports = ClientMessage;