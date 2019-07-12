(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TestMain = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){


module.exports = {
    rootPath : "assets/test-documents/"
};

},{}],2:[function(require,module,exports){
"use strict";
/**
 * Retrieve a JSON file and return it as a JS object.
 * @param {type} url
 * @param {type} json
 * @returns {Promise}
 */

const rootPath = require("./constants").rootPath;

module.exports = function getXML(filename) {
    let callback = function (resolve, reject) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    resolve(JSON.parse(xhttp.responseText));
                } else {
                    reject(null);
                }
            }
        };

        xhttp.open("POST", rootPath + filename, true);
        xhttp.setRequestHeader("Content-Type", "application/xml;charset=UTF-8");        
        xhttp.send();
    };

    return new Promise(callback);
};
},{"./constants":1}],3:[function(require,module,exports){
"use strict";
/**
 * Request a local xml document using post with json input.
 * @param {type} url
 * @param {type} json
 * @returns {Promise}
 */

const rootPath = require("./constants").rootPath;

module.exports = function getXML(filename) {
    let callback = function (resolve, reject) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    resolve(xhttp.responseText);
                } else {
                    reject(null);
                }
            }
        };

        xhttp.open("POST", rootPath + filename, true);
        xhttp.setRequestHeader("Content-Type", "application/xml;charset=UTF-8");        
        xhttp.send();
    };

    return new Promise(callback);
};
},{"./constants":1}],4:[function(require,module,exports){
/**
 * Request a web service using post with json input.  Returns a json object
 * with the service results.
 * @param {type} url
 * @param {type} json
 * @returns {Promise}
 */

"use strict";
module.exports = function postJSON(url, json) {
    let callback = function (resolve, reject) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    resolve(JSON.parse(xhttp.responseText));
                } else {
                    let obj = JSON.parse(xhttp.responseText);
                    if (!obj.status) obj.status = xhttp.status;
                    reject(obj);
                }
            }
        };

        xhttp.open("POST", url, true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");        
        xhttp.send(json);
    };

    return new Promise(callback);
};
},{}],5:[function(require,module,exports){
const postJSON = require("./frame/postJSON");

function assert(value){
    if (value && this.success) this.success = true;
    else this.success = false;
    this.assertations = this.assertations + 1;
}


class TestMain {

    constructor() {
    }

    async start() {

    }

    async genCoverage() {
        document.querySelector("#genButton").classList.add("busy");
        await postJSON(`/NerveService/JACOCODataServlet`, `{action:\"exec\"})`);
        await postJSON(`/NerveService/JACOCODataServlet`, `{action:\"report\"})`);
        document.querySelector("#genButton").classList.remove("busy");
    }

    viewCoverage() {
        let win = window.open("/NerveService/coverage/", "_blank");        
        win.focus();
    }

    async runFunctional() {
        let suites = [];
        window.suites = suites;
        suites.push(require("./tests/test-plain.js"));
        suites.push(require("./tests/test-custom-context.js"));
        suites.push(require("./tests/test-all-dictionary.js"));
        suites.push(require("./tests/test-link-dictionary.js"));
//        suites.push(require("./tests/test-schema.js"));
        
        for (let suite of suites) this.setupSuiteDom(suite);
        for (let suite of suites) await this.runSuite(suite);
    }

    /**
     * Add dom elements for each test.  Point test.reportElement to it.
     * @param {type} selector
     * @param {type} suite
     * @return {undefined}
     */
    setupSuiteDom(suite){
        let parent = document.createElement("div");
        parent.classList.add("results");
        let desc = document.createElement("div");
        desc.classList.add("description");
        desc.textContent = suite.description;
        parent.append(desc);
        document.body.append(parent);
        
        for (let testname in suite.tests) {
            let test = suite.tests[testname];
            let element = this.createReportElement(testname, test);
            test.reportElement = element;
            parent.append(element);
        }
    }

    createReportElement(name, test){
        let div = document.createElement("div");
        div.textContent = test.description + " - ";
        div.setAttribute("success", `undefined`);
        
        let namespan = document.createElement("span");
        namespan.textContent = ` (${name})`;
        namespan.setAttribute("class", "name");
        div.append(namespan);
        
        let viewDocument = document.createElement("span");            
        viewDocument.textContent = "[doc]";
        div.append(viewDocument);
        viewDocument.setAttribute("class", "view doc");
        viewDocument.onclick = ()=>this.viewDoc(test);

        let viewException = document.createElement("span");            
        viewException.textContent = "[ex]";
        div.append(viewException);
        viewException.setAttribute("class", "view ex");
        viewException.onclick = ()=>this.viewEx(test);        
        
        return div;        
    }

    notifyChild(childMain){
        childMain.document("x");
    }

    viewDoc(test){          
        if (test.result){
            let win = window.open("index.html");
            win.addEventListener("mainready", (event)=>{
                event.detail.document(test.result.document);
            });
            win.focus();
        }
    }

    viewEx(test){          
        if (test.exception){
            let win = window.open("text/plain", "replace");
            let target = test.exception;
            let text = JSON.stringify(target, null, 4);
            win.document.write(`<pre>${text}</pre>`);
            win.focus();
        }
    }

    async runSuite(suite) {
        console.log("runSuite");
        
        if (suite.suiteSetup) await suite.suiteSetup();
        
        for (let testname in suite.tests) {
            let test = suite.tests[testname];
            test.reportElement.setAttribute("success", `running`);
            test.success = true;
            
            test.assertations = 0;
            test.assert = assert.bind(test);
            
            try {
                if (suite.preTest) await suite.preTest();
                await test.run();                
                if (suite.postTest) await suite.postTest();
                test.reportElement.setAttribute("success", `${test.success}`);
            } catch (ex) {
                test.success = "exception";
                test.exception = ex;
                test.reportElement.setAttribute("success", `exception`);
                console.warn(ex);
            }            
            
            test.reportElement.setAttribute("asserts", `${test.assertations}`);
            
            if (test.exception) test.reportElement.querySelector(".view.ex").style.display = "inline";
           if (test.result) test.reportElement.querySelector(".view.doc").style.display = "inline";
        }
        return suite;
    }
}

module.exports = TestMain;



},{"./frame/postJSON":4,"./tests/test-all-dictionary.js":6,"./tests/test-custom-context.js":7,"./tests/test-link-dictionary.js":8,"./tests/test-plain.js":9}],6:[function(require,module,exports){
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
},{"../frame/getJSON.js":2,"../frame/getXML.js":3,"../frame/postJSON.js":4}],7:[function(require,module,exports){
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
                this.assert(childElement.tagName === "Somewhere");
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


},{"../frame/getJSON.js":2,"../frame/getXML.js":3,"../frame/postJSON.js":4}],8:[function(require,module,exports){
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
},{"../frame/getJSON.js":2,"../frame/getXML.js":3,"../frame/postJSON.js":4}],9:[function(require,module,exports){
"use strict";
const postJSON = require("../frame/postJSON.js");
const getXML = require("../frame/getXML.js");

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
        location_toronto: {
            description: "text 'Toronto' tagged as 'LOCATION'",
            run: async function () {                
                let xml = await loadNER.call(this);
                let element = xml.querySelector("LOCATION");
                this.assert(element.textContent === "Toronto");
            }
        },
        has_lemma_attribute : {
            description: "lemma attribute in the default context is 'lemma'",
            run: async function () {                
                let xml = await loadNER.call(this);
                let element = xml.querySelector("LOCATION");
                this.assert(element.hasAttribute("lemma") === true);
            }            
        },
        no_link_attribute : {
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


},{"../frame/getXML.js":3,"../frame/postJSON.js":4}]},{},[5])(5)
});
