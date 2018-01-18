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
        this.view = new View(this.model);

        this.scriber = new Scriber();
        this.scriber.setView(this.view);

        this.controller = new Controller(this.model, this.view, this.scriber);

        let entityDialogView = new EntityDialogView()
        this.controller.addListener(entityDialogView);
        this.model.addListener(entityDialogView);

        this.view.setThrobberMessage("Loading...");

        this.model.addListener($.fn.xmlAttr);

        await this.controller.init();
        await this.model.init();

        this.listener = new Listeners(this.view, this.controller);

        this.view.showThrobber(false);
        $("#container").show();
    }
}