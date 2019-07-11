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
        
        let viewspan = document.createElement("span");            
        viewspan.textContent = "[view]";
        div.append(viewspan);
        viewspan.setAttribute("class", "view");
        viewspan.onclick = ()=>this.view(test);
        
        return div;        
    }

    notifyChild(childMain){
        childMain.document("x");
    }

    view(test){          
        if (test.result){
            let win = window.open("index.html");
            win.addEventListener("mainready", (event)=>{
                event.detail.document(test.result.document);
            });
            win.focus();
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
        console.log("runSuite");
        for (let testname in suite.tests) {
            let test = suite.tests[testname];
            test.reportElement.setAttribute("success", `running`);
            test.success = true;
            
            test.assertations = 0;
            test.assert = assert.bind(test);
            
            try {
                await test.run();                
                test.reportElement.setAttribute("success", `${test.success}`);
            } catch (ex) {
                test.success = "exception";
                test.exception = ex;
                test.reportElement.setAttribute("success", `exception`);
                console.warn(ex);
            }            
            
            test.reportElement.setAttribute("asserts", `${test.assertations}`);
        }
        return suite;
    }
}

module.exports = TestMain;


