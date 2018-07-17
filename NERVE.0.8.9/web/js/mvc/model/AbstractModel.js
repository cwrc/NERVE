class AbstractModel {

    constructor() {
        this.abstractModelListeners = [];
    }

    addListener(listener) {
        if (typeof listener !== "object") throw new Error("invalid AbstractModel listener type: " + typeof listener);
        this.abstractModelListeners.push(listener);
    }

    /**
     * Call as notifyListeners(methodName, [methodArgument0, ... methodArgumentN])
     * @param {type} method
     * @returns {undefined}
     */
    async notifyListeners(method) {
        console.log("EVENT " + this.constructor.name + " " + method);

//        if (method === "notifyCollectionClear") console.warn("notifyCollectionClear");

        Array.prototype.shift.apply(arguments);
        window.lastEvent = {
            method: method,
            args: arguments,
            source: this,
            listeners : []
        };
        AbstractModel.events.push(window.lastEvent);

        for (let listener of this.abstractModelListeners) {
            if (typeof listener[method] !== "function") {
//                console.log(" ? " + listener.constructor.name);
            } else {
                console.log(" + " + listener.constructor.name + " " + method);
                window.lastEvent.listeners.push(listener.constructor.name);
                await listener[method].apply(listener, arguments);
            }
        }
    }
}

AbstractModel.events = [];
module.exports = AbstractModel;