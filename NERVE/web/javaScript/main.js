/* global FileOperations */

class HostInfo {
    constructor() {
        let prequel = "ws://";
        let host = window.location.host;
        if (host === "beta.cwrc.ca") host = "dh.sharcnet.ca";
        if (window.location.protocol === "https:") prequel = "wss://";
        this.dictionarySocketAddress = `${prequel}${window.location.host}/nerve/Dictionary`;
        this.translateSocketAddress = `${prequel}${window.location.host}/nerve/Translate`;
    }
}

class Main {
    constructor() {
        this.storage = new Storage();
        this.context = new Context();

        this.model = null;
        this.controller = null;
        this.view = null;
        this.listener = null;

        JJJ.devmode = true;
    }
    async initialize(clientIP) {
        this.view = new View(clientIP, this.context);
        this.view.setThrobberMessage("Loading...");

        this.model = new Model(this.view, this.storage, this.context);
        this.model.setVariable("host", location.host);

        this.controller = await new Controller(this.view, this.model, this.context, this.storage).start();

        this.listener = new Listeners(this.view, this.controller);
        $.fn.xmlAttr.defaults.context = this.context;

        this.model.loadStoredDoc();

        this.view.showThrobber(false);
        $("#container").show();
        this.view.tagnameManager.pollDocument();
    }
}