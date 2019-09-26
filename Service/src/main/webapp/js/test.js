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
//        suites.push(require("./tests/test-single.js"));

        suites.push(require("./tests/test-plain.js"));
        suites.push(require("./tests/test-custom-context.js"));
        suites.push(require("./tests/test-all-dictionary.js"));
        suites.push(require("./tests/test-link-dictionary.js"));
        suites.push(require("./tests/test-schema.js"));
        
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



},{"./frame/postJSON":4,"./tests/test-all-dictionary.js":6,"./tests/test-custom-context.js":7,"./tests/test-link-dictionary.js":8,"./tests/test-plain.js":9,"./tests/test-schema.js":10}],6:[function(require,module,exports){
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


},{"../frame/getJSON.js":2,"../frame/getXML.js":3,"../frame/postJSON.js":4}],10:[function(require,module,exports){
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
},{"../frame/getJSON.js":2,"../frame/getXML.js":3,"../frame/postJSON.js":4}]},{},[5])(5)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvZnJhbWUvY29uc3RhbnRzLmpzIiwic3JjL2pzL2ZyYW1lL2dldEpTT04uanMiLCJzcmMvanMvZnJhbWUvZ2V0WE1MLmpzIiwic3JjL2pzL2ZyYW1lL3Bvc3RKU09OLmpzIiwic3JjL2pzL3Rlc3QuanMiLCJzcmMvanMvdGVzdHMvdGVzdC1hbGwtZGljdGlvbmFyeS5qcyIsInNyYy9qcy90ZXN0cy90ZXN0LWN1c3RvbS1jb250ZXh0LmpzIiwic3JjL2pzL3Rlc3RzL3Rlc3QtbGluay1kaWN0aW9uYXJ5LmpzIiwic3JjL2pzL3Rlc3RzL3Rlc3QtcGxhaW4uanMiLCJzcmMvanMvdGVzdHMvdGVzdC1zY2hlbWEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHJvb3RQYXRoIDogXCJhc3NldHMvdGVzdC1kb2N1bWVudHMvXCJcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKlxuICogUmV0cmlldmUgYSBKU09OIGZpbGUgYW5kIHJldHVybiBpdCBhcyBhIEpTIG9iamVjdC5cbiAqIEBwYXJhbSB7dHlwZX0gdXJsXG4gKiBAcGFyYW0ge3R5cGV9IGpzb25cbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5cbmNvbnN0IHJvb3RQYXRoID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpLnJvb3RQYXRoO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldFhNTChmaWxlbmFtZSkge1xuICAgIGxldCBjYWxsYmFjayA9IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgdmFyIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHhodHRwLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICBpZiAoeGh0dHAuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgeGh0dHAub3BlbihcIlBPU1RcIiwgcm9vdFBhdGggKyBmaWxlbmFtZSwgdHJ1ZSk7XG4gICAgICAgIHhodHRwLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi94bWw7Y2hhcnNldD1VVEYtOFwiKTsgICAgICAgIFxuICAgICAgICB4aHR0cC5zZW5kKCk7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShjYWxsYmFjayk7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBSZXF1ZXN0IGEgbG9jYWwgeG1sIGRvY3VtZW50IHVzaW5nIHBvc3Qgd2l0aCBqc29uIGlucHV0LlxuICogQHBhcmFtIHt0eXBlfSB1cmxcbiAqIEBwYXJhbSB7dHlwZX0ganNvblxuICogQHJldHVybnMge1Byb21pc2V9XG4gKi9cblxuY29uc3Qgcm9vdFBhdGggPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIikucm9vdFBhdGg7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0WE1MKGZpbGVuYW1lKSB7XG4gICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB2YXIgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoeGh0dHAucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgIGlmICh4aHR0cC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHhodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB4aHR0cC5vcGVuKFwiUE9TVFwiLCByb290UGF0aCArIGZpbGVuYW1lLCB0cnVlKTtcbiAgICAgICAgeGh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL3htbDtjaGFyc2V0PVVURi04XCIpOyAgICAgICAgXG4gICAgICAgIHhodHRwLnNlbmQoKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGNhbGxiYWNrKTtcbn07IiwiLyoqXG4gKiBSZXF1ZXN0IGEgd2ViIHNlcnZpY2UgdXNpbmcgcG9zdCB3aXRoIGpzb24gaW5wdXQuICBSZXR1cm5zIGEganNvbiBvYmplY3RcbiAqIHdpdGggdGhlIHNlcnZpY2UgcmVzdWx0cy5cbiAqIEBwYXJhbSB7dHlwZX0gdXJsXG4gKiBAcGFyYW0ge3R5cGV9IGpzb25cbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5cblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwb3N0SlNPTih1cmwsIGpzb24pIHtcbiAgICBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh4aHR0cC5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHhodHRwLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgb2JqID0gSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW9iai5zdGF0dXMpIG9iai5zdGF0dXMgPSB4aHR0cC5zdGF0dXM7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChvYmopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB4aHR0cC5vcGVuKFwiUE9TVFwiLCB1cmwsIHRydWUpO1xuICAgICAgICB4aHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PVVURi04XCIpOyAgICAgICAgXG4gICAgICAgIHhodHRwLnNlbmQoanNvbik7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShjYWxsYmFjayk7XG59OyIsImNvbnN0IHBvc3RKU09OID0gcmVxdWlyZShcIi4vZnJhbWUvcG9zdEpTT05cIik7XG5cbmZ1bmN0aW9uIGFzc2VydCh2YWx1ZSl7XG4gICAgaWYgKHZhbHVlICYmIHRoaXMuc3VjY2VzcykgdGhpcy5zdWNjZXNzID0gdHJ1ZTtcbiAgICBlbHNlIHRoaXMuc3VjY2VzcyA9IGZhbHNlO1xuICAgIHRoaXMuYXNzZXJ0YXRpb25zID0gdGhpcy5hc3NlcnRhdGlvbnMgKyAxO1xufVxuXG5cbmNsYXNzIFRlc3RNYWluIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cblxuICAgIGFzeW5jIHN0YXJ0KCkge1xuXG4gICAgfVxuXG4gICAgYXN5bmMgZ2VuQ292ZXJhZ2UoKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2VuQnV0dG9uXCIpLmNsYXNzTGlzdC5hZGQoXCJidXN5XCIpO1xuICAgICAgICBhd2FpdCBwb3N0SlNPTihgL05lcnZlU2VydmljZS9KQUNPQ09EYXRhU2VydmxldGAsIGB7YWN0aW9uOlxcXCJleGVjXFxcIn0pYCk7XG4gICAgICAgIGF3YWl0IHBvc3RKU09OKGAvTmVydmVTZXJ2aWNlL0pBQ09DT0RhdGFTZXJ2bGV0YCwgYHthY3Rpb246XFxcInJlcG9ydFxcXCJ9KWApO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dlbkJ1dHRvblwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiYnVzeVwiKTtcbiAgICB9XG5cbiAgICB2aWV3Q292ZXJhZ2UoKSB7XG4gICAgICAgIGxldCB3aW4gPSB3aW5kb3cub3BlbihcIi9OZXJ2ZVNlcnZpY2UvY292ZXJhZ2UvXCIsIFwiX2JsYW5rXCIpOyAgICAgICAgXG4gICAgICAgIHdpbi5mb2N1cygpO1xuICAgIH1cblxuICAgIGFzeW5jIHJ1bkZ1bmN0aW9uYWwoKSB7XG4gICAgICAgIGxldCBzdWl0ZXMgPSBbXTtcbiAgICAgICAgd2luZG93LnN1aXRlcyA9IHN1aXRlcztcbi8vICAgICAgICBzdWl0ZXMucHVzaChyZXF1aXJlKFwiLi90ZXN0cy90ZXN0LXNpbmdsZS5qc1wiKSk7XG5cbiAgICAgICAgc3VpdGVzLnB1c2gocmVxdWlyZShcIi4vdGVzdHMvdGVzdC1wbGFpbi5qc1wiKSk7XG4gICAgICAgIHN1aXRlcy5wdXNoKHJlcXVpcmUoXCIuL3Rlc3RzL3Rlc3QtY3VzdG9tLWNvbnRleHQuanNcIikpO1xuICAgICAgICBzdWl0ZXMucHVzaChyZXF1aXJlKFwiLi90ZXN0cy90ZXN0LWFsbC1kaWN0aW9uYXJ5LmpzXCIpKTtcbiAgICAgICAgc3VpdGVzLnB1c2gocmVxdWlyZShcIi4vdGVzdHMvdGVzdC1saW5rLWRpY3Rpb25hcnkuanNcIikpO1xuICAgICAgICBzdWl0ZXMucHVzaChyZXF1aXJlKFwiLi90ZXN0cy90ZXN0LXNjaGVtYS5qc1wiKSk7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBzdWl0ZSBvZiBzdWl0ZXMpIHRoaXMuc2V0dXBTdWl0ZURvbShzdWl0ZSk7XG4gICAgICAgIGZvciAobGV0IHN1aXRlIG9mIHN1aXRlcykgYXdhaXQgdGhpcy5ydW5TdWl0ZShzdWl0ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGRvbSBlbGVtZW50cyBmb3IgZWFjaCB0ZXN0LiAgUG9pbnQgdGVzdC5yZXBvcnRFbGVtZW50IHRvIGl0LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gc2VsZWN0b3JcbiAgICAgKiBAcGFyYW0ge3R5cGV9IHN1aXRlXG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHNldHVwU3VpdGVEb20oc3VpdGUpe1xuICAgICAgICBsZXQgcGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgcGFyZW50LmNsYXNzTGlzdC5hZGQoXCJyZXN1bHRzXCIpO1xuICAgICAgICBsZXQgZGVzYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGRlc2MuY2xhc3NMaXN0LmFkZChcImRlc2NyaXB0aW9uXCIpO1xuICAgICAgICBkZXNjLnRleHRDb250ZW50ID0gc3VpdGUuZGVzY3JpcHRpb247XG4gICAgICAgIHBhcmVudC5hcHBlbmQoZGVzYyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKHBhcmVudCk7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCB0ZXN0bmFtZSBpbiBzdWl0ZS50ZXN0cykge1xuICAgICAgICAgICAgbGV0IHRlc3QgPSBzdWl0ZS50ZXN0c1t0ZXN0bmFtZV07XG4gICAgICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuY3JlYXRlUmVwb3J0RWxlbWVudCh0ZXN0bmFtZSwgdGVzdCk7XG4gICAgICAgICAgICB0ZXN0LnJlcG9ydEVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICAgICAgcGFyZW50LmFwcGVuZChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZVJlcG9ydEVsZW1lbnQobmFtZSwgdGVzdCl7XG4gICAgICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkaXYudGV4dENvbnRlbnQgPSB0ZXN0LmRlc2NyaXB0aW9uICsgXCIgLSBcIjtcbiAgICAgICAgZGl2LnNldEF0dHJpYnV0ZShcInN1Y2Nlc3NcIiwgYHVuZGVmaW5lZGApO1xuICAgICAgICBcbiAgICAgICAgbGV0IG5hbWVzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIG5hbWVzcGFuLnRleHRDb250ZW50ID0gYCAoJHtuYW1lfSlgO1xuICAgICAgICBuYW1lc3Bhbi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcIm5hbWVcIik7XG4gICAgICAgIGRpdi5hcHBlbmQobmFtZXNwYW4pO1xuICAgICAgICBcbiAgICAgICAgbGV0IHZpZXdEb2N1bWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpOyAgICAgICAgICAgIFxuICAgICAgICB2aWV3RG9jdW1lbnQudGV4dENvbnRlbnQgPSBcIltkb2NdXCI7XG4gICAgICAgIGRpdi5hcHBlbmQodmlld0RvY3VtZW50KTtcbiAgICAgICAgdmlld0RvY3VtZW50LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwidmlldyBkb2NcIik7XG4gICAgICAgIHZpZXdEb2N1bWVudC5vbmNsaWNrID0gKCk9PnRoaXMudmlld0RvYyh0ZXN0KTtcblxuICAgICAgICBsZXQgdmlld0V4Y2VwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpOyAgICAgICAgICAgIFxuICAgICAgICB2aWV3RXhjZXB0aW9uLnRleHRDb250ZW50ID0gXCJbZXhdXCI7XG4gICAgICAgIGRpdi5hcHBlbmQodmlld0V4Y2VwdGlvbik7XG4gICAgICAgIHZpZXdFeGNlcHRpb24uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJ2aWV3IGV4XCIpO1xuICAgICAgICB2aWV3RXhjZXB0aW9uLm9uY2xpY2sgPSAoKT0+dGhpcy52aWV3RXgodGVzdCk7ICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBkaXY7ICAgICAgICBcbiAgICB9XG5cbiAgICBub3RpZnlDaGlsZChjaGlsZE1haW4pe1xuICAgICAgICBjaGlsZE1haW4uZG9jdW1lbnQoXCJ4XCIpO1xuICAgIH1cblxuICAgIHZpZXdEb2ModGVzdCl7ICAgICAgICAgIFxuICAgICAgICBpZiAodGVzdC5yZXN1bHQpe1xuICAgICAgICAgICAgbGV0IHdpbiA9IHdpbmRvdy5vcGVuKFwiaW5kZXguaHRtbFwiKTtcbiAgICAgICAgICAgIHdpbi5hZGRFdmVudExpc3RlbmVyKFwibWFpbnJlYWR5XCIsIChldmVudCk9PntcbiAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwuZG9jdW1lbnQodGVzdC5yZXN1bHQuZG9jdW1lbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB3aW4uZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZpZXdFeCh0ZXN0KXsgICAgICAgICAgXG4gICAgICAgIGlmICh0ZXN0LmV4Y2VwdGlvbil7XG4gICAgICAgICAgICBsZXQgd2luID0gd2luZG93Lm9wZW4oXCJ0ZXh0L3BsYWluXCIsIFwicmVwbGFjZVwiKTtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSB0ZXN0LmV4Y2VwdGlvbjtcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkodGFyZ2V0LCBudWxsLCA0KTtcbiAgICAgICAgICAgIHdpbi5kb2N1bWVudC53cml0ZShgPHByZT4ke3RleHR9PC9wcmU+YCk7XG4gICAgICAgICAgICB3aW4uZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHJ1blN1aXRlKHN1aXRlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicnVuU3VpdGVcIik7XG4gICAgICAgIFxuICAgICAgICBpZiAoc3VpdGUuc3VpdGVTZXR1cCkgYXdhaXQgc3VpdGUuc3VpdGVTZXR1cCgpO1xuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQgdGVzdG5hbWUgaW4gc3VpdGUudGVzdHMpIHtcbiAgICAgICAgICAgIGxldCB0ZXN0ID0gc3VpdGUudGVzdHNbdGVzdG5hbWVdO1xuICAgICAgICAgICAgdGVzdC5yZXBvcnRFbGVtZW50LnNldEF0dHJpYnV0ZShcInN1Y2Nlc3NcIiwgYHJ1bm5pbmdgKTtcbiAgICAgICAgICAgIHRlc3Quc3VjY2VzcyA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRlc3QuYXNzZXJ0YXRpb25zID0gMDtcbiAgICAgICAgICAgIHRlc3QuYXNzZXJ0ID0gYXNzZXJ0LmJpbmQodGVzdCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHN1aXRlLnByZVRlc3QpIGF3YWl0IHN1aXRlLnByZVRlc3QoKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0ZXN0LnJ1bigpOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoc3VpdGUucG9zdFRlc3QpIGF3YWl0IHN1aXRlLnBvc3RUZXN0KCk7XG4gICAgICAgICAgICAgICAgdGVzdC5yZXBvcnRFbGVtZW50LnNldEF0dHJpYnV0ZShcInN1Y2Nlc3NcIiwgYCR7dGVzdC5zdWNjZXNzfWApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICB0ZXN0LnN1Y2Nlc3MgPSBcImV4Y2VwdGlvblwiO1xuICAgICAgICAgICAgICAgIHRlc3QuZXhjZXB0aW9uID0gZXg7XG4gICAgICAgICAgICAgICAgdGVzdC5yZXBvcnRFbGVtZW50LnNldEF0dHJpYnV0ZShcInN1Y2Nlc3NcIiwgYGV4Y2VwdGlvbmApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihleCk7XG4gICAgICAgICAgICB9ICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRlc3QucmVwb3J0RWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJhc3NlcnRzXCIsIGAke3Rlc3QuYXNzZXJ0YXRpb25zfWApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAodGVzdC5leGNlcHRpb24pIHRlc3QucmVwb3J0RWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnZpZXcuZXhcIikuc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lXCI7XG4gICAgICAgICAgIGlmICh0ZXN0LnJlc3VsdCkgdGVzdC5yZXBvcnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudmlldy5kb2NcIikuc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1aXRlO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0TWFpbjtcblxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IHBvc3RKU09OID0gcmVxdWlyZShcIi4uL2ZyYW1lL3Bvc3RKU09OLmpzXCIpO1xuY29uc3QgZ2V0WE1MID0gcmVxdWlyZShcIi4uL2ZyYW1lL2dldFhNTC5qc1wiKTtcbmNvbnN0IGdldEpTT04gPSByZXF1aXJlKFwiLi4vZnJhbWUvZ2V0SlNPTi5qc1wiKTtcblxuLyoqXG4gKiBMb2FkIGFuZCBORVIgdGhlIGdpdmVuIGZpbGUuICBCaW5kIHRvIHRlc3Qgb2JqZWN0IHdoZW4gY2FsbGVkLlxuICogUmV0dXJuIHRoZSB4bWwgZG9jdW1lbnQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNlcnZpY2VBbGwoKSB7XG4gICAgdGhpcy5zb3VyY2UgPSBhd2FpdCBnZXRYTUwoXCJwbGFpbi54bWxcIik7XG4gICAgbGV0IGNvbnRleHQgPSBhd2FpdCBnZXRKU09OKFwidGVzdC5jb250ZXh0LjIuanNvblwiKTtcblxuICAgIGxldCBzZXR0aW5ncyA9IHtcbiAgICAgICAgZG9jdW1lbnQ6IHRoaXMuc291cmNlLFxuICAgICAgICBjb250ZXh0OiBjb250ZXh0XG4gICAgfTtcbiAgICBcbiAgICB0aGlzLnJlc3VsdCA9IGF3YWl0IHBvc3RKU09OKFwiZGljdC1hbGxcIiwgSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MpKTtcbiAgICBsZXQgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgIHRoaXMueG1sID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyh0aGlzLnJlc3VsdC5kb2N1bWVudCwgXCJ0ZXh0L3htbFwiKTtcbiAgICBcbiAgICByZXR1cm4gdGhpcy54bWw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0geyAgICBcbiAgICBkZXNjcmlwdGlvbjogXCJBbGwtRGljdGlvbmFyeSAodGFnLCBsZW1tYSAmIGxpbmspIG9uIHBsYWluIGRvY3VtZW50IHdpdGggY3VzdG9tIGNvbnRleHQuICBVc2luZyAndGVzdCcgZGljdGlvbmFyeS5cIixcbiAgICBzdWl0ZVNldHVwOiBhc3luYyBmdW5jdGlvbigpe1xuICAgICAgICBjb25zb2xlLmxvZyhcInN1aXRlU2V0dXBcIik7XG4gICAgICAgIGF3YWl0IHBvc3RKU09OKFwic2V0dXAtdGVzdC1hbGxcIiwgbnVsbCk7XG4gICAgfSwgICAgXG4gICAgdGVzdHM6IHtcbiAgICAgICAgbG9uZ2VzdF9lbnRpdHlfMToge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwid2hlcmUgbXVsdGlwbGUgZW50aXRpZXMgY291bGQgbWF0Y2gsIGNob29zZSB0aGUgbG9uZ2VzdFwiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IHNlcnZpY2VBbGwuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQxID0geG1sLnF1ZXJ5U2VsZWN0b3IoXCJkaXZbaWQ9JzEnXVwiKS5jaGlsZHJlblswXTtcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQyID0geG1sLnF1ZXJ5U2VsZWN0b3IoXCJkaXZbaWQ9JzInXVwiKS5jaGlsZHJlblswXTtcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQzID0geG1sLnF1ZXJ5U2VsZWN0b3IoXCJkaXZbaWQ9JzMnXVwiKS5jaGlsZHJlblswXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydChjaGlsZDEuaW5uZXJIVE1MID09PSBcIlRvcm9udG9cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5hc3NlcnQoY2hpbGQyLmlubmVySFRNTCA9PT0gXCJUb3JvbnRvIE9udGFyaW9cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5hc3NlcnQoY2hpbGQzLmlubmVySFRNTCA9PT0gXCJUb3JvbnRvIE9udGFyaW8gQ2FuYWRhXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkZWZhdWx0X2F0dHJpYnV0ZToge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiaW5zZXJ0IGRlZmF1bHQgYXR0cmlidXRlIHdoZW4gc2VydmljZSBwZXJmb3JtcyB0aGUgdGFnZ2luZ1wiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IHNlcnZpY2VBbGwuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0geG1sLnF1ZXJ5U2VsZWN0b3IoXCJMT0NBVElPTlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydChlbnRpdHkuZ2V0QXR0cmlidXRlKFwidGFnZ2VkLWJ5XCIpID09PSBcInRlc3RcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVtcHR5X2xpbms6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcImVudGl0aWVzIHdpdGhvdXQgbGluayB2YWx1ZXMgd2lsbCBub3QgaGF2ZSBsaW5rIGF0dHJpYnV0ZXNcIixcbiAgICAgICAgICAgIHJ1bjogYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxldCB4bWwgPSBhd2FpdCBzZXJ2aWNlQWxsLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IHhtbC5xdWVyeVNlbGVjdG9yKFwiTE9DQVRJT05cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5hc3NlcnQoZW50aXR5Lmhhc0F0dHJpYnV0ZShcImxpbmtcIikgPT09IGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaGFzX2xpbms6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcImVudGl0aWVzIHdpdGggbGluayB2YWx1ZXMgd2lsbCBoYXZlIGxpbmsgYXR0cmlidXRlc1wiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IHNlcnZpY2VBbGwuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0geG1sLnF1ZXJ5U2VsZWN0b3IoXCJbbGVtbWE9J1Rvcm9udG8gSHlkcm8gQ29ycC4nXVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydChlbnRpdHkgIT09IG51bGwpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KGVudGl0eS5oYXNBdHRyaWJ1dGUoXCJsaW5rXCIpID09PSB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSAgICAgICAgXG4gICAgfVxufTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IHBvc3RKU09OID0gcmVxdWlyZShcIi4uL2ZyYW1lL3Bvc3RKU09OLmpzXCIpO1xuY29uc3QgZ2V0WE1MID0gcmVxdWlyZShcIi4uL2ZyYW1lL2dldFhNTC5qc1wiKTtcbmNvbnN0IGdldEpTT04gPSByZXF1aXJlKFwiLi4vZnJhbWUvZ2V0SlNPTi5qc1wiKTtcblxuLyoqXG4gKiBMb2FkIGFuZCBORVIgdGhlIGdpdmVuIGZpbGUuICBCaW5kIHRvIHRlc3Qgb2JqZWN0IHdoZW4gY2FsbGVkLlxuICogUmV0dXJuIHRoZSB4bWwgZG9jdW1lbnQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRORVIoKSB7XG4gICAgdGhpcy5zb3VyY2UgPSBhd2FpdCBnZXRYTUwoXCJwbGFpbi54bWxcIik7XG4gICAgbGV0IGNvbnRleHQgPSBhd2FpdCBnZXRKU09OKFwidGVzdC5jb250ZXh0Lmpzb25cIik7XG5cbiAgICBsZXQgc2V0dGluZ3MgPSB7XG4gICAgICAgIGRvY3VtZW50OiB0aGlzLnNvdXJjZSxcbiAgICAgICAgY29udGV4dDogY29udGV4dFxuICAgIH07XG4gICAgXG4gICAgdGhpcy5yZXN1bHQgPSBhd2FpdCBwb3N0SlNPTihcIm5lclwiLCBKU09OLnN0cmluZ2lmeShzZXR0aW5ncykpO1xuICAgIGxldCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgdGhpcy54bWwgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHRoaXMucmVzdWx0LmRvY3VtZW50LCBcInRleHQveG1sXCIpO1xuICAgIFxuICAgIHJldHVybiB0aGlzLnhtbDtcbn1cblxuLyoqXG4gKiBwdXQgdGhlIHt0cnVlLCBmYWxzZX0gaW4gdGVzdC5zdWNjZXNzLlxuICogcHV0IHRoZSByZXR1cm5lZCB2YWx1ZSBpbiB0ZXN0LnJlc3VsdC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBkZXNjcmlwdGlvbjogXCJQbGFpbiBkb2N1bWVudCB3aXRoIGEgY3VzdG9tIGNvbnRleHQgcHJvdmlkZWQuXCIsXG4gICAgdGVzdHM6IHtcbiAgICAgICAgbG9hZF9wbGFpbjoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwibWFya3VwIHRoZSBwbGFpbiBkb2N1bWVudCB1c2luZyBuZXItc2VydmljZVwiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3VyY2UgPSBhd2FpdCBnZXRYTUwoXCJwbGFpbi54bWxcIik7XG5cbiAgICAgICAgICAgICAgICBsZXQgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50OiB0aGlzLnNvdXJjZVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdCA9IGF3YWl0IHBvc3RKU09OKFwibmVyXCIsIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hc3NlcnQodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxvY2F0aW9uX3Rvcm9udG86IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcInRleHQgJ1Rvcm9udG8nIHRhZ2dlZCBhcyAnU29tZXdoZXJlJ1wiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCB4bWwgPSBhd2FpdCBsb2FkTkVSLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSB4bWwucXVlcnlTZWxlY3RvcihcIlNvbWV3aGVyZVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydChlbGVtZW50LnRleHRDb250ZW50ID09PSBcIlRvcm9udG9cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGhhc19sZW1tYV9hdHRyaWJ1dGUgOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJsZW1tYSBhdHRyaWJ1dGUgaW4gdGhlIGRlZmF1bHQgY29udGV4dCBpcyAnbGVtbWEnXCIsXG4gICAgICAgICAgICBydW46IGFzeW5jIGZ1bmN0aW9uICgpIHsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IGxvYWRORVIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudCA9IHhtbC5xdWVyeVNlbGVjdG9yKFwiU29tZXdoZXJlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KGVsZW1lbnQuaGFzQXR0cmlidXRlKFwibGVtbWFcIikgPT09IHRydWUpO1xuICAgICAgICAgICAgfSAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBub19saW5rX2F0dHJpYnV0ZSA6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcInRoZSBsaW5rIGF0dHJpYnV0ZSBpcyBub3QgZmlsbGVkIGluIGJ5IHRoZSAnbmVyJyBzZXJ2aWNlXCIsXG4gICAgICAgICAgICBydW46IGFzeW5jIGZ1bmN0aW9uICgpIHsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IGxvYWRORVIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudCA9IHhtbC5xdWVyeVNlbGVjdG9yKFwiU29tZXdoZXJlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KGVsZW1lbnQuaGFzQXR0cmlidXRlKFwibGlua1wiKSA9PT0gZmFsc2UpO1xuICAgICAgICAgICAgfSAgICAgICAgICAgIFxuICAgICAgICB9LCAgICAgICAgXG4gICAgICAgIGxlbW1hX3Rvcm9udG86IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcImxlbW1hIGF0dHJpYnV0ZSBieSBkZWZhdWx0IHRoZSBzYW1lIGFzIHRoZSB0ZXh0XCIsXG4gICAgICAgICAgICBydW46IGFzeW5jIGZ1bmN0aW9uICgpIHsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IGxvYWRORVIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudCA9IHhtbC5xdWVyeVNlbGVjdG9yKFwiU29tZXdoZXJlXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwibGVtbWFcIikgPT09IFwiVG9yb250b1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgd2lsbF90YWc6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcInRleHQgaXMgdGFnZ2VkIGFzICdMT0NBVElPTicsIHdpbGwgdGFnIHdpdGggJ1NvbWV3aGVyZSdcIixcbiAgICAgICAgICAgIHJ1bjogYXN5bmMgZnVuY3Rpb24gKCkgeyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgeG1sID0gYXdhaXQgbG9hZE5FUi5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZEVsZW1lbnQgPSB4bWwucXVlcnlTZWxlY3RvcihcIltpZD0nY2FuYWRhX25vX3RhZyddXCIpLmNoaWxkcmVuWzBdO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KGNoaWxkRWxlbWVudC50YWdOYW1lID09PSBcIlNvbWV3aGVyZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZG9fdGFnOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJ0ZXh0IGluc2lkZSBub24tZW50aXR5IHRhZyB3aWxsIGJlIHRhZ2dlZFwiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCB4bWwgPSBhd2FpdCBsb2FkTkVSLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hc3NlcnQoeG1sLnF1ZXJ5U2VsZWN0b3IoXCJbaWQ9J2NhbmFkYV90YWcnXVwiKS5pbm5lckhUTUwgPT09IGA8U29tZXdoZXJlIGxlbW1hPVwiQ2FuYWRhXCI+Q2FuYWRhPC9Tb21ld2hlcmU+YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRhZ19vcmdhbml6YXRpb246IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIidUb3JvbnRvIEh5ZHJvJyB0YWdnZWQgYXMgb3JnYW5pemF0aW9uXCIsXG4gICAgICAgICAgICBydW46IGFzeW5jIGZ1bmN0aW9uICgpIHsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IGxvYWRORVIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydCh4bWwucXVlcnlTZWxlY3RvcihcIltsZW1tYT0nVG9yb250byBIeWRybyddXCIpLnRhZ05hbWUgPT09IGBTb21ldGhpbmdgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdGFnX3BlcnNvbjoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiJ1dpbGxpYW0gTHlvbiBNYWNrZW56aWUnIHRhZ2dlZCBhcyBwZXJzb25cIixcbiAgICAgICAgICAgIHJ1bjogYXN5bmMgZnVuY3Rpb24gKCkgeyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgeG1sID0gYXdhaXQgbG9hZE5FUi5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KHhtbC5xdWVyeVNlbGVjdG9yKFwiW2xlbW1hPSdXaWxsaWFtIEx5b24gTWFja2VuemllJ11cIikudGFnTmFtZSA9PT0gYFNvbWVvbmVgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdGFnX29yZ2FuaXphdGlvbl9kZWZhdWx0OiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJvcmdhbml6YXRpb24gKFNvbWV3aGVyZSkgaGFzIGEgZGVmYXVsdCBhdHRyaWJ1dGUgKGltYSlcIixcbiAgICAgICAgICAgIHJ1bjogYXN5bmMgZnVuY3Rpb24gKCkgeyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsZXQgeG1sID0gYXdhaXQgbG9hZE5FUi5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KHhtbC5xdWVyeVNlbGVjdG9yKFwiW2xlbW1hPSdUb3JvbnRvIEh5ZHJvJ11cIikuZ2V0QXR0cmlidXRlKFwiaW1hXCIpID09PSBgb3JnYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRhZ19wZXJzb25fZGVmYXVsdDoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwicGVyc29uIChTb21lb25lKSBoYXMgbXVsdGlwbGUgZGVmYXVsdCBhdHRyaWJ1dGVzXCIsXG4gICAgICAgICAgICBydW46IGFzeW5jIGZ1bmN0aW9uICgpIHsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IGxvYWRORVIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydCh4bWwucXVlcnlTZWxlY3RvcihcIltsZW1tYT0nV2lsbGlhbSBMeW9uIE1hY2tlbnppZSddXCIpLmdldEF0dHJpYnV0ZShcIkFcIikgPT09IGBlaGApO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KHhtbC5xdWVyeVNlbGVjdG9yKFwiW2xlbW1hPSdXaWxsaWFtIEx5b24gTWFja2VuemllJ11cIikuZ2V0QXR0cmlidXRlKFwiQlwiKSA9PT0gYGJlZWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ICAgICAgICBcbiAgICB9XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IHBvc3RKU09OID0gcmVxdWlyZShcIi4uL2ZyYW1lL3Bvc3RKU09OLmpzXCIpO1xuY29uc3QgZ2V0WE1MID0gcmVxdWlyZShcIi4uL2ZyYW1lL2dldFhNTC5qc1wiKTtcbmNvbnN0IGdldEpTT04gPSByZXF1aXJlKFwiLi4vZnJhbWUvZ2V0SlNPTi5qc1wiKTtcblxuLyoqXG4gKiBMb2FkIGFuZCBORVIgdGhlIGdpdmVuIGZpbGUuICBCaW5kIHRvIHRlc3Qgb2JqZWN0IHdoZW4gY2FsbGVkLlxuICogUmV0dXJuIHRoZSB4bWwgZG9jdW1lbnQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNlcnZpY2VBbGwoKSB7XG4gICAgdGhpcy5zb3VyY2UgPSBhd2FpdCBnZXRYTUwoXCJwbGFpbi1saW5rLnhtbFwiKTtcbiAgICBsZXQgY29udGV4dCA9IGF3YWl0IGdldEpTT04oXCJ0ZXN0LmNvbnRleHQuMi5qc29uXCIpO1xuXG4gICAgbGV0IHNldHRpbmdzID0ge1xuICAgICAgICBkb2N1bWVudDogdGhpcy5zb3VyY2UsXG4gICAgICAgIGNvbnRleHQ6IGNvbnRleHRcbiAgICB9O1xuICAgIFxuICAgIHRoaXMucmVzdWx0ID0gYXdhaXQgcG9zdEpTT04oXCJkaWN0LWxpbmtcIiwgSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MpKTtcbiAgICBsZXQgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICAgIHRoaXMueG1sID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyh0aGlzLnJlc3VsdC5kb2N1bWVudCwgXCJ0ZXh0L3htbFwiKTtcbiAgICBcbiAgICByZXR1cm4gdGhpcy54bWw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0geyAgICBcbiAgICBkZXNjcmlwdGlvbjogXCJMaW5rLURpY3Rpb25hcnkgb24gcGxhaW4gZG9jdW1lbnQgd2l0aCBjdXN0b20gY29udGV4dC4gIFVzaW5nICd0ZXN0JyBkaWN0aW9uYXJ5LlwiLFxuICAgIHN1aXRlU2V0dXA6IGFzeW5jIGZ1bmN0aW9uKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3VpdGVTZXR1cFwiKTtcbiAgICAgICAgYXdhaXQgcG9zdEpTT04oXCJzZXR1cC10ZXN0LWFsbFwiLCBudWxsKTtcbiAgICB9LCAgICBcbiAgICB0ZXN0czoge1xuICAgICAgICBub19sZW1tYToge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwid2hlcmUgbm8gbGVtbWEgaXMgcHJvdmlkZWQgbm8gbGlua2luZyB3aWxsIG9jY3VyXCIsXG4gICAgICAgICAgICBydW46IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgeG1sID0gYXdhaXQgc2VydmljZUFsbC5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHhtbC5xdWVyeVNlbGVjdG9yKFwiW2lkPScxJ11cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5hc3NlcnQoY2hpbGQuaGFzQXR0cmlidXRlKFwibGlua1wiKSA9PT0gZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBtaXNtYXRjaGVkX2xlbW1hOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJ3aGVyZSB0aGUgbGVtbWEgZG9lcyBub3QgbWF0Y2gsIG5vIGxpbmtpbmcgd2lsbCBvY2N1clwiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IHNlcnZpY2VBbGwuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB4bWwucXVlcnlTZWxlY3RvcihcIltpZD0nMiddXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KGNoaWxkLmhhc0F0dHJpYnV0ZShcImxpbmtcIikgPT09IGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbGlua19hbHJlYWR5X2V4aXN0c18xOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJ3aGVuIGEgbGluayBhdHRyaWJ1dGUgYWxyZWFkeSBleGlzdHMsIG5vIGxpbmtpbmcgd2lsbCBvY2N1clwiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IHNlcnZpY2VBbGwuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB4bWwucXVlcnlTZWxlY3RvcihcIltpZD0nMyddXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KGNoaWxkLmdldEF0dHJpYnV0ZShcImxpbmtcIikgPT09IFwiaW1hIGxpbmtcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxpbmtfYWxyZWFkeV9leGlzdHNfMjoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwid2hlbiBhIGxpbmsgYXR0cmlidXRlIGFscmVhZHkgZXhpc3RzLCBubyBsaW5raW5nIHdpbGwgb2NjdXIsIGV2ZW4gd2hlbiB0aGUgbGluayB2YWx1ZSBpcyBlbXB0eVwiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IHNlcnZpY2VBbGwuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB4bWwucXVlcnlTZWxlY3RvcihcIltpZD0nNCddXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KGNoaWxkLmdldEF0dHJpYnV0ZShcImxpbmtcIikgPT09IFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB3aWxsX2xpbms6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcImxpbmsgd2hlbiBwcmUtY29uZGl0aW9ucyBhcmUgbWV0XCIsXG4gICAgICAgICAgICBydW46IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgeG1sID0gYXdhaXQgc2VydmljZUFsbC5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IHhtbC5xdWVyeVNlbGVjdG9yKFwiW2lkPSc1J11cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5hc3NlcnQoY2hpbGQuZ2V0QXR0cmlidXRlKFwibGlua1wiKSA9PT0gXCJodHRwOi9Ub3JvbnRvSHlkcm8uY2FcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gICAgICAgICAgIFxuICAgIH1cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBwb3N0SlNPTiA9IHJlcXVpcmUoXCIuLi9mcmFtZS9wb3N0SlNPTi5qc1wiKTtcbmNvbnN0IGdldFhNTCA9IHJlcXVpcmUoXCIuLi9mcmFtZS9nZXRYTUwuanNcIik7XG5jb25zdCBnZXRKU09OID0gcmVxdWlyZShcIi4uL2ZyYW1lL2dldEpTT04uanNcIik7XG5cbi8qKlxuICogTG9hZCBhbmQgTkVSIHRoZSBnaXZlbiBmaWxlLiAgQmluZCB0byB0ZXN0IG9iamVjdCB3aGVuIGNhbGxlZC5cbiAqIFJldHVybiB0aGUgeG1sIGRvY3VtZW50LlxuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkTkVSKCkge1xuICAgIHRoaXMuc291cmNlID0gYXdhaXQgZ2V0WE1MKFwicGxhaW4ueG1sXCIpO1xuXG4gICAgbGV0IHNldHRpbmdzID0ge1xuICAgICAgICBkb2N1bWVudDogdGhpcy5zb3VyY2VcbiAgICB9O1xuXG4gICAgdGhpcy5yZXN1bHQgPSBhd2FpdCBwb3N0SlNPTihcIm5lclwiLCBKU09OLnN0cmluZ2lmeShzZXR0aW5ncykpO1xuICAgIGxldCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XG4gICAgdGhpcy54bWwgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHRoaXMucmVzdWx0LmRvY3VtZW50LCBcInRleHQveG1sXCIpO1xuXG4gICAgcmV0dXJuIHRoaXMueG1sO1xufVxuXG4vKipcbiAqIHB1dCB0aGUge3RydWUsIGZhbHNlfSBpbiB0ZXN0LnN1Y2Nlc3MuXG4gKiBwdXQgdGhlIHJldHVybmVkIHZhbHVlIGluIHRlc3QucmVzdWx0LlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGRlc2NyaXB0aW9uOiBcIk5FUiBzZXJ2aWNlIG9uIHBsYWluIGRvY3VtZW50IHdpdGhvdXQgYSBjb250ZXh0IG9yIGEgc2NoZW1hLlwiLFxuICAgIHRlc3RzOiB7XG4gICAgICAgIGxvYWRfcGxhaW46IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIm1hcmt1cCB0aGUgcGxhaW4gZG9jdW1lbnQgdXNpbmcgbmVyLXNlcnZpY2VcIixcbiAgICAgICAgICAgIHJ1bjogYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc291cmNlID0gYXdhaXQgZ2V0WE1MKFwicGxhaW4ueG1sXCIpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudDogdGhpcy5zb3VyY2VcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bHQgPSBhd2FpdCBwb3N0SlNPTihcIm5lclwiLCBKU09OLnN0cmluZ2lmeShzZXR0aW5ncykpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBub25fYWxwaGFiZXRfY2hhcnM6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIm5lciB3aWxsIGlnbm9yZSBzdHJpbmdzIHdpdGhvdXQgYW55IGFscGhhYmV0IGNoYXJzXCIsXG4gICAgICAgICAgICBydW46IGFzeW5jIGZ1bmN0aW9uICgpIHsgICAgXG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IGxvYWRORVIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudCA9IHhtbC5xdWVyeVNlbGVjdG9yKFwiW2lkPSc0J11cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5hc3NlcnQoZWxlbWVudC5pbm5lckhUTUwgPT09IFwiMTIzMTIzXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBsb2FkX3BsYWluX2RlZmF1bHRfY29udGV4dDoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwicmVzdWx0IHJldHVybnMgYSBjb250ZXh0IHdoZW4gbm9uZSBwcm92aWRlZFwiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3VyY2UgPSBhd2FpdCBnZXRYTUwoXCJwbGFpbi54bWxcIik7XG5cbiAgICAgICAgICAgICAgICBsZXQgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50OiB0aGlzLnNvdXJjZVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdCA9IGF3YWl0IHBvc3RKU09OKFwibmVyXCIsIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hc3NlcnQodGhpcy5yZXN1bHQuY29udGV4dCAhPT0gXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxvYWRfcGxhaW5fcHJvdmlkZWRfY29udGV4dDoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwicmVzdWx0IHJldHVybnMgYSBjb250ZXh0IHdoZW4gcHJvdmlkZWRcIixcbiAgICAgICAgICAgIHJ1bjogYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc291cmNlID0gYXdhaXQgZ2V0WE1MKFwicGxhaW4ueG1sXCIpO1xuICAgICAgICAgICAgICAgIGxldCBjb250ZXh0ID0gYXdhaXQgZ2V0SlNPTihcInRlc3QuY29udGV4dC5qc29uXCIpO1xuXG4gICAgICAgICAgICAgICAgbGV0IHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudDogdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHRcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bHQgPSBhd2FpdCBwb3N0SlNPTihcIm5lclwiLCBKU09OLnN0cmluZ2lmeShzZXR0aW5ncykpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KHRoaXMucmVzdWx0LmNvbnRleHQgIT09IFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBsb2NhdGlvbl90b3JvbnRvOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJ0ZXh0ICdUb3JvbnRvJyB0YWdnZWQgYXMgJ0xPQ0FUSU9OJ1wiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IGxvYWRORVIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudCA9IHhtbC5xdWVyeVNlbGVjdG9yKFwiTE9DQVRJT05cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5hc3NlcnQoZWxlbWVudC50ZXh0Q29udGVudCA9PT0gXCJUb3JvbnRvXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBoYXNfbGVtbWFfYXR0cmlidXRlOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJsZW1tYSBhdHRyaWJ1dGUgaW4gdGhlIGRlZmF1bHQgY29udGV4dCBpcyAnbGVtbWEnXCIsXG4gICAgICAgICAgICBydW46IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgeG1sID0gYXdhaXQgbG9hZE5FUi5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgIGxldCBlbGVtZW50ID0geG1sLnF1ZXJ5U2VsZWN0b3IoXCJMT0NBVElPTlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydChlbGVtZW50Lmhhc0F0dHJpYnV0ZShcImxlbW1hXCIpID09PSB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbm9fbGlua19hdHRyaWJ1dGU6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcInRoZSBsaW5rIGF0dHJpYnV0ZSBpcyBub3QgZmlsbGVkIGluIGJ5IHRoZSAnbmVyJyBzZXJ2aWNlXCIsXG4gICAgICAgICAgICBydW46IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgeG1sID0gYXdhaXQgbG9hZE5FUi5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgIGxldCBlbGVtZW50ID0geG1sLnF1ZXJ5U2VsZWN0b3IoXCJMT0NBVElPTlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydChlbGVtZW50Lmhhc0F0dHJpYnV0ZShcImxpbmtcIikgPT09IGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbGVtbWFfdG9yb250bzoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwibGVtbWEgYXR0cmlidXRlIGJ5IGRlZmF1bHQgdGhlIHNhbWUgYXMgdGhlIHRleHRcIixcbiAgICAgICAgICAgIHJ1bjogYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxldCB4bWwgPSBhd2FpdCBsb2FkTkVSLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSB4bWwucXVlcnlTZWxlY3RvcihcIkxPQ0FUSU9OXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwibGVtbWFcIikgPT09IFwiVG9yb250b1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbm9fZG9jdW1lbnQ6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIm5vdCBoYXZpbmcgYSBkb2N1bWVudCB0aHJvd3MgYW4gZXJyb3IgKHN0YXR1cyA0MDApXCIsXG4gICAgICAgICAgICBydW46IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0ID0gYXdhaXQgcG9zdEpTT04oXCJuZXJcIiwgSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hc3NlcnQoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhjZXB0aW9uID0gZXg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbnVsbF9zZXR0aW5nczoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwibnVsbCBzZXR0aW5ncyB0aHJvd3MgYW5kIGV4Y2VwdGlvbiAoc3RhdHVzIDUwMClcIixcbiAgICAgICAgICAgIHJ1bjogYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0ID0gYXdhaXQgcG9zdEpTT04oXCJuZXJcIiwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4Y2VwdGlvbiA9IGV4O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFzc2VydCh0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVuZGVmX3NldHRpbmdzOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJ1bmRlZmluZWQgc2V0dGluZ3MgdGhyb3dzIGFuZCBleGNlcHRpb24gKHN0YXR1cyA1MDApXCIsXG4gICAgICAgICAgICBydW46IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdCA9IGF3YWl0IHBvc3RKU09OKFwibmVyXCIsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFzc2VydChmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leGNlcHRpb24gPSBleDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hc3NlcnQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBub190YWc6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcInRleHQgYWxyZWFkeSB0YWdnZWQgd2lsbCBub3QgYmUgdGFnZ2VkXCIsXG4gICAgICAgICAgICBydW46IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgeG1sID0gYXdhaXQgbG9hZE5FUi5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXNzZXJ0KHhtbC5xdWVyeVNlbGVjdG9yKFwiW2lkPSdjYW5hZGFfbm9fdGFnJ11cIikuaW5uZXJIVE1MID09PSBcIkNhbmFkYVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZG9fdGFnOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJ0ZXh0IGluc2lkZSBub24tZW50aXR5IHRhZyB3aWxsIGJlIHRhZ2dlZFwiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IGxvYWRORVIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydCh4bWwucXVlcnlTZWxlY3RvcihcIltpZD0nY2FuYWRhX3RhZyddXCIpLmlubmVySFRNTCA9PT0gYDxMT0NBVElPTiBsZW1tYT1cIkNhbmFkYVwiPkNhbmFkYTwvTE9DQVRJT04+YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG5lc3RlZF9ub190YWc6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcInRleHQgbmVzdGVkIGluc2lkZSBhIHRhZ2dlZCBlbGVtZW50IHdpbGwgbm90IGJlIHRhZ2dlZFwiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IGxvYWRORVIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydCh4bWwucXVlcnlTZWxlY3RvcihcIltpZD0nb250YXJpbyddXCIpLmlubmVySFRNTCA9PT0gYDxkaXY+T250YXJpbzwvZGl2PmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0YWdfb3JnYW5pemF0aW9uOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCInVG9yb250byBIeWRybycgdGFnZ2VkIGFzIG9yZ2FuaXphdGlvblwiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IGxvYWRORVIuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydCh4bWwucXVlcnlTZWxlY3RvcihcIltsZW1tYT0nVG9yb250byBIeWRybyddXCIpLnRhZ05hbWUgPT09IGBPUkdBTklaQVRJT05gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdGFnX3BlcnNvbjoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiJ1dpbGxpYW0gTHlvbiBNYWNrZW56aWUnIHRhZ2dlZCBhcyBwZXJzb25cIixcbiAgICAgICAgICAgIHJ1bjogYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxldCB4bWwgPSBhd2FpdCBsb2FkTkVSLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hc3NlcnQoeG1sLnF1ZXJ5U2VsZWN0b3IoXCJbbGVtbWE9J1dpbGxpYW0gTHlvbiBNYWNrZW56aWUnXVwiKS50YWdOYW1lID09PSBgUEVSU09OYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IHBvc3RKU09OID0gcmVxdWlyZShcIi4uL2ZyYW1lL3Bvc3RKU09OLmpzXCIpO1xuY29uc3QgZ2V0WE1MID0gcmVxdWlyZShcIi4uL2ZyYW1lL2dldFhNTC5qc1wiKTtcbmNvbnN0IGdldEpTT04gPSByZXF1aXJlKFwiLi4vZnJhbWUvZ2V0SlNPTi5qc1wiKTtcblxuLyoqXG4gKiBMb2FkIGFuZCBORVIgdGhlIGdpdmVuIGZpbGUuICBCaW5kIHRvIHRlc3Qgb2JqZWN0IHdoZW4gY2FsbGVkLlxuICogUmV0dXJuIHRoZSB4bWwgZG9jdW1lbnQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHByZXF1ZWwoKSB7XG4gICAgdGhpcy5zb3VyY2UgPSBhd2FpdCBnZXRYTUwoXCJmb3Jfc2NoZW1hX3Rlc3QueG1sXCIpO1xuICAgIGxldCBjb250ZXh0ID0gYXdhaXQgZ2V0SlNPTihcInRlc3QuY29udGV4dC4zLmpzb25cIik7XG5cbiAgICBsZXQgc2V0dGluZ3MgPSB7XG4gICAgICAgIGRvY3VtZW50OiB0aGlzLnNvdXJjZSxcbiAgICAgICAgY29udGV4dDogY29udGV4dFxuICAgIH07XG5cbiAgICB0aGlzLnJlc3VsdCA9IGF3YWl0IHBvc3RKU09OKFwibmVyXCIsIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzKSk7XG4gICAgbGV0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcbiAgICB0aGlzLnhtbCA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcodGhpcy5yZXN1bHQuZG9jdW1lbnQsIFwidGV4dC94bWxcIik7XG5cbiAgICByZXR1cm4gdGhpcy54bWw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGRlc2NyaXB0aW9uOiBcIlRlc3QgdGhlIHNjaGVtYSB3aXRoIE5FUiB0YWdnaW5nLlwiLFxuICAgIHRlc3RzOiB7XG4gICAgICAgIGxvYWQ6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcImxvYWQgd2l0aCBzY2hlbWEgZGVjbGFyZWQgYnkgY29udGV4dFwiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3VyY2UgPSBhd2FpdCBnZXRYTUwoXCJmb3Jfc2NoZW1hX3Rlc3QueG1sXCIpO1xuICAgICAgICAgICAgICAgIGxldCBjb250ZXh0ID0gYXdhaXQgZ2V0SlNPTihcInRlc3QuY29udGV4dC4zLmpzb25cIik7XG5cbiAgICAgICAgICAgICAgICBsZXQgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50OiB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdCA9IGF3YWl0IHBvc3RKU09OKFwibmVyXCIsIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHdpbGxfdGFnX3Rvcm9udG86IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcInRhZyBpbiB0aGUgJ2FsbCcgZWxlbWVudFwiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IHByZXF1ZWwuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0geG1sLnF1ZXJ5U2VsZWN0b3IoXCJbaWQ9JzEnXVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydChyZXN1bHQuY2hpbGRFbGVtZW50Q291bnQgPT09IDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB3aWxsX25vdF90YWdfdG9yb250bzoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiZG8gbm90IHRhZyBpbiB0aGUgJ2RpdicgZWxlbWVudFwiLFxuICAgICAgICAgICAgcnVuOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGV0IHhtbCA9IGF3YWl0IHByZXF1ZWwuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0geG1sLnF1ZXJ5U2VsZWN0b3IoXCJbaWQ9JzInXVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydChyZXN1bHQuY2hpbGRFbGVtZW50Q291bnQgPT09IDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ICAgICAgICAgICAgICAgIFxuICAgIH1cbn07Il19
