class AbstractModel {

    constructor() {
        this.abstractModelListeners = [];
    }

    addListener(listener) {
        Utility.log(AbstractModel, "addListener", listener.constructor.name);
        // Utility.enforceTypes(arguments, Object);

        this.abstractModelListeners.push(listener);
    }

    /**
     * Call as notifyListeners(methodName, [methodArgument0, ... methodArgumentN])
     * @param {type} method
     * @returns {undefined}
     */
    async notifyListeners(method) {
        Utility.log(AbstractModel, "notifyListeners", method);

        console.log("EVENT " + this.constructor.name + " " + method);

//        if (method === "notifyCollectionClear") console.warn("notifyCollectionClear");

        Array.prototype.shift.apply(arguments);
        window.lastEvent = {
            method: method,
            args: arguments,
            source: this
        };
        AbstractModel.events.push(window.lastEvent);

        for (let listener of this.abstractModelListeners) {
            if (typeof listener[method] !== "function") {
//                console.log(" ? " + listener.constructor.name);
            } else {
                console.log(" + " + listener.constructor.name + " " + method);
                await listener[method].apply(listener, arguments);
            }
        }
    }
}
;

AbstractModel.events = [];
module.exports = AbstractModel;