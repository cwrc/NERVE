/* global Utility */

class Tests {
    constructor() {
        Utility.enforceTypes(arguments);
        this.name = "";
    }

    /**
     * @param {type} this An object that methods to test.
     * @returns {undefined}
     */
    run() {
        console.clear();

        this._arrayTestNames = [];
        this._objectTestResults = {};
        this._nextTestIndex = 0;

        this.populateTests();

        this.oldTrace = Utility.globalTraceLevel;
        Utility.globalTraceLevel = -1;
        console.log(" - Running Tests");
        console.log("------------------------------------------");
        this.runNextTest();
    }

    populateTests() {
        console.log(" - Populating Tests");
        let prototype = Object.getPrototypeOf(this);
        var methods = Object.getOwnPropertyNames(prototype);
        for (let method of methods) {
            if (method.startsWith("testonly")){
                this._arrayTestNames = [];
                this._arrayTestNames.push(method);
                return;
            }
            if (method.startsWith("test")) {
                this._arrayTestNames.push(method);
            }
        }
    }

    report() {
        let sum = 0;

        console.log("------------------------------------------");

        for (let test of this._arrayTestNames) {
            console.log(this.name + "." + test + " : " + this._objectTestResults[test]);
            if (this._objectTestResults[test] === true)
                sum++;
        }

        console.log("------------------------------------------");
        console.log((this._nextTestIndex) + " tests run, " + sum + " tests passed");
        console.log("------------------------------------------");

        for (let test of this._arrayTestNames) {
            if (this._objectTestResults[test] instanceof Error) {
                console.log("Error for test '" + this.name + "." + test + "'");
                console.log(e.stack);
                console.log("------------------------------------------");
            }
        }

        console.log("");
    }

    runNextTest() {
        if (this._nextTestIndex < this._arrayTestNames.length) {
            let fname = this._arrayTestNames[this._nextTestIndex];
            console.log("running test : " + this.name + "." + fname);
            this.currentTest = fname;
            this._nextTestIndex += 1;
            try {
                this._objectTestResults[fname] = false;
                this[fname](fname);
            } catch (e) {
                if (e instanceof Error) window.e = e;
                this._objectTestResults[fname] = e;
                this.runNextTest();
            }
        } else {
            this.report();
            Utility.globalTraceLevel = this.oldTrace;
        }
    }

    passTest() {
        this._objectTestResults[this.currentTest] = true;
        this.runNextTest();
    }

    failTest() {
        this._objectTestResults[this.currentTest] = false;
        this.runNextTest();
    }

    assertExists(value) {
        if (typeof value === "undefined") {
            throw "assert exist failed, undefined";
        } else if (value === null){
            throw "assert exist failed, null";
        }
    }

    assertTrue(value) {
        if (value === false) {
            throw "assert true failed";
        }
    }

    assertFalse(value) {
        if (value === true) {
            throw "assert false failed";
        }
    }

    assertEquals(found, expected) {
        if (found !== expected) {
            throw "assert equals failed, found '" + found + "' expected '" + expected + "'";
        }
    }
}

/* --------------- Below here be fake documents --------------- */
var processedDocument = '<nervepxml nervep="xml">\
<nervephead nervep="head">\
HEADER\
A short blurb about Toronto and London Ontario.\
</nervephead>\
\
<nervepbody nervep="body">\
BODY\
<tagged class="notSelected"><entity id="NV18301" nerveaid="ID">Toronto Ontario Canada</entity><tagName>LOC</tagName><lemma>Toronto Ontario Canada</lemma></tagged> is east of <tagged class="notSelected"><entity id="NV41248" nerveaid="ID">London Ontario</entity><tagName>LOC</tagName><lemma>London Ontario</lemma></tagged>.\
It is otherwise known as Ol\'Smokey.  But in short just <tagged class="notSelected"><entity id="NV78466" nerveaid="ID">Toronto</entity><tagName>LOC</tagName><lemma>Toronto</lemma></tagged>.\
\
This is a sentence with <tagged class="notSelected"><entity id="NV15598" nerveaid="ID">Toronto</entity><tagName>LOC</tagName><lemma>Toronto</lemma></tagged> in the middle.\
\
<tagged class="notSelected"><entity id="NV13557" nerveaid="ID">Naheed Nenshi</entity><tagName>PER</tagName><lemma>Naheed Nenshi</lemma></tagged> is the mayor of <tagged class="notSelected"><entity id="NV45554" nerveaid="ID">Calgary</entity><tagName>LOC</tagName><lemma>Calgary</lemma></tagged>.\
<tagged class="notSelected"><entity id="NV70411" nerveaid="ID">John Tory</entity><tagName>PER</tagName><lemma>John Tory</lemma></tagged> is the mayor of <tagged class="notSelected"><entity id="NV46347" nerveaid="ID">Toronto</entity><tagName>LOC</tagName><lemma>Toronto</lemma></tagged>.\
\
</nervepbody>\
\
<nerveptail nervep="tail">\
TAIL\
There is nothing here about Toronto or London.\
</nerveptail>\
\
</nervepxml>';