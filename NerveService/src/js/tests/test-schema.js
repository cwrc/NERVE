"use strict";
const postJSON = require("../frame/postJSON.js");
const getXML = require("../frame/getXML.js");
const getJSON = require("../frame/getJSON.js");

/**
 * Load and NER the given file.  Bind to test object when called.
 * Return the xml document.
 */
async function serviceAll() {
    this.source = await getXML("for_schema_test.xml");
    let context = await getJSON("test.context.2.json");

    let settings = {
        document: this.source,
        context: context
    };
    
    this.result = await postJSON("dict-all", JSON.stringify(settings));
    let parser = new DOMParser();
    this.xml = parser.parseFromString(this.result.document, "text/xml");
    
    return this.xml;
}

module.exports = {    
    description: "Test the schema with NER tagging.",
    tests: {
        longest_entity_1: {
            description: "where multiple entities could match, choose the longest",
            run: async function () {
                let xml = await serviceAll.call(this);
            }
        }
    }
};