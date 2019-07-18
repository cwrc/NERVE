"use strict";
const postJSON = require("../frame/postJSON.js");
const getXML = require("../frame/getXML.js");
const getJSON = require("../frame/getJSON.js");

/**
 * Load and NER the given file.  Bind to test object when called.
 * Return the xml document.
 */
async function prequel() {
    this.source = await getXML("for_schema_test.xml");
    let context = await getJSON("test.context.3.json");

    let settings = {
        document: this.source,
        context: context
    };

    this.result = await postJSON("ner", JSON.stringify(settings));
    let parser = new DOMParser();
    this.xml = parser.parseFromString(this.result.document, "text/xml");

    return this.xml;
}

module.exports = {
    description: "Test the schema with NER tagging.",
    tests: {
        load: {
            description: "load with schema declared by context",
            run: async function () {
                this.source = await getXML("for_schema_test.xml");
                let context = await getJSON("test.context.3.json");

                let settings = {
                    document: this.source,
                    context: context
                };

                this.result = await postJSON("ner", JSON.stringify(settings));
            }
        },
        will_tag_toronto: {
            description: "tag in the 'all' element",
            run: async function () {
                let xml = await prequel.call(this);
                let result = xml.querySelector("[id='1']");
                this.assert(result.childElementCount === 1);
            }
        },
        will_not_tag_toronto: {
            description: "do not tag in the 'div' element",
            run: async function () {
                let xml = await prequel.call(this);
                let result = xml.querySelector("[id='2']");
                this.assert(result.childElementCount === 0);
            }
        }                
    }
};