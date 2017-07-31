
class Storage {
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
        var settings = Storage.getObject(this.sName);
        return settings[key];
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
        var settings = Storage.getObject(this.sName);
        settings[key] = value;
        Storage.putObject(settings, this.sName);
    }

    toString() {
        return JSON.stringify(Storage.getObject(this.sName), null, 2);
    }
}