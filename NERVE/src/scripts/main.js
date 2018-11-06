window.$ = require("jquery");
window.jQuery = require("jquery");
window.bootstrap = require("bootstrap");

const Menu = require("@thaerious/menu");
const FileOperations = require("@thaerious/utility").FileOperations;
const AbstractModel = require("@thaerious/nidget").AbstractModel;
const EntityPanel = require("@thaerious/entitypanel").EntityPanelWidget;
const LemmaDialogWidget = require("@thaerious/lemmadialog");
const JJJRMISocket = require("jjjrmi").JJJRMISocket;
const CustomReader = require("./CustomReader");
const OpenAsWidget = require("./OpenAsWidget");
const EntityPanelChangeListener = require("./EntityPanelChangeListener");
const LemmaDialogController = require("./LemmaDialogController");
const EntityPanelLemmaDialogListener = require("./EntityPanelLemmaDialogListener");
const Throbber = require("@thaerious/throbber");

JJJRMISocket.registerPackage(require("nerscriber"));
JJJRMISocket.registerPackage(require("nerveserver"));

JJJRMISocket.flags = {
    SILENT: false, /* do not print exceptions to console */
    CONNECT: false, /* show the subset of ONMESSAGE that deals with the initial connection */
    ONMESSAGE: false, /* describe the action taken when a message is received */
    SENT: true, /* show the send object, versbose shows the json text as well */
    RECEIVED: false, /* show the received server object, verbose shows the json text as well */
    VERBOSE: true, /* print raw text for SENT / RECEIVED */
    ONREGISTER: false /* report classes as they are registered */
};

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
        let dictionary = await this.rootObject.getDictionary();
        this.entityPanel = new EntityPanel("#panelContainer", dictionary);
        await this.entityPanel.load();
        this.entityPanel.addListener(this);
        
        /* Undo listener */
        this.entityPanelChangeListener = new EntityPanelChangeListener(this.entityPanel);
        this.entityPanel.addListener(this.entityPanelChangeListener);
        
        /* Lemma Dialog */
        this.lemmaDialogWidget = new LemmaDialogWidget("#lemmaDialog");
        this.lemmaDialogWidget.addCategory(["PERSON", "LOCATION", "ORGANIZATION", "TITLE"]);        
        this.lemmaDialogController = new LemmaDialogController(this.lemmaDialogWidget);
        this.entityPanel.addListener(this.lemmaDialogController);
        this.addListener(this.lemmaDialogController); /* needed ? */
        
        /* Connect Lemma Dialog and Entity Panel */
        this.entityPanelLemmaDialogListener = new EntityPanelLemmaDialogListener(this.entityPanel, this.lemmaDialogWidget);
        
        /* Throbber & user message handlers */
        this.throbber = new Throbber();
        $("body").append(this.throbber.$);
        let monitor = this.rootObject.getProgressMonitor();
        monitor.addListener(new MonitorListener(this.throbber));
        
        await this.__checkForPreviousDocument();
    }
    
    async __checkForPreviousDocument(){
        let prevDoc = this.entityPanelChangeListener.reload();
        if (prevDoc === null) return;
        
        let context = JSON.parse(localStorage.contextText);
        await this.entityPanel.setDocument(prevDoc, localStorage.filename, localStorage.schemaText);            
        let style = context.style;        
        this.entityPanel.setStyle(style);  
        
        $("#documentTitle").text(localStorage.filename);
        this.menu.getMenuItem("File", "Close").disabled(false);
        this.menu.getMenuItem("File", "Save").disabled(false);        
    }

    async onMenuXMLMode(){
        this.entityPanel.setAttribute("data-mode", "tag");
    }
    
    async onMenuEntityMode(){
        this.entityPanel.setAttribute("data-mode", "entity");
    }

    async onMenuSave(){
        let document = this.entityPanel.getDocument();
        let decoded = await this.scriber.decode(document);
        FileOperations.saveToFile(decoded, localStorage.filename);
    }

    async onMenuClose(){
        this.entityPanel.unsetDocument();
        this.menu.getMenuItem("File", "Close").disabled(true);
        this.menu.getMenuItem("File", "Save").disabled(true);         
    }

    async onMenuUndo(){
        this.entityPanelChangeListener.revert();
    }

    async onMenuRedo(){
        this.entityPanelChangeListener.advance();
    }

    async onMenuOpen() {
        let openAsOptions = this.openAsWidget.getOptions();
        this.__menuOpen(openAsOptions);
    }

    async onMenuOpenAs() {
        let openAsOptions = await this.openAsWidget.show();
        if (!openAsOptions.accept) return;
        this.__menuOpen(openAsOptions);
    }
    
    async __menuOpen(openAsOptions){
        let fileObject = await this.customReader.show();
        let encodedResponse = await this.__loadFile(fileObject.contents, openAsOptions);
        let encodedText = encodedResponse.text;
        let context = JSON.parse(encodedResponse.context);
        let schemaName = context.schemaName;
        let schemaText = await FileOperations.getURL(`assets/entitypanel/schemas/${schemaName}`);    
        
        await this.entityPanel.setDocument(encodedText, fileObject.filename, schemaText);   
        localStorage.schemaText = schemaText;
        localStorage.contextText = encodedResponse.context;
        localStorage.filename = fileObject.filename;
        
        $("#documentTitle").text(fileObject.filename);
        let style = context.style;        
        this.entityPanel.setStyle(style);
        
        this.menu.getMenuItem("File", "Close").disabled(false);
        this.menu.getMenuItem("File", "Save").disabled(false);
    }
    
    async __loadFile(text, openAsOptions){
        let encoded = null;

        if (openAsOptions.ner && openAsOptions.dict) encoded = await this.scriber.encode(text);
        else if (openAsOptions.ner) encoded = await this.scriber.tag(text);
        else if (openAsOptions.dict) encoded = await this.scriber.link(text);
        else encoded = await this.scriber.edit(text);

        return encoded;
    }
    onMenuRemoveTag(taggedEntityCollection = null) {
        if (taggedEntityCollection === null){
            taggedEntityCollection = this.entityPanel.selectedEntities.clone();
        }
        
        if (taggedEntityCollection.isEmpty()) return 0;

        let taggedEntityArray = [];
        let textNodeArray = [];
        
        for (let taggedEntityWidget of taggedEntityCollection) {
            taggedEntityArray.push(taggedEntityWidget);
            let text = taggedEntityWidget.untag();
            textNodeArray.push(text);
        }
        this.entityPanel.selectedEntities.clear();
        this.entityPanel.notifyListeners("notifyUntaggedEntities", taggedEntityArray, textNodeArray);
    }
    
    async onMenuMergeEntities() {
        let taggedEntity = await this.entityPanel.mergeEntities(this.entityPanel.collection);
        this.entityPanel.selectedEntities.set(taggedEntity);
        this.entityPanel.notifyListeners("notifyNewTaggedEntities", [taggedEntity]);
    }

    async onMenuTag(tagname = "PERSON") {
        let taggedEntity = await this.entityPanel.tagSelection(window.getSelection());
        taggedEntity.tag(tagname, true);
        this.entityPanel.notifyListeners("notifyNewTaggedEntities", [taggedEntity]);
    }       
    
    async onMenuClearSelection() {
        this.entityPanel.emptyCollection();
    }    
}

class MonitorListener{
    constructor(throbber){
        this.throbber = throbber;
    }
    
    serverStart(message){
        this.throbber.setMessage(message);
        this.throbber.show();
    }
    
    serverUpdateMessage(message){
        this.throbber.setMessage(message);
    }
    
    serverUpdateProgress(percent){
        this.throbber.setPercent(percent);
    }
    
    serverEnd(){
        this.throbber.hide();
    }
}