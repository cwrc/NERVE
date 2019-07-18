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
        },
        non_alphabet_chars: {
            description: "ner will ignore strings without any alphabet chars",
            run: async function () {    
                let xml = await loadNER.call(this);
                let element = xml.querySelector("[id='4']");
                this.assert(element.innerHTML === "123123");
            }
        },
        load_plain_default_context: {
            description: "result returns a context when none provided",
            run: async function () {
                this.source = await getXML("plain.xml");

                let settings = {
                    document: this.source
                };

                this.result = await postJSON("ner", JSON.stringify(settings));
                this.assert(this.result.context !== "");
            }
        },
        load_plain_provided_context: {
            description: "result returns a context when provided",
            run: async function () {
                this.source = await getXML("plain.xml");
                let context = await getJSON("test.context.json");

                let settings = {
                    document: this.source,
                    context: context
                };

                this.result = await postJSON("ner", JSON.stringify(settings));
                this.assert(this.result.context !== "");
            }
        },
        location_toronto: {
            description: "text 'Toronto' tagged as 'LOCATION'",
            run: async function () {
                let xml = await loadNER.call(this);
                let element = xml.querySelector("LOCATION");
                this.assert(element.textContent === "Toronto");
            }
        },
        has_lemma_attribute: {
            description: "lemma attribute in the default context is 'lemma'",
            run: async function () {
                let xml = await loadNER.call(this);
                let element = xml.querySelector("LOCATION");
                this.assert(element.hasAttribute("lemma") === true);
            }
        },
        no_link_attribute: {
            description: "the link attribute is not filled in by the 'ner' service",
            run: async function () {
                let xml = await loadNER.call(this);
                let element = xml.querySelector("LOCATION");
                this.assert(element.hasAttribute("link") === false);
            }
        },
        lemma_toronto: {
            description: "lemma attribute by default the same as the text",
            run: async function () {
                let xml = await loadNER.call(this);
                let element = xml.querySelector("LOCATION");
                this.assert(element.getAttribute("lemma") === "Toronto");
            }
        },
        no_document: {
            description: "not having a document throws an error (status 400)",
            run: async function () {
                let settings = {
                };

                try {
                    this.result = await postJSON("ner", JSON.stringify(settings));
                    this.assert(false);
                } catch (ex) {
                    this.exception = ex;
                    this.assert(true);
                }
            }
        },
        null_settings: {
            description: "null settings throws and exception (status 500)",
            run: async function () {
                try {
                    this.result = await postJSON("ner", null);
                    this.assert(false);
                } catch (ex) {
                    this.exception = ex;
                    this.assert(true);
                }
            }
        },
        undef_settings: {
            description: "undefined settings throws and exception (status 500)",
            run: async function () {
                try {
                    this.result = await postJSON("ner", null);
                    this.assert(false);
                } catch (ex) {
                    this.exception = ex;
                    this.assert(true);
                }
            }
        },
        no_tag: {
            description: "text already tagged will not be tagged",
            run: async function () {
                let xml = await loadNER.call(this);
                this.assert(xml.querySelector("[id='canada_no_tag']").innerHTML === "Canada");
            }
        },
        do_tag: {
            description: "text inside non-entity tag will be tagged",
            run: async function () {
                let xml = await loadNER.call(this);
                this.assert(xml.querySelector("[id='canada_tag']").innerHTML === `<LOCATION lemma="Canada">Canada</LOCATION>`);
            }
        },
        nested_no_tag: {
            description: "text nested inside a tagged element will not be tagged",
            run: async function () {
                let xml = await loadNER.call(this);
                this.assert(xml.querySelector("[id='ontario']").innerHTML === `<div>Ontario</div>`);
            }
        },
        tag_organization: {
            description: "'Toronto Hydro' tagged as organization",
            run: async function () {
                let xml = await loadNER.call(this);
                this.assert(xml.querySelector("[lemma='Toronto Hydro']").tagName === `ORGANIZATION`);
            }
        },
        tag_person: {
            description: "'William Lyon Mackenzie' tagged as person",
            run: async function () {
                let xml = await loadNER.call(this);
                this.assert(xml.querySelector("[lemma='William Lyon Mackenzie']").tagName === `PERSON`);
            }
        }
    }
};

