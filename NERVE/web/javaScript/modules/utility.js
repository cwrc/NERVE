/* global Function */

Utility = {
    globalTraceLevel: "local",
    enableAssertions: true,
    classes: {
        Events: 2,
        Controller: 2,
        View: 2,
        Collection : 0,
        FileOperations : 0,
        Dictionary : 0,
        Context: 0,
        Response: 0,
        Model: 2,
        Listeners: 0,
        TagnameManager: 0
    },
    logger: {
        logRecord: {}
    }
};

class EnforcedTypeError extends Error {
    constructor(message, object, aClass) {
        super(message);
        this.object = object;
        this.aClass = aClass;
        window.enforcedTypeError = this;
    }
}

class AssertFailedError extends Error {
    constructor(message) {
        super(message);
    }
}

class PermittedTypes {
    constructor(index, typeList) {
        this.index = index;
        if (typeList instanceof Array) {
            this.permittedList = typeList;
        } else {
            this.permittedList = [];
            this.permittedList.push(typeList);
        }
    }

    isChecked() {
        for (let i = 0; i < this.permittedList.length; i++) {
            let item = this.permittedList[i];
            if (item === "unchecked") return false;
        }
        return true;
    }

    isNullPermitted() {
        for (let i = 0; i < this.permittedList.length; i++) {
            let item = this.permittedList[i];
            if (item === "null") return true;
        }
        return false;
    }

    isUndefinedPermitted() {
        for (let i = 0; i < this.permittedList.length; i++) {
            let item = this.permittedList[i];
            if (item === "undefined") return true;
        }
        return false;
    }

    isOptional() {
        for (let i = 0; i < this.permittedList.length; i++) {
            let item = this.permittedList[i];
            if (item === "optional") return true;
        }
        return false;
    }

    contains(object) {
        for (let i = 0; i < this.permittedList.length; i++) {
            if (this.permittedList[i] instanceof Function) {
                if (!(object instanceof Object)) {
                    if (this.permittedList[i] === Boolean && typeof object === "boolean") return true;
                    if (this.permittedList[i] === Number && typeof object === "number") return true;
                    if (this.permittedList[i] === String && typeof object === "string") return true;
                } else if (object instanceof this.permittedList[i]) {
                    return true;
                }
            }
        }
        return false;
    }

    toString() {
        let rvalue = [];
        for (let i = 0; i < this.permittedList.length; i++) {
            let item = this.permittedList[i];
            if (typeof item === "function") rvalue.push(item.name);
        }
        return "{" + rvalue.toString() + "}";
    }

    check(object) {
        if (!this.isChecked()) return;
        if (typeof object === "undefined") {
            if (!this.isUndefinedPermitted() && !this.isOptional()) {
                throw new EnforcedTypeError("UNDEFINED Parameter Exception @ parameter index " + this.index);
            }
        } else if (object === null) {
            if (!this.isNullPermitted()) {
                throw new EnforcedTypeError("NULL Parameter Exception @ parameter index " + this.index);
            }
        } else if (!this.contains(object)) {
            throw new EnforcedTypeError("type assertion failed @ parameter index " + this.index + "," + " found " + object.constructor.name + " expected " + this.toString());
        }
    }
}

Utility.assert = function (value, string) {
    if (Utility.enableAssertions && !value) {
        throw "assertion failed : " + string;
    }
};

Utility.exists = function (object) {
    return (typeof object !== "undefined" && object !== null);
};

Utility.assertType = function (object, aClass) {
    if (!Utility.enableAssertions) return;

    if (!Utility.__testType(object, aClass)) {
        if (typeof object === "undefined") throw new EnforcedTypeError("type assertion failed, found 'undefined' expected " + aClass.prototype.constructor.name);
        throw new EnforcedTypeError("type assertion failed, found '" + object.constructor.name + "' expected " + aClass.prototype.constructor.name);
    }

    return object;
};

Utility.enforceTypes = function (args) {
    if (!Utility.enableAssertions) return;

    /* TODO test this next in statement */
    if (args.length > (arguments.length - 1) || args.length < Utility.__minArgCount(arguments)) {
        Utility.lastTypes = args;
        throw new EnforcedTypeError("Parameter count mismatch, expected " + (arguments.length - 1) + ", found " + args.length, null, null);
    }

    for (var i = 0; i < arguments.length - 1; i++) {
        new PermittedTypes(i, arguments[i + 1]).check(args[i]);
    }
};

Utility.__isChecked = function (arrayOfTypes) {
    if (!arrayOfTypes instanceof Array) return true;
    for (let i = 0; i < arrayOfTypes.length; i++) {
        if (arrayOfTypes[i] === "unchecked") return false;
    }
    return true;
};

Utility.__permittedUndefined = function (arrayOfTypes) {
    if (!arrayOfTypes instanceof Array) return false;
    for (let i = 0; i < arrayOfTypes.length; i++) {
        if (arrayOfTypes[i] === "optional") return true;
    }
    return false;
};

Utility.__permittedNull = function (arrayOfTypes) {
    if (!arrayOfTypes instanceof Array) return false;
    for (let i = 0; i < arrayOfTypes.length; i++) {
        if (arrayOfTypes[i] === "null") return true;
    }
    return false;
};

Utility.__matchAnyType = function (object, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] instanceof Function && Utility.__testType(object, array[i])) return true;
    }
    return false;
};

Utility.__extractTypeNames = function (array) {
    var nameArray = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i] instanceof Function) nameArray.push(array[i].prototype.name);
    }
    return false;
};

Utility.__testType = function (object, aClass) {
    if (!(object instanceof Object)) {
        if (aClass === Boolean && typeof object === "boolean") return true;
        if (aClass === Number && typeof object === "number") return true;
        if (aClass === String && typeof object === "string") return true;
    } else if (object instanceof aClass) {
        return true;
    }
    return false;
};

Utility.__minArgCountDebug = function (arguments) {
    let count = 0;

    console.log(arguments[0]);
    console.log(arguments[1]);

    for (let i = 1; i < arguments.length; i++) {
        console.log((typeof arguments[i]) + " instanceof Array " + (arguments[i] instanceof Array));
        if (arguments[i] instanceof Array) {
            for (let j = 0; j < arguments[i].length; j++) {
                if (arguments[i][j] instanceof String && arguments[i][j] === "optional") {
                    continue;
                }
            }
        } else {
            count++;
        }
    }
    return count;
};


Utility.__minArgCount = function (arguments) {
    let count = 0;

    for (let i = 1; i < arguments.length; i++) {
        if (arguments[i] instanceof Array) {
            for (let j = 0; j < arguments[i].length; j++) {
                if (arguments[i][j] instanceof String && arguments[i][j] === "optional") {
                    continue;
                }
            }
        } else {
            count++;
        }
    }
    return count;
};

Utility.verifyArguments = function (args, minLength, maxLength) {
    if (maxLength !== undefined && maxLength !== null) {
        if (minLength !== undefined && minLength !== null) {
            maxLength = minLength;
        }

        if (args.length < minLength || args.length > maxLength) {
            throw "Parameter list length mismatch : is " + args.length + " expected " + minLength + " -> " + maxLength;
        }
    }

    if (typeof arguments === "undefined" || arguments === null) {
        throw "NULL Parameter Exception : paramters index " + i;
    }

    for (var i = 0; i < args.length; i++) {
        if (typeof args[i] === "undefined" || args[i] === null) {
            throw "NULL Parameter Exception : paramters index " + i;
        }
    }
};

Utility.getParameterNames = function (func) {
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
};

Utility.getElementsByAttribute = function (element, attribute, value) {
    var matches = [];

    for (var node of element.getElementsByTagName("*")) {
        if (node.getAttribute(attribute) !== null && node.getAttribute(attribute) === value) {
            matches.push(node);
        }
    }

    return matches;
};

Utility.trace = function (aClass, level, string) {
    let className = aClass.name;

    if (Utility.globalTraceLevel === "verbose") {
        let seconds = Math.round(Date.now() / 100 % 1000) / 10;
        console.log(seconds + " : " + string);
    } else if (Utility.classes[className] >= level) {
        let seconds = Math.round(Date.now() / 100 % 1000) / 10;
        console.log(seconds + " : " + string);
    }
};

Utility.log = function (aClass, methodName) {
    let className = aClass.name;

    if (Utility.globalTraceLevel === "verbose") {
        let seconds = Math.round(Date.now() / 100 % 1000) / 10;
        console.log(seconds + " : " + className + "." + methodName + "()");
    } else if (Utility.classes[className] >= 2 && !methodName.startsWith("__")) {
        let seconds = Math.round(Date.now() / 100 % 1000) / 10;
        console.log(seconds + " : " + className + "." + methodName + "()");
    } else if (Utility.classes[className] >= 3) {
        let seconds = Math.round(Date.now() / 100 % 1000) / 10;
        console.log(seconds + " : " + className + "." + methodName + "()");
    }

    if (typeof Utility.logger.logRecord[className] === "undefined") {
        Utility.setupLogger(aClass);
    }

    try {
        Utility.logger.logRecord[className][methodName].callCount++;
    } catch (e) {
        console.log(className + "." + methodName + " record not found");
        throw e;
    }
};

Utility.setupLogger = function (aClass) {
    Utility.logger.logRecord[aClass.name] = {};
    Utility.logger.logRecord[aClass.name].name = aClass.name;
    var methods = Object.getOwnPropertyNames(aClass.prototype);
    for (let method of methods) {
        let methodName = method;
        Utility.logger.logRecord[aClass.name][methodName] = {};
        Utility.logger.logRecord[aClass.name][methodName].callCount = 0;
    }
};

Utility.logger.reportUnvisited = function (aClass = null) {
    if (aClass === null) {
        var classNames = Object.getOwnPropertyNames(Utility.logger.logRecord);
        for (let className of classNames) {
            var methodNames = Object.getOwnPropertyNames(Utility.logger.logRecord[className]);
            for (let methodName of methodNames) {
                if (Utility.logger.logRecord[className][methodName].callCount === 0) {
                    console.log(className + "." + methodName);
                }
            }
        }
    } else {
        var className = aClass.name;
        var record = Utility.logger.logRecord[className];
        var methodNames = Object.getOwnPropertyNames(record);
        for (let methodName of methodNames) {
            if (Utility.logger.logRecord[className][methodName].callCount === 0) {
                console.log(className + "." + methodName);
            }
        }
}
};

Utility.logger.reportVisits = function () {
    var classNames = Object.getOwnPropertyNames(Utility.logger.logRecord);
    for (let className of classNames) {
        var methodNames = Object.getOwnPropertyNames(Utility.logger.logRecord[className]);
        for (let methodName of methodNames) {
            console.log(className + "." + methodName + " " + Utility.logger.logRecord[className][methodName].callCount);
        }
    }
};

Assert = {};

Assert.exists = function (object) {
    if (typeof object === "undefined") {
        throw new AssertFailedError("assert exist failed, undefined");
    } else if (object === null) {
        throw new AssertFailedError("assert exist failed, null");
    }
};

/**
 * Return true if 'child' is a descendent of 'parent'.
 * @param {type} parent
 * @param {type} child
 * @returns {Boolean}
 */
Utility.isDescendent = function (parent, child) {
    Utility.assertType(parent, HTMLElement);
    Utility.assertType(child, HTMLElement);

    var node = child.parentNode;
    while (node !== null) {
        if (node === parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
};

class EventAutomation {

    constructor() {
        Utility.log(EventAutomation, "constructor");
        Utility.enforceTypes(arguments);
    }

    selectRange(nodeID, startOffset, endOffset) {
        let range = new Range();
        let node = document.getElementById(nodeID);
        range.setStart(node.childNodes[0], startOffset);
        range.setEnd(node.childNodes[0], endOffset);
        console.log(node.childNodes[0]);
        window.getSelection().addRange(range);
    }
}

EventAutomation.clickElement = function (nodeID) {
    let event = new Event("click", {
        'view': window,
        'bubbles': true,
        'cancelable': true
    });

    let element = document.getElementById(nodeID);
    element.dispatchEvent(event);
};

EventAutomation.keyDown = function (nodeID) {
    let event = new Event("keydown", {
        'view': window,
        'bubbles': true,
        'cancelable': true
    });

    document.dispatchEvent(event);
};

EventAutomation.selectRange = function (nodeID, startOffset, endOffset) {
    let range = new Range();
    let node = document.getElementById(nodeID);
    Utility.assertType(node, HTMLElement);
    let start = EventAutomation.getTextNodeAtOffset(node, startOffset);
    let end = EventAutomation.getTextNodeAtOffset(node, endOffset);

    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);

    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
};

EventAutomation.getTextNodeAtOffset = function (node, offset) {
    let childNodes = node.childNodes;
    let sum = 0;
    let rOffset = offset;

    for (let i = 0; i < childNodes.length; i++) {
        let nodeType = childNodes[i].nodeType;

        switch (nodeType) {
            case 1:
                sum = sum + childNodes[i].innerText.length;
                if (sum <= offset) {
                    rOffset = rOffset - childNodes[i].innerText.length;
                } else {
                    return EventAutomation.getTextNodeAtOffset(childNodes[i], rOffset);
                }
                break;
            case 3:
                sum = sum + childNodes[i].length;
                if (sum <= offset) {
                    rOffset = rOffset - childNodes[i].length;
                } else {
                    return {
                        node: childNodes[i],
                        offset: rOffset
                    };
                }
                break;
        }
    }
};
