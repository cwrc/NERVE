window.jQuery = require("jquery");
window.$ = jQuery;

require("./util/customQuery");
require("../styles/main.css");

const View = require("./mvc/view/View");
const EntityDialog = require("./mvc/EntityDialog");
const EnityPanelWidget = require("./mvc/EnityPanelWidget");
const Menu = require("./mvc/menu/Menu");
const MessageHandler = require("./mvc/messageHandler");
const CWRCDialogModel = require("./mvc/CWRCDialogModel");
const Model = require("./mvc/model/Model");
const HostInfo = require("./util/hostinfo");
const TaggedEntityWidget = require("./mvc/TaggedEntityWidget");
const nerve = require("nerve");
const AbstractModel = require("Nidget/src/AbstractModel");
const CustomQuery = require("./util/CustomQuery");
const UndoHandler = require("./mvc/UndoHandler");

const LemmmaDialog = require("LemmaDialog");

window.jjjrmi = require("jjjrmi");

$(window).on('load', async function () {
    console.log("Initializing main");

//    jjjrmi.JJJRMISocket.flags.CONNECT = true;
//    jjjrmi.JJJRMISocket.flags.RECEIVED = true;
//    jjjrmi.JJJRMISocket.flags.SENT = true;

    jjjrmi.JJJRMISocket.registerPackage(require("nerscriber"));
    jjjrmi.JJJRMISocket.registerPackage(require("jjjsql"));
    jjjrmi.JJJRMISocket.registerPackage(nerve);

    window.main = new Main();
    await main.initialize();

    console.log("... main init complete");
});

class Main extends AbstractModel {
    constructor() {
        super();
        this.model = null;
        this.view = null;
    }
    async initialize() {       
        /* --- USER INTERACTION & DOCUMENT MODEL --- */
        this.model = new Model();
        this.view = new View();        
        this.cwrc = new CWRCDialogModel();        
        this.undo = new UndoHandler();
        
        this.view.setThrobberMessage("Loading...");
        this.view.showThrobber(true, 1.0);
        
        this.model.addListener(this.view);
        this.model.addListener(new MessageHandler($("#userMessage")));
        this.model.addListener(this.cwrc);
        this.model.addListener(CustomQuery.instance);
                
        
        /* --- LEMMA DIALOG (LHS) --- */
        this.lemmaDialog = new LemmmaDialog("#lemmaDialog");

        /* --- ENTITY PANEL (middle) --- */
        this.entityPanelWidget = new EnityPanelWidget();

        /* --- ENTITY DIALOG (RHS) --- */
//        this.entityDialog = new EntityDialog();        

        /* --- MENU (top) --- */
        this.menu = new Menu();
        
        /* SETUP ALL CROSS LISTENERS (order may matter) */
        /* undo saves state and has to be the last listener */
        this.model.addListener(this.lemmaDialog);        
        this.model.addListener(this.entityPanelWidget);
//        this.model.addListener(this.entityDialog);
        this.model.addListener(TaggedEntityWidget.contextMenu);
        this.model.addListener(TaggedEntityWidget.delegate);
                
        this.entityPanelWidget.addListener(this.lemmaDialog);
        this.entityPanelWidget.addListener(this.model);
        this.entityPanelWidget.addListener(this.undo);
        
        this.lemmaDialog.addListener(this.entityPanelWidget);    
        
//        this.entityDialog.addListener(this.lemmaDialog);
//        this.entityDialog.addListener(this.entityPanelWidget);        
//        this.entityDialog.addListener(this.cwrc);
//        this.entityDialog.addListener(this.model);
//        
//        this.entityPanelWidget.addListener(this.entityDialog);

        this.cwrc.addListener(this.entityPanelWidget);
//        this.cwrc.addListener(this.entityDialog);        

        this.menu.addListener(this.view);        
        this.menu.addListener(this.entityPanelWidget);
        this.menu.addListener(this.model);
//        this.menu.addListener(this.entityDialog);
        this.menu.addListener(this.undo);
                
        TaggedEntityWidget.delegate.addListener(TaggedEntityWidget.contextMenu);
        TaggedEntityWidget.delegate.addListener(this.entityPanelWidget);
//TaggedEntityWidget.delegate.addListener(this.lemmaDialogWidget);
        TaggedEntityWidget.delegate.addListener(this.model);
        TaggedEntityWidget.delegate.addListener(this.undo);
        
        this.undo.addListener(this.model);
//this.undo.addListener(this.lemmaDialogWidget);
        this.undo.addListener(this.entityPanelWidget);
        
        /* --- CONNECT SOCKET AND EXTRANEOUS SETUP --- */
        this.rootSocket = new jjjrmi.JJJRMISocket("NerveSocket");   
        this.rootObject = await this.rootSocket.connect();
        this.scriber = this.rootObject.scriber;
        this.model.setScriber(this.scriber);

        this.rootObject.getProgressMonitor().addListener(this.view);

        /* model.init has to be kept near the end as it triggers a notifyContextChange event */
        await this.entityPanelWidget.init(this.rootObject.dictionary);
        await this.model.init(this.rootObject.dictionary);        
        
        this.view.showThrobber(false);
        
        TaggedEntityWidget.contextMenu.setDictionary(this.rootObject.dictionary);     
        
        this.entityPanelWidget.addListener(TaggedEntityWidget.contextMenu);
        this.addListener(TaggedEntityWidget.contextMenu);
//        this.addListener(this.entityDialog);
        
        this.notifyListeners("notifyReady");
    }
}