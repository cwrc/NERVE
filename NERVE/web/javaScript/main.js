$(window).ready(() => {
    windowLoad();
});

function windowLoad() {
    /* get ip address in case development only optionas are needed */
    jQuery.getJSON('//freegeoip.net/json/?callback=?', function (data) {
        initialize(data.ip);
    }.bind(this));

    /* make boostrap dialogs movable */
    jQuery('.modal-dialog').draggable({
        handle: ".modal-header"
    });
};

initialize = function (clientIP) {
    let settings = new Storage();
    let view = new View(clientIP);
    view.pushThrobberMessage("Loading JavaScript Objects");
    window.view = view; /* TODO delete this line */
    let factory = new TaggedEntityFactory();
    let model = new Model(view, factory, settings);
    model.setVariable("host", location.host);

    let controller = new Controller(view, model, factory, new FileOperations());
    window.controller = controller; /* TODO delete this line */
    let events = new Events(view, model, controller);
    controller.setEventHandler(events);

    factory.setContextSource(model);
    factory.setEventHandler(events);

    let onContextLoadSuccess = function () {
        let text = settings.getValue("model", "document", "");
        let title = settings.getValue("model", "filename", "");
        model.setDocument(text, title);
        new Listeners(view, events);
        this.view.popThrobberMessage();
        this.view.showThrobber(false);
        $("#container").show();
    };

    let onContextLoadFailure = function (status, text, contextName) {
        view.pushThrobberMessage(`Failed to load schema : ${contextName}\n`);
        let msg = `Failed to load schema : ${contextName}\n`;
        msg += "return status : " + status;
        console.log(text);
        window.alert(msg);
    };

    let contextName = new Storage("controller").getValue("savedState", "contextName", "Orlando");
    controller.loadContext("orlando", onContextLoadSuccess, onContextLoadFailure);
};