
localStorage.constructor.prototype.getObject = function (objectID) {
    if (localStorage.hasOwnProperty(objectID)) {
        return JSON.parse(localStorage[objectID]);
    } else {
        return {};
    }
};

localStorage.constructor.prototype.putObject = function (obj, objectID) {
    localStorage[objectID] = JSON.stringify(obj);
};

class Storage {
    constructor(settingsName = location.pathname.split("/")[1]) {
        this.sName = settingsName;

        if (!localStorage.hasOwnProperty(settingsName)) {
            localStorage.putObject({}, settingsName);
        }
    }
    clearAll() {
        localStorage.putObject({}, this.sName);
    }
    getValue(key) {
        var settings = localStorage.getObject(this.sName);
        return settings[key];
    }
    hasValue(key) {
        var settings = localStorage.getObject(this.sName);
        if (typeof settings[key] === "undefined" || settings[key] === null) return false;
        return true;
    }
    deleteValue(key) {
        var settings = localStorage.getObject(this.sName);
        delete settings[key];
        localStorage.putObject(settings, this.sName);
    }
    setValue(key, value) {
        var settings = localStorage.getObject(this.sName);
        settings[key] = value;
        localStorage.putObject(settings, this.sName);
    }
    __nonNullProperty(object, property) {
        if ((typeof object[property] === "undefined") || object[property] === null) {
            object[property] = {};
        }
        return object[property];
    }
    toString() {
        return JSON.stringify(localStorage.getObject(this.sName), null, 2);
    }
}