/* global FileOperations */

$(window).on('load', async function () {
    window.main = new Main();
    await main.initialize();
});

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

        window.entityPanel = new EntityPanelWidget($("#futurePanel"));
    }
    async initialize() {

        this.model = new Model();
        this.view = new View();

        this.model.addListener(this.view);
        this.model.addListener(new UserMessageHandler($("#userMessage")));

        let hostInfo = new HostInfo();
        this.scriber = new Scriber();
        await this.scriber.connect(hostInfo.scriberSocketAddress);
        this.scriber.addListener(this.view);

        this.controller = new Controller(this.model, this.scriber);

        this.model.addListener(new SearchView());
        this.model.addListener(new EntityDialogView());

        this.model.addListener($.fn.xmlAttr);

        this.view.setThrobberMessage("Loading...");
        await this.model.init();

        this.listeners = new Listeners(this.model, this.view, this.controller);
        this.view.showThrobber(false);
        $("#container").show();
    }
}