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
    let context = await getJSON("test.context.json");

    let settings = {
        document: this.source,
        context: context
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
    description: "Plain document with a custom context provided.",
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
        location_toronto: {
            description: "text 'Toronto' tagged as 'Somewhere'",
            run: async function () {                
                let xml = await loadNER.call(this);
                let element = xml.querySelector("Somewhere");
                this.assert(element.textContent === "Toronto");
            }
        },
        has_lemma_attribute : {
            description: "lemma attribute in the default context is 'lemma'",
            run: async function () {                
                let xml = await loadNER.call(this);
                let element = xml.querySelector("Somewhere");
                this.assert(element.hasAttribute("lemma") === true);
            }            
        },
        no_link_attribute : {
            description: "the link attribute is not filled in by the 'ner' service",
            run: async function () {                
                let xml = await loadNER.call(this);
                let element = xml.querySelector("Somewhere");
                this.assert(element.hasAttribute("link") === false);
            }            
        },        
        lemma_toronto: {
            description: "lemma attribute by default the same as the text",
            run: async function () {                
                let xml = await loadNER.call(this);
                let element = xml.querySelector("Somewhere");
                this.assert(element.getAttribute("lemma") === "Toronto");
            }
        },
        will_tag: {
            description: "text is tagged as 'LOCATION', will tag with 'Somewhere'",
            run: async function () {                
                let xml = await loadNER.call(this);
                let childElement = xml.querySelector("[id='canada_no_tag']").children[0];
                if (childElement.tagName === "Somewhere") this.success = true;
            }
        },
        do_tag: {
            description: "text inside non-entity tag will be tagged",
            run: async function () {                
                let xml = await loadNER.call(this);
                this.assert(xml.querySelector("[id='canada_tag']").innerHTML === `<Somewhere lemma="Canada">Canada</Somewhere>`);
            }
        },
        tag_organization: {
            description: "'Toronto Hydro' tagged as organization",
            run: async function () {                
                let xml = await loadNER.call(this);
                this.assert(xml.querySelector("[lemma='Toronto Hydro']").tagName === `Something`);
            }
        },
        tag_person: {
            description: "'William Lyon Mackenzie' tagged as person",
            run: async function () {                
                let xml = await loadNER.call(this);
                this.assert(xml.querySelector("[lemma='William Lyon Mackenzie']").tagName === `Someone`);
            }
        },
        tag_organization_default: {
            description: "organization (Somewhere) has a default attribute (ima)",
            run: async function () {                
                let xml = await loadNER.call(this);
                this.assert(xml.querySelector("[lemma='Toronto Hydro']").getAttribute("ima") === `org`);
            }
        },
        tag_person_default: {
            description: "person (Someone) has multiple default attributes",
            run: async function () {                
                let xml = await loadNER.call(this);
                
                this.assert(xml.querySelector("[lemma='William Lyon Mackenzie']").getAttribute("A") === `eh`);
                this.assert(xml.querySelector("[lemma='William Lyon Mackenzie']").getAttribute("B") === `bee`);
            }
        }        
    }
};

