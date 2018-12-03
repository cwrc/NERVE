window.$ = require("jquery");
window.jquery = require("jquery");
window.bootstrap = require("bootstrap");

const EntityPanel = require("./entitypanel/EntityPanelWidget");
const MessageWidget = require("./entitypanel/MessageWidget");
const FileOperations = require("@thaerious/utility").FileOperations;
const JJJRMISocket = require("jjjrmi").JJJRMISocket;

//JJJRMISocket.flags.ONREGISTER = true;
//JJJRMISocket.flags.CONNECT = true;
//JJJRMISocket.flags.RECEIVED = true;
//JJJRMISocket.flags.SENT = true;

JJJRMISocket.registerPackage(require("nerscriber"));
JJJRMISocket.registerPackage(require("nerveserver"));

let scriberSocket = new JJJRMISocket();

let contexts = {
    orlando : {
        organization : "ORGNAME",
        location : "PLACE",
        person : "NAME",
        title : "TITLE"
    },
    cwrc : {
        organization : "ORGNAME",
        location : "PLACE",
        person : "NAME",
        title : "TITLE"
    },
    tei : {
        organization : "orgName",
        location : "placeName",
        person : "persName",
        title : "title"
    }
};

let currentContext = null;

$(window).on('load', async function () {
    let nerveRoot = await scriberSocket.connect("ws://localhost:8080/NERVESERVER/NerveSocket");
    window.entityPanel = new EntityPanel("#target");
    window.messageWidget = new MessageWidget();
    await window.messageWidget.load();

    $("#bOrlando").click(async ()=>{
        let file = await FileOperations.getURL("assets/documents/orlando.html");
        let schema = await FileOperations.getURL("assets/entitypanel/schemas/orlando_biography_v2.rng");
        window.entityPanel.setDocument(file, "orlando", schema);
        document.title = "orlando";
        entityPanel.setStyle("orlando");
        currentContext = contexts.orlando;
    });

    $("#bTei").click(async ()=>{
        let file = await FileOperations.getURL("assets/documents/tei.html");
        let schema = await FileOperations.getURL("assets/entitypanel/schemas/cwrc_tei_lite.rng");
        window.entityPanel.setDocument(file, "tei", schema);
        document.title = "tei";
        entityPanel.setStyle("tei");
        currentContext = contexts.tei;
    });

    $("#bCwrc").click(async ()=>{
        let file = await FileOperations.getURL("assets/documents/cwrc.html");
        let schema = await FileOperations.getURL("assets/entitypanel/schemas/cwrc_entry.rng");
        window.entityPanel.setDocument(file, "cwrc", schema);
        document.title = "cwrc";
        entityPanel.setStyle("cwrc");
        currentContext = contexts.cwrc;
    });

    $("#bClear").click(async ()=>{
        document.title = "Entity Panel";
        entityPanel.unsetDocument();
        currentContext = null;
    });

    $("#bMerge").click(async ()=>{
        window.entityPanel.mergeEntities();
    });

    $("#bLoc").click(async ()=>{
        let selection = window.getSelection();
        let taggedEntityWidget = await entityPanel.tagSelection(selection, currentContext.location);
        console.log(taggedEntityWidget);
        window.widget = taggedEntityWidget;
        if (taggedEntityWidget !== null) taggedEntityWidget.tag("LOCATION");
    });

    $("#bOrg").click(async ()=>{
        let selection = window.getSelection();
        let taggedEntityWidget = await entityPanel.tagSelection(selection, currentContext.organization);
        console.log(taggedEntityWidget);
        window.widget = taggedEntityWidget;
        if (taggedEntityWidget !== null) taggedEntityWidget.tag("ORGANIZATION");
    });
    $("#bPers").click(async ()=>{
        let selection = window.getSelection();
//        let taggedEntityWidget = await entityPanel.tagSelection(selection, currentContext.person);
        console.log(taggedEntityWidget);
        window.widget = taggedEntityWidget;
        if (taggedEntityWidget !== null) taggedEntityWidget.tag("PERSON");
    });
    $("#bTitle").click(async ()=>{
        let selection = window.getSelection();
        let taggedEntityWidget = await entityPanel.tagSelection(selection, currentContext.title);
        console.log(taggedEntityWidget);
        window.widget = taggedEntityWidget;
        if (taggedEntityWidget !== null) taggedEntityWidget.tag("TITLE");
    });
    $("#bWrong").click(async ()=>{
        let selection = window.getSelection();
        let taggedEntityWidget = await entityPanel.tagSelection(selection, "WRONG");
        if (taggedEntityWidget !== null) window.alert("expected null result not found");
    });
});

