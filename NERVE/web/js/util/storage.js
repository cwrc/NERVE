let jjjrmi = require("jjjrmi");

module.exports = class Storage {
    constructor(settingsName = location.pathname.split("/")[1]) {
        this.sName = settingsName;

        if (!localStorage.hasOwnProperty(settingsName)) {
            Storage.putObject({}, settingsName);
        }
    }

    static putObject(obj, objectID){
        localStorage[objectID] = JSON.stringify(obj);
    }

    static getObject(objectID){
        if (localStorage.hasOwnProperty(objectID)) {
            return JSON.parse(localStorage[objectID]);
        } else {
            return {};
        }
    }

    clearAll() {
        Storage.putObject({}, this.sName);
    }
    getValue(key) {
        let translator = new jjjrmi.Translator(null, jjjrmi.JJJRMISocket.classes);
        var encoded = Storage.getObject(this.sName);
        return translator.decode(encoded[key]);
    }
    hasValue(key) {
        var settings = Storage.getObject(this.sName);
        if (typeof settings[key] === "undefined" || settings[key] === null) return false;
        return true;
    }
    deleteValue(key) {
        var settings = Storage.getObject(this.sName);
        delete settings[key];
        Storage.putObject(settings, this.sName);
    }
    setValue(key, value) {
        let translator = new jjjrmi.Translator(null, jjjrmi.JJJRMISocket.classes);
        let encoded = translator.encode(value);
        var settings = Storage.getObject(this.sName);
        settings[key] = encoded;
        Storage.putObject(settings, this.sName);
    }

    toString() {
        return JSON.stringify(Storage.getObject(this.sName), null, 2);
    }
}