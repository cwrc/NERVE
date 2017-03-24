
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
    constructor(settingsName = "settings") {
        Storage.traceLevel = 0;
        Utility.log(Storage, "constructor");
        Utility.enforceTypes(arguments, ["optional", String]);

        this.sName = settingsName;
    }
    getValue(category, settingName, defaultValue = null) {
        Utility.log(Storage, "getValue");
        Utility.enforceTypes(arguments, String, String, ["optional", "unchecked"]);

        var settings = localStorage.getObject(this.sName);
        var cat = this.__nonNullProperty(settings, category);
        if (typeof cat[settingName] === "undefined" || cat[settingName] === null) {
            cat[settingName] = defaultValue;
            localStorage.putObject(settings, this.sName);
        }
        return cat[settingName];
    }
    hasValue(category, settingName) {
        Utility.log(Storage, "hasValue");
        Utility.enforceTypes(arguments, String, String);

        var settings = localStorage.getObject(this.sName);
        var cat = this.__nonNullProperty(settings, category);
        if (typeof cat[settingName] === "undefined" || cat[settingName] === null) {
            return false;
        } else {
            return true;
        }
    }
    clearCategory(category) {
        Utility.log(Storage, "clearCategory");
        Utility.enforceTypes(arguments, String);

        var settings = localStorage.getObject(this.sName);
        delete settings[category];
        localStorage.putObject(settings, this.sName);
    }
    clearValue(category, settingName) {
        Utility.log(Storage, "clearValue");
        Utility.enforceTypes(arguments, String, String);

        var settings = localStorage.getObject(this.sName);
        if (typeof settings[category] === "undefine" || settings[cat] === null) {
            return;
        }
        delete settings[category][settingName];
        localStorage.putObject(settings, this.sName);
    }
    getCategory(category) {
        Utility.log(Storage, "getCategory");
        Utility.enforceTypes(arguments, String);

        var settings = localStorage.getObject(this.sName);
        var cat = this.__nonNullProperty(settings, category);
        localStorage.putObject(settings, this.sName);
        return cat;
    }
    setValue(category, settingName, value) {
        Utility.log(Storage, "setValue");
        Utility.enforceTypes(arguments, String, String, String);

        var settings = localStorage.getObject(this.sName);
        var cat = this.__nonNullProperty(settings, category);
        cat[settingName] = value;
        localStorage.putObject(settings, this.sName);
    }
    __nonNullProperty(object, property) {
        Utility.log(Storage, "__nonNullProperty");
        Utility.enforceTypes(arguments, Object, String);

        if ((typeof object[property] === "undefined") || object[property] === null) {
            object[property] = {};
        }
        return object[property];
    }
    toString() {
        Utility.log(Storage, "toString");
        Utility.enforceTypes(arguments);

        return JSON.stringify(localStorage.getObject(this.sName), null, 2);
    }
}