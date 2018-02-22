

module.exports = class AbstractModel{

    constructor(){
        this.abstractModelListeners = [];
    }

    addListener(listener) {
        Utility.log(AbstractModel, "addListener", listener.constructor.name);
        Utility.enforceTypes(arguments, Object);
        this.abstractModelListeners.push(listener);
    }

    /**
     * Call as notifyListeners(methodName, [methodArgument0, ... methodArgumentN])
     * @param {type} method
     * @returns {undefined}
     */
    async notifyListeners(method){
        Utility.log(AbstractModel, "notifyListeners", method);

        Array.prototype.shift.apply(arguments);
        for (let listener of this.abstractModelListeners){
            if (typeof listener[method] !== "function") continue;
            await listener[method].apply(listener, arguments);
        }
    }
};