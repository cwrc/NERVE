let View = require("./mvc/view/view");
let SearchView = require("./mvc/view/SearchView");
let EntityDialogView = require("./mvc/view/EntityDialogView");

let Controller = require("./mvc/controller/controller");
let Listeners = require("./mvc/controller/listeners");
let CWRCDialogController = require("./mvc/controller/CWRCDialogController");

let MessageHandler = require("./mvc/messageHandler");
let CWRCDialogModel = require("./mvc/model/cwrcDialogModel");
let Model = require("./mvc/model/model");
let HostInfo = require("./util/hostinfo");
let ModelListener = require("./mvc/model/modelListeners/modelListener");


let nerve = require("./gen/nerve");
let jjjrmi = require("jjjrmi");


$(window).on('load', async function () {
    console.log("Initializing main");

    jjjrmi.JJJRMISocket.registerPackage(require("./lib/context"));
    jjjrmi.JJJRMISocket.registerPackage(nerve);

    window.main = new Main();
    await main.initialize();

    console.log("... main init complete");
});

class Main {
    constructor() {
        this.model = null;
        this.controller = null;
        this.view = null;
        this.listener = null;
    }
    async initialize() {
        this.model = new Model();
        this.view = new View();
        this.cwrc = new CWRCDialogModel()

        this.model.addListener(this.view);
        this.model.addListener(new MessageHandler($("#userMessage")));
        this.model.addListener(new SearchView());
        this.model.addListener(new EntityDialogView());
        this.model.addListener(this.cwrc);


        let hostInfo = new HostInfo();
        this.scriber = new nerve.Scriber();
        await this.scriber.connect(hostInfo.scriberSocketAddress);
        this.scriber.addListener(this.view);

        this.controller = new Controller(this.model, this.scriber);

        new ModelListener(this.model, this.cwrc);
        new CWRCDialogController(this.cwrc, this.model.getEntityDialog());

        this.model.addListener($.fn.xmlAttr);

        this.view.setThrobberMessage("Loading...");
        this.listeners = new Listeners(this.model, this.view, this.controller);

        await this.model.init();
        this.view.showThrobber(false);
        $("#container").show();
    }
}