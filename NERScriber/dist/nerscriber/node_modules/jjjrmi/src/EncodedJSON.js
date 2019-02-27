"use strict";
class EncodedJSON{
    constructor(json){
        if (json === null) throw new Error("JSON object is null.");
        if (typeof json === "undefined") throw new Error("JSON object is undefined.");  
        this.json = json;
    }

    has(key){
        return typeof this.json[key] !== "undefined";
    }

    get(key){
        return this.json[key];
    }

    toString(){
        return JSON.stringify(this.json, null, 2);
    }
}

module.exports = EncodedJSON;