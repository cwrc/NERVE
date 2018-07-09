const View = require("./mvc/view/View");
const SearchView = require("./mvc/view/SearchView");
const EntityDialog = require("./mvc/EntityDialog");
const EnityPanelWidget = require("./mvc/EnityPanelWidget");
const CWRCDialogController = require("./mvc/controller/CWRCDialogController");
const Menu = require("./mvc/menu/Menu");

const DragDropHandler = require("./mvc/model/DragDropHandler");
const MessageHandler = require("./mvc/messageHandler");
const CWRCDialogModel = require("./mvc/model/cwrcDialogModel");
const Model = require("./mvc/model/Model");
const HostInfo = require("./util/hostinfo");
const ModelListener = require("./mvc/model/modelListeners/modelListener");

const TaggedEntityContextMenu = require("./mvc/model/TaggedEntityWidget").ContextMenu;

const lemmaDialog = require("./mvc/lemmaDialog");
const nerve = require("./gen/nerve");
const AbstractModel = require("./mvc/model/AbstractModel");

window.jjjrmi = require("jjjrmi");

$(window).on('load', async function () {
    console.log("Initializing main");

//    jjjrmi.JJJRMISocket.flags.ONREGISTER = true;
//    jjjrmi.JJJRMISocket.flags.RECEIVED = true;
//    jjjrmi.JJJRMISocket.flags.SENT = true;
//    jjjrmi.JJJRMISocket.flags.VERBOSE = true;
//    console.log(jjjrmi.JJJRMISocket.flags);

    jjjrmi.JJJRMISocket.registerPackage(require("nerscriber"));
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
        this.model.addListener(new SearchView());        
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
        this.entityPanelWidget.addListener(this.entityDialog);
                
        /* --- CONNECT SOCKET AND EXTRANEOUS SETUP --- */
        let hostInfo = new HostInfo();
        this.rootSocket = new jjjrmi.JJJRMISocket();        
        this.rootObject = await this.rootSocket.connect(hostInfo.rootSocketAddress);
        this.scriber = this.rootObject.scriber;
        this.model.setScriber(this.scriber);

        /* --- MENU --- */
        this.menu = new Menu();
        this.menu.addListener(this.view);
        this.menu.addListener(this.model);
        this.menu.addListener(this.entityPanelWidget);

        this.rootObject.getProgressMonitor().addListener(this.view);

        new ModelListener(this.model, this.cwrc);
        new CWRCDialogController(this.cwrc, this.entityDialog);

        await this.model.init(this.rootObject.dictionary);
        this.view.showThrobber(false);
        
        this.addListener(TaggedEntityContextMenu);
        this.addListener(this.entityDialog);
        this.notifyListeners("notifyReady");
    }
}