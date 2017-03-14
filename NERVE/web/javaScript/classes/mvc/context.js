/* global Utility, Function */

class Context {
    constructor(){
        Utility.log(Context, "constructor");
        Utility.enforceTypes(arguments);
    }

    load(jsonObject, onSuccess = function() {}, onFailure = function(){}) {
        Utility.log(Context, "load");
        Utility.enforceTypes(arguments, Object, ["optional", Function], ["optional", Function]);

        this.dataObject = jsonObject;

        if (this.getSchemaName() !== "") {
            this.schema = new Schema(this);
            this.schema.load(this.getSchemaName(), onSuccess, onFailure);
        } else {
            this.schema = new EmptySchema(this);
            onSuccess();
        }
    }

    getLemmaAttribute(tagName) {
        Utility.log(Context, "toJSON");
        Utility.enforceTypes(arguments, ["optional", String]);

        let tagInfo = this.getTagInfo(tagName);
        if (tagInfo.hasOwnProperty("lemmaAttribute")) {
            return tagInfo.lemmaAttribute;
        }

        return this.dataObject.lemmaAttribute;
    }

    getLinkAttribute(tagName) {
        Utility.log(Context, "toJSON");
        Utility.enforceTypes(arguments, ["optional", String]);

        let tagInfo = this.getTagInfo(tagName);
        if (tagInfo.hasOwnProperty("linkAttribute")) {
            return tagInfo.linkAttribute;
        }

        return this.dataObject.linkAttribute;
    }

    toJSON() {
        Utility.log(Context, "toJSON");
        Utility.enforceTypes(arguments, ["optional", String]);

        return this.dataObject;
    }
    getName() {
        Utility.log(Context, "getName");
        Utility.enforceTypes(arguments);

        if (typeof this.dataObject.name !== undefined && this.dataObject.name !== null) {
            return this.dataObject.name;
        }
        return "";
    }
    getTags() {
        Utility.log(Context, "getTags");
        Utility.enforceTypes(arguments);

        if (typeof this.dataObject.tags === "undefined" || this.dataObject.tags === null) {
            return [];
        }

        return this.dataObject.tags;
    }
    getTagInfo(tagName) {
        Utility.log(Context, "getTagInfo");
        Utility.enforceTypes(arguments, String);

        for (let taginfo of this.dataObject.tags) {
            if (taginfo.name === tagName || taginfo.dictionary === tagName || taginfo.nerMap === tagName || taginfo.dialog === tagName) {
                return taginfo;
            }
        }
        return {};
    }
    getSchemaName() {
        Utility.log(Context, "getSchemaName");
        Utility.enforceTypes(arguments);

        if (typeof this.dataObject.schema !== "undefined" && this.dataObject.schema !== null) {
            return this.dataObject.schema;
        }
        return "";
    }
    getIDAttribute() {
        Utility.log(Context, "getIDAttribute");
        Utility.enforceTypes(arguments);

        if (typeof this.dataObject.idAttribute !== "undefined" && this.dataObject.idAttribute !== null) {
            return this.dataObject.idAttribute;
        }
        return "";
    }
    getAttributePrefix() {
        Utility.log(Context, "getIDAttribute");
        Utility.enforceTypes(arguments);

        if (typeof this.dataObject.tagNameRules !== "undefined" && this.dataObject.tagNameRules !== null) {
            if (typeof this.dataObject.tagNameRules.attribute !== "undefined" && this.dataObject.tagNameRules.attribute !== null) {
                return this.dataObject.tagNameRules.attribute;
            }
        }
        return "";
    }
    styles() {
        Utility.log(Context, "styles");
        Utility.enforceTypes(arguments);

        if (typeof this.dataObject.styles !== undefined && this.dataObject.styles !== null) {
            return this.dataObject.styles;
        }
        return [];
    }
    tags() {
        Utility.log(Context, "tags");
        Utility.enforceTypes(arguments);

        if (typeof this.dataObject.tags !== undefined && this.dataObject.tags !== null) {
            return this.dataObject.tags;
        }
        return [];
    }
    name() {
        Utility.log(Context, "name");
        Utility.enforceTypes(arguments);

        if (typeof this.dataObject.name === undefined || this.dataObject.name === null) {
            return "";
        }
        return this.dataObject.name;
    }
    readFromDictionary() {
        Utility.log(Context, "readFromDictionary");
        Utility.enforceTypes(arguments);

        if (typeof this.dataObject.readFromDictionary === undefined || this.dataObject.readFromDictionary === null) {
            return [];
        }
        return this.dataObject.readFromDictionary;
    }
    writeToDictionary() {
        Utility.log(Context, "writeToDictionary");
        Utility.enforceTypes(arguments);

        if (typeof this.dataObject.writeToDictionary === undefined || this.dataObject.writeToDictionary === null) {
            return "";
        }
        return this.dataObject.writeToDictionary;
    }
    getTagNameRule(rule) {
        Utility.log(Context, "getTagNameRule");
        Utility.enforceTypes(arguments, String);

        if (typeof this.dataObject.tagNameRules === undefined || this.dataObject.tagNameRules === null) {
            return "";
        }

        let returnString = this.dataObject.tagNameRules[rule];
        if (typeof returnString === undefined || returnString === null) {
            return "";
        }

        return returnString;
    }
    getHTMLLabel(label) {
        Utility.log(Context, "getHTMLLabel");
        Utility.enforceTypes(arguments, String);

        if (typeof this.dataObject.htmlLabels === "undefined" || this.dataObject.htmlLabels === null) {
            return "";
        }

        let returnString = this.dataObject.htmlLabels[label];
        if (typeof returnString === undefined || returnString === null) {
            return "";
        }

        return Utility.assertType(returnString, String);
    }
    getSchema() {
        Utility.log(Context, "getSchema");
        Utility.enforceTypes(arguments);

        return this.schema;
    }
    getDictionaryAttribute() {
        if (typeof this.dataObject.dictionaryAttribute === undefined || this.dataObject.dictionaryAttribute === null) {
            return "data-dictionary";
        } else return this.dataObject.dictionaryAttribute;
    }
    isTagName(string) {
        Utility.log(Context, "isTagName");
        Utility.enforceTypes(arguments, String);

        for (let tag of this.getTags()) {
            if (tag.name === string) return true;
        }
        return false;
    }
    isNERMapTagName(string) {
        Utility.log(Context, "isNERMapTagName");
        Utility.enforceTypes(arguments, String);

        for (let tag of this.getTags()) {
            if (tag.nerMap === string) return true;
        }
        return false;
    }
    isDictionaryTagName(string) {
        Utility.log(Context, "isDictionaryTagName");
        Utility.enforceTypes(arguments, String);

        for (let tag of this.getTags()) {
            if (tag.dictionary === string) return true;
        }
        return false;
    }
    getTagStyle(){
        Utility.log(Context, "getTagStyle");
        Utility.enforceTypes(arguments);
        if (typeof this.dataObject.tagStyle === undefined || this.dataObject.tagStyle === null) {
            return [];
        }
        return this.dataObject.tagStyle;
    }
}
