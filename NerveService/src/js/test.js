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


