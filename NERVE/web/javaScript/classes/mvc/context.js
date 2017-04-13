/* global Utility, Function */

class Context {
    constructor(jsonObject, onSuccess = function() {}, onFailure = function(){}){
        Utility.log(Context, "constructor");
        Utility.enforceTypes(arguments, Object, ["optional", Function], ["optional", Function]);

        for (let x in jsonObject) this[x] = jsonObject[x];

        if (typeof this.schemaName !== "undefined"){
            this.schema = new Schema();
            this.schema.load(this.schemaName, ()=>onSuccess(this), onFailure);
        }
    }

    getTagInfo(tagName) {
        Utility.log(Context, "getTagInfo");
        Utility.enforceTypes(arguments, String);

        for (let taginfo of this.tags) {
            if (taginfo.name === tagName || taginfo.dictionary === tagName || taginfo.nerMap === tagName || taginfo.dialog === tagName) {
                return taginfo;
            }
        }
        return {};
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
}
