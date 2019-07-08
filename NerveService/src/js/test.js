const postJSON = require("./postJSON");

class TestMain{
    
    constructor(){
    }
    
    async start(){
        
    }
    
    /**
     * Return a list of all coverage directories.
     * @return {undefined}
     */
    listCoverage(){
    }
    
    async genCoverage(){
        await postJSON(`/NerveService/JACOCODataServlet`, `{action:\"exec\"})`);
        await postJSON(`/NerveService/JACOCODataServlet`, `{action:\"report\"})`);
    }
    
    viewCoverage(){
        let win = window.open("/NerveService/coverage/", "_blank");
        win.focus();
    }
    
}

module.exports = TestMain;


