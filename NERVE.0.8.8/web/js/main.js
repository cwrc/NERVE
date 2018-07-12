const View = require("./mvc/view/View");
const EntityDialog = require("./mvc/EntityDialog");
const EnityPanelWidget = require("./mvc/EnityPanelWidget");
const Menu = require("./mvc/menu/Menu");

const DragDropHandler = require("./mvc/model/DragDropHandler");
const MessageHandler = require("./mvc/messageHandler");
const CWRCDialogModel = require("./mvc/CWRCDialogModel");
const Model = require("./mvc/model/Model");
const HostInfo = require("./util/hostinfo");

const TaggedEntityWidget = require("./mvc/model/TaggedEntityWidget");

const lemmaDialog = require("./mvc/lemmaDialog");
const nerve = require("./gen/nerve");
const AbstractModel = require("./mvc/model/AbstractModel");

window.jjjrmi = require("jjjrmi");

$(window).on('load', async function () {
    console.log("Initializing main");

    jjjrmi.JJJRMISocket.flags.CONNECT = true;
    jjjrmi.JJJRMISocket.flags.RECEIVED = true;
    jjjrmi.JJJRMISocket.flags.SENT = true;

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
        this.dragDropHandler = new DragDropHandler();
        
        /* --- USER INTERACTION & DOCUMENT MODEL --- */
        this.model = new Model(this.dragDropHandler);
        this.view = new View();
        this.cwrc = new CWRCDialogModel();        
        this.view.setThrobberMessage("Loading...");
        this.view.showThrobber(true, 1.0);
        
        this.model.addListener(this.view);
        this.model.addListener(new MessageHandler($("#userMessage")));
        this.model.addListener(this.cwrc);
        this.model.addListener($.fn.xmlAttr);
        
        /* --- LEMMA DIALOG (LHS) --- */
        this.lemmaDialogModel = new lemmaDialog.LemmaDialogModel(this.dragDropHandler);
        this.lemmaDialogController = new lemmaDialog.LemmaDialogController(this.lemmaDialogModel);
        this.lemmaDialogView = new lemmaDialog.LemmaDialogView();
        this.lemmaDialogModel.addListener(this.lemmaDialogView);

        /* --- ENTITY PANEL (middle) --- */
        this.entityPanelWidget = new EnityPanelWidget();

        /* --- ENTITY DIALOG (RHS) --- */
        this.entityDialog = new EntityDialog();        

        /* --- MENU (top) --- */
        this.menu = new Menu();
        
        /* SETUP ALL CROSS LISTENERS (order may matter) */
        this.model.addListener(this.lemmaDialogView);        
        this.model.addListener(this.entityPanelWidget);
        this.model.addListener(this.entityDialog);
        this.model.addListener(this.lemmaDialogController); 
        
        this.entityPanelWidget.addListener(this.model);
        this.lemmaDialogModel.addListener(this.entityPanelWidget);    
        
        this.entityDialog.addListener(this.lemmaDialogController);
        this.entityDialog.addListener(this.entityPanelWidget);
        this.entityDialog.addListener(this.model);
        this.entityDialog.addListener(this.cwrc);
        
        this.entityPanelWidget.addListener(this.entityDialog);

        this.cwrc.addListener(this.entityPanelWidget);
        this.cwrc.addListener(this.entityDialog);        

        this.menu.addListener(this.view);
        this.menu.addListener(this.model);
        this.menu.addListener(this.entityPanelWidget);            
        
        /* --- CONNECT SOCKET AND EXTRANEOUS SETUP --- */
//        let hostInfo = new HostInfo();
        this.rootSocket = new jjjrmi.JJJRMISocket("NerveSocket");   
        this.rootObject = await this.rootSocket.connect();
//        this.rootObject = await this.rootSocket.connect(hostInfo.rootSocketAddress);
        this.scriber = this.rootObject.scriber;
        this.model.setScriber(this.scriber);

        this.rootObject.getProgressMonitor().addListener(this.view);

        await this.model.init(this.rootObject.dictionary);
        this.view.showThrobber(false);
        
        TaggedEntityWidget.contextMenu.setDictionary(this.rootObject.dictionary);     
        
        this.entityPanelWidget.addListener(TaggedEntityWidget.contextMenu);
        this.addListener(TaggedEntityWidget.contextMenu);
        this.addListener(this.entityDialog);
        
        this.notifyListeners("notifyReady");
    }
}