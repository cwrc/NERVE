$(window).ready(() => {
    windowLoad();
});

function windowLoad() {
    window.main = new Main();

    /* get ip address in case development only optionas are needed */
    jQuery.getJSON('//freegeoip.net/json/?callback=?', function (data) {
        main.initialize(data.ip);
    }.bind(this));

    /* make boostrap dialogs movable */
    jQuery('.modal-dialog').draggable({
        handle: ".modal-header"
    });
}
;

class ContextLoader {
    constructor() {
        this.context = new Context({
            name: "",
            tags:[],
            styles:[]
        });
    }

    loadContext(contextName, success = function() {}, failure = function(){}){}
    lookupContext(fullpath){}
}

class Main extends ContextLoader{
    constructor(){
        super();
        this.settings = new Storage();
        this.model = null;
        this.controller = null;
        this.view = null;
        this.listener = null;
        this.fileOps = new FileOperations();
    }

    initialize(clientIP) {
        this.view = new View(clientIP);
        this.view.pushThrobberMessage("Loading JavaScript Objects");
        this.model = new Model(this.view, this.settings);
        this.model.setVariable("host", location.host);
        this.controller = new Controller(this.view, this.model, this.fileOps, this);
        this.listener = new Listeners(this.view, this.controller);
        this.view.popThrobberMessage();
        this.view.showThrobber(false);

        if (this.model.loadStoredDoc() && this.settings.hasValue("context-name")){
            let contextName = this.settings.getValue("context-name");
            this.loadContext(contextName, ()=>{
                this.model.setupTaggedEntity($(".taggedentity"));
                this.view.showThrobber(false);
                $("#container").show();
            });
        } else {
            this.view.showThrobber(false);
            $("#container").show();
        }
    }

    loadContext(contextName, success = function() {}, failure = function(){}) {
        let url = "resources/" + contextName.toLowerCase() + ".context.json";

        let contextCreateSuccess = (context)=>{
            this.model.setContext(context);
            this.controller.setContext(context);
            this.view.setContext(context);
            $.fn.xmlAttr.defaults.context = context;
            this.settings.setValue("context-name", context.name);
            success();
        };

        let contextCreateFailure = (status, text)=>{
            window.alert("Unable to create context object : " + status);
            console.log(text);
            failure(status, text);
        };

        let fileLoadSuccess = (contents)=>{
            this.context = new Context(JSON.parse(contents), contextCreateSuccess, contextCreateFailure);
        };

        let fileLoadFailure = (status, text)=>{
            window.alert("Unable to retrieve context file from server : " + status);
            console.log(text);
        };

        this.fileOps.loadFromServer(url, fileLoadSuccess, fileLoadFailure);
    }

    lookupContext(fullpath){
        console.log(fullpath.split("/"));
    }
}