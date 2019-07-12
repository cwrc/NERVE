"use strict";
const postJSON = require("../frame/postJSON.js");
const getXML = require("../frame/getXML.js");
const getJSON = require("../frame/getJSON.js");

/**
 * Load and NER the given file.  Bind to test object when called.
 * Return the xml document.
 */
async function serviceAll() {
    this.source = await getXML("plain-link.xml");
    let context = await getJSON("test.context.2.json");

    let settings = {
        document: this.source,
        context: context
    };
    
    this.result = await postJSON("dict-link", JSON.stringify(settings));
    let parser = new DOMParser();
    this.xml = parser.parseFromString(this.result.document, "text/xml");
    
    return this.xml;
}

module.exports = {    
    description: "Link-Dictionary on plain document with custom context.  Using 'test' dictionary.",
    suiteSetup: async function(){
        console.log("suiteSetup");
        await postJSON("setup-test-all", null);
    },    
    tests: {
        no_lemma: {
            description: "where no lemma is provided no linking will occur",
            run: async function () {
                let xml = await serviceAll.call(this);
                let child = xml.querySelector("[id='1']");
                this.assert(child.hasAttribute("link") === false);
            }
        },
        mismatched_lemma: {
            description: "where the lemma does not match, no linking will occur",
            run: async function () {
                let xml = await serviceAll.call(this);
                let child = xml.querySelector("[id='2']");
                this.assert(child.hasAttribute("link") === false);
            }
        },
        link_already_exists_1: {
            description: "when a link attribute already exists, no linking will occur",
            run: async function () {
                let xml = await serviceAll.call(this);
                let child = xml.querySelector("[id='3']");
                this.assert(child.getAttribute("link") === "ima link");
            }
        },
        link_already_exists_2: {
            description: "when a link attribute already exists, no linking will occur, even when the link value is empty",
            run: async function () {
                let xml = await serviceAll.call(this);
                let child = xml.querySelector("[id='4']");
                this.assert(child.getAttribute("link") === "");
            }
        },
        will_link: {
            description: "link when pre-conditions are met",
            run: async function () {
                let xml = await serviceAll.call(this);
                let child = xml.querySelector("[id='5']");
                this.assert(child.getAttribute("link") === "http:/TorontoHydro.ca");
            }
        }           
    }
};