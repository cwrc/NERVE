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
const EntityPanelListener = require("./EntityPanelListener");
const EditEntityWidget = require("./EditEntityWidget");
const EntityPanelChangeListener = require("./EntityPanelChangeListener");

JJJRMISocket.registerPackage(require("nerscriber"));
JJJRMISocket.registerPackage(require("nerveserver"));

//JJJRMISocket.flags.CONNECT = true;
//JJJRMISocket.flags.RECEIVED = true;
//JJJRMISocket.flags.SENT = true;
//JJJRMISocket.flags.VERBOSE = true;
//JJJRMISocket.flags.ONMESSAGE = true;

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
        this.entityPanel = new EntityPanel("#panelContainer", this);
        this.entityPanel.setDictionary(await this.rootObject.getDictionary());
        this.entityPanelListener = new EntityPanelListener(this, this.entityPanel);
        this.addListener(this.entityPanelListener);
        
        /* Undo listener */
        this.entityPanelChangeListener = new EntityPanelChangeListener(this.entityPanel);
        this.addListener(this.entityPanelChangeListener);
        
        /* Entity edit widget */
        this.editEntityWidget = new EditEntityWidget();
        await this.editEntityWidget.load();
        
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
    
    async notifyEditEntities(taggedEntities){
        let editEntityResult = await this.editEntityWidget.show(taggedEntities);
        console.log(editEntityResult);
        
        if (editEntityResult.accept){
            for (let taggedEntity of taggedEntities){
                if (editEntityResult.text !== null) taggedEntity.text(editEntityResult.text, true);
                if (editEntityResult.lemma !== null) taggedEntity.lemma(editEntityResult.lemma, true);
                if (editEntityResult.link !== null) taggedEntity.link(editEntityResult.link, true);
                if (editEntityResult.tag !== null) taggedEntity.tag(editEntityResult.tag, true);
            }
        }
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
}