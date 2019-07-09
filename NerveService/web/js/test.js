(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TestMain = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Request a local xml document using post with json input.
 * @param {type} url
 * @param {type} json
 * @returns {Promise}
 */

const rootPath = "assets/test-documents/";

"use strict";
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
},{}],2:[function(require,module,exports){
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
                    reject(JSON.parse(xhttp.responseText));
                }
            }
        };

        xhttp.open("POST", url, true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");        
        xhttp.send(json);
    };

    return new Promise(callback);
};
},{}],3:[function(require,module,exports){
const postJSON = require("./frame/postJSON");

class TestMain {

    constructor() {
    }

    async start() {

    }

    /**
     * Return a list of all coverage directories.
     * @return {undefined}
     */
    listCoverage() {
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
        let suite = await this.runSuite(require("./tests/test-plain.js"));
        console.log(suite);
        this.showResults("#results", suite);
        window.suite = suite;
    }

    showResults(selector, suite) {
        let target = document.querySelector(selector);

        for (let testname in suite) {
            let test = suite[testname];
            let div = this.formatResult(test);
            target.append(div);
        }
    }

    formatResult(test) {
        let div = document.createElement("div");
        div.textContent = test.description + " - ";
        div.setAttribute("success", `${test.success}`);
        
        let viewspan = document.createElement("span");            
        viewspan.textContent = "[view]";
        div.append(viewspan);
        viewspan.setAttribute("class", "view");
        viewspan.onclick = ()=>this.view(test);
        
        return div;
    }

    view(test){                
        if (test.result){
            let win = window.open("index.html");
            window.thatwin = win;            
            win.focus();
            win.main.document("X");
        }
        else if (test.exception){
            let win = window.open("text/plain", "replace");
            let target = test.exception;
            let text = JSON.stringify(target, null, 4);
            win.document.write(`<pre>${text}</pre>`);
            win.focus();
        }
    }

    async runSuite(suite) {
        for (let test in suite) {
            try {
                await suite[test].run();
            } catch (ex) {
                suite[test].success = "exception";
            }
        }
        return suite;
    }
}

module.exports = TestMain;



},{"./frame/postJSON":2,"./tests/test-plain.js":4}],4:[function(require,module,exports){
const postJSON = require("../frame/postJSON.js");
const getXML = require("../frame/getXML.js");

function packResult(src, res, result){
    return {
        sourceDocument : src,
        resultDocument : res,
        testResult : result
    };
}

module.exports = {
    
    load_plain : {
        description : "markup the plain document using ner-service",
        run : async function(){
            this.source = await getXML("plain.xml");
            
            let settings = {
                document: this.source
            };
            
            this.result = await postJSON("ner", JSON.stringify(settings));  
            this.success = true;
        }
    },
    no_document : {
        description : "not having a document throws an error (status 400)",
        run : async function(){
            let settings = {
            };
            
            try{
                this.result = await postJSON("ner", JSON.stringify(settings));
                this.success = false;
            } catch(ex){
                this.exception = ex;
                this.success = true;
            }            
        }
    },
    null_settings : {
        description : "null settings throws and exception (status 500)",
        run : async function(){            
            try{
                this.result = await postJSON("ner", null);
                this.success = false;
            } catch(ex){
                this.exception = ex;
                this.success = true;
            }            
        }
    },
    undef_settings : {
        description : "undefined settings throws and exception (status 500)",
        run : async function(){            
            try{
                this.result = await postJSON("ner", null);
                this.success = false;
            } catch(ex){
                this.exception = ex;
                this.success = true;
            }            
        }
    }       
    
};


},{"../frame/getXML.js":1,"../frame/postJSON.js":2}]},{},[3])(3)
});
