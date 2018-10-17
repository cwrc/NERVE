window.$ = require("jquery");
window.jquery = require("jquery");
window.bootstrap = require("bootstrap");

const Menu = require("Menu");
const FileOperations = require("utility").FileOperations;
const AbstractModel = require("nidget").AbstractModel;
const EntityPanel = require("EntityPanel");
const JJJRMISocket = require("jjjrmi").JJJRMISocket;
const CustomReader = require("./CustomReader");
const OpenAsWidget = require("./OpenAsWidget");

JJJRMISocket.registerPackage(require("nerscriber"));
JJJRMISocket.registerPackage(require("nerveserver"));

$(window).on('load', async function () {
    window.main = new Main();
    await main.load();
});

class Main extends AbstractModel {
    constructor() {
        super();
        this.addListener(this);
    }

    async load() {
        /* Connect to socket */
        this.rootSocket = new JJJRMISocket("NerveSocket");
        this.rootObject = await this.rootSocket.connect("ws://localhost:8080/NERVESERVER/NerveSocket");
        this.scriber = this.rootObject.getScriber();

        /* Setup file open dialogs */
        this.customReader = new CustomReader("#fileOpenDialog");
        this.openAsWidget = new OpenAsWidget();
        await this.openAsWidget.load();

        /* Menu setup */
        this.menu = new Menu(this);
        this.menu.$.appendTo("#menuBar");
        let menuJSON = await FileOperations.getURL("assets/menu.json");
        this.menu.loadJSON(JSON.parse(menuJSON));

        /* EntityPanel setup */
        this.entityPanel = new EntityPanel("#panelContainer");
        this.entityPanel.setDictionary(await this.rootObject.getDictionary());
    }

    async onMenuOpen() {
        let text = await this.customReader.show();
        let openAsOptions = this.openAsWidget.getOptions();
        await this.loadFile(text, openAsOptions);
    }

    async onMenuOpenAs() {
        let openAsOptions = await this.openAsWidget.show();
        if (!openAsOptions.accept) return;
        let text = await this.customReader.show();
        await this.loadFile(text, openAsOptions);
    }
    
    async loadFile(text, openAsOptions){
        let encoded = null;
        
        if (openAsOptions.ner && openAsOptions.dict) encoded = this.scriber.encode(text);
        else if (openAsOptions.ner) encoded = this.scriber.tag(text);
        else if (openAsOptions.dict) encoded = this.scriber.link(text);
        else encoded = this.scriber.edit(text);
        
        return encoded;
    }
}