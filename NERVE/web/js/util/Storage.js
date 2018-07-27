const jjjrmi = require("jjjrmi");

class Storage {
    constructor(settingsName = location.pathname.split("/")[1]) {
        this.sName = settingsName;
        this.translator = new jjjrmi.Translator();
        
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

    registerPackage(pkg){
        this.translator.registerPackage(pkg);
    }

    registerClass(aClass){
        this.translator.registerClass(aClass);
    }

    clearAll() {
        Storage.putObject({}, this.sName);
    }
    getValue(key) {        
        var encoded = Storage.getObject(this.sName);
        if (encoded[key] === null) throw new Error(`null value associated with key "${key}" in storage "${this.sName}"`);
        if (typeof encoded[key] === "undefined") throw new Error(`undefined value associated with key "${key}" in storage "${this.sName}"`);
        let decoded = this.translator.decode(encoded[key]);
        this.translator.clear();
        return decoded;
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
        let encoded = this.translator.encode(value);
        var settings = Storage.getObject(this.sName);
        settings[key] = encoded;
        Storage.putObject(settings, this.sName);
        this.translator.clear();
    }

    toString() {
        return JSON.stringify(Storage.getObject(this.sName), null, 2);
    }
}

module.exports = Storage;