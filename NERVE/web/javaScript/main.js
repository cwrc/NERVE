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
        this.context = new Context();
        this.context.load({tags: []});
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
        this.events = null;
        this.listener = null;
        this.fileOps = new FileOperations();
    }

    initialize(clientIP) {
        this.view = new View(clientIP);
        this.view.pushThrobberMessage("Loading JavaScript Objects");
        this.model = new Model(this.view, this.settings);
        this.model.setVariable("host", location.host);

        this.controller = new Controller(this.view, this.model, this.fileOps, this);
        this.events = new Events(this.view, this.model, this.controller);
        this.controller.setEventHandler(this.events);

        let onContextLoadSuccess = function () {
            this.listener = new Listeners(this.view, this.events, this.controller);
            this.controller.setListener(this.listener);
            this.model.setListener(this.listener);
            this.model.loadStoredDoc();
            this.view.popThrobberMessage();
            this.view.showThrobber(false);
            $("#container").show();
        }.bind(this);

        let onContextLoadFailure = function (status, text, contextName) {
            this.view.pushThrobberMessage(`Failed to load schema : ${contextName}\n`);
            let msg = `Failed to load schema : ${contextName}\n`;
            msg += "return status : " + status;
            console.log(text);
            window.alert(msg);
        }.bind(this);

        let contextName = "orlando";
        if (this.settings.hasValue("contextName")){
            contextName = this.settings.getValue("contextName");
        }

        this.loadContext(contextName, onContextLoadSuccess, onContextLoadFailure);
    }

    loadContext(contextName, success = function() {}, failure = function(){}) {
        let url = "resources/" + contextName.toLowerCase() + ".context.json";

        this.fileOps.loadFromServer(url, (contents) => {
            this.settings.setValue("contextName", contextName);

            let onLoad = ()=>{
                this.model.setContext(this.context);
                this.controller.setContext(this.context);
                this.view.setContext(this.context);
                this.events.setContext(this.context);
                $.fn.xmlAttr.defaults.context = this.context;
                success();
            }

            this.context.load(JSON.parse(contents), onLoad, failure);
        }, (status, text) => {
            failure(status, text, contextName);
        });
    }

    lookupContext(fullpath){
        console.log(fullpath.split("/"));
    }
}