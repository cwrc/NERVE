"use strict";
const postJSON = require("../frame/postJSON.js");
const getXML = require("../frame/getXML.js");
const getJSON = require("../frame/getJSON.js");

/**
 * Load and NER the given file.  Bind to test object when called.
 * Return the xml document.
 */
async function loadNER() {
    this.source = await getXML("plain.xml");

    let settings = {
        document: this.source
    };

    this.result = await postJSON("ner", JSON.stringify(settings));
    let parser = new DOMParser();
    this.xml = parser.parseFromString(this.result.document, "text/xml");

    return this.xml;
}

/**
 * put the {true, false} in test.success.
 * put the returned value in test.result.
 */

module.exports = {
    description: "NER service on plain document without a context or a schema.",
    tests: {
        load_plain: {
            description: "markup the plain document using ner-service",
            run: async function () {
                this.source = await getXML("plain.xml");

                let settings = {
                    document: this.source
                };

                this.result = await postJSON("ner", JSON.stringify(settings));
                this.assert(true);
            }
        }
    }
};

