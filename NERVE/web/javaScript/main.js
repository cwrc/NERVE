/* global FileOperations */

class HostInfo {
    constructor() {
        let prequel = "ws://";
        let host = window.location.host;
        if (host === "beta.cwrc.ca") host = "dh.sharcnet.ca";
        if (window.location.protocol === "https:") prequel = "wss://";
        this.dictionarySocketAddress = `${prequel}${host}/nerve/Dictionary`;
        this.scriberSocketAddress = `${prequel}${host}/nerve/Scriber`;
    }
}

class Main {
    constructor() {
        this.model = null;
        this.controller = null;
        this.view = null;
        this.listener = null;
    }
    async initialize() {
        this.view = new View();
        this.view.setThrobberMessage("Loading...");

        this.model = new Model(this.view);
        window.setupCwrcDialogs();
        window.cwrcSetup();

        this.controller = new Controller(this.view, this.model);
        await this.controller.start();

        this.listener = new Listeners(this.view, this.controller);

        this.view.showThrobber(false);
        $("#container").show();
        this.view.tagnameManager.pollDocument();
    }
}