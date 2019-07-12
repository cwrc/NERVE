"use strict";
const postJSON = require("../frame/postJSON.js");
const getXML = require("../frame/getXML.js");
const getJSON = require("../frame/getJSON.js");

/**
 * Load and NER the given file.  Bind to test object when called.
 * Return the xml document.
 */
async function serviceAll() {
    this.source = await getXML("plain.xml");
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
    description: "All-Dictionary (tag, lemma & link) on plain document with custom context.  Using 'test' dictionary.",
    suiteSetup: async function(){
        console.log("suiteSetup");
        await postJSON("setup-test-all", null);
    },    
    tests: {
        longest_entity_1: {
            description: "where multiple entities could match, choose the longest",
            run: async function () {
                let xml = await serviceAll.call(this);
                let child1 = xml.querySelector("div[id='1']").children[0];
                let child2 = xml.querySelector("div[id='2']").children[0];
                let child3 = xml.querySelector("div[id='3']").children[0];
                
                this.assert(child1.innerHTML === "Toronto");
                this.assert(child2.innerHTML === "Toronto Ontario");
                this.assert(child3.innerHTML === "Toronto Ontario Canada");
            }
        },
        default_attribute: {
            description: "insert default attribute when service performs the tagging",
            run: async function () {
                let xml = await serviceAll.call(this);
                let entity = xml.querySelector("LOCATION");
                this.assert(entity.getAttribute("tagged-by") === "test");
            }
        },
        empty_link: {
            description: "entities without link values will not have link attributes",
            run: async function () {
                let xml = await serviceAll.call(this);
                let entity = xml.querySelector("LOCATION");
                this.assert(entity.hasAttribute("link") === false);
            }
        },
        has_link: {
            description: "entities with link values will have link attributes",
            run: async function () {
                let xml = await serviceAll.call(this);
                let entity = xml.querySelector("[lemma='Toronto Hydro Corp.']");
                this.assert(entity !== null);
                this.assert(entity.hasAttribute("link") === true);
            }
        }        
    }
};