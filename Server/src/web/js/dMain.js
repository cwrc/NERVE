const jQuery = require("jquery");
const $ = jQuery;
const jjjrmi = require("jjjrmi");
window.EntityValues = require("nerscriber").EntityValues;
window.package = require("./nerveserver/package");

$(window).on('load', async function () {
    window.main = new Main();
    await main.run();
});

class Main {

    document(text) {
        if (text === undefined) {
            return $("#filetext").text();
        } else {
            $("#filetext").text(text);
        }
    }

    async initialSeed(){
        let r = await this.dictionary.fullLookup(new EntityValues(), 20, -1);
        console.log(r);
    }

    async run() {
        let reader = new FileReader();

        /* JJJ Initialization */
        jjjrmi.JJJRMISocket.flags.ONREGISTER = true;
        jjjrmi.JJJRMISocket.flags.CONNECT = true;
        jjjrmi.JJJRMISocket.flags.RECEIVED = true;
        jjjrmi.JJJRMISocket.flags.SENT = true;

        console.log(jjjrmi.JJJRMISocket.flags);

        jjjrmi.JJJRMISocket.registerPackage(require("./nerveserver/packageFile"));
        jjjrmi.JJJRMISocket.registerPackage(require("jjjsql"));
        jjjrmi.JJJRMISocket.registerPackage(require("nerscriber"));

        this.rootSocket = new jjjrmi.JJJRMISocket("NerveSocket");
        this.rootObject = await this.rootSocket.connect();
        this.scriber = this.rootObject.getScriber();
        this.dictionary = this.rootObject.getDictionary();
    }
}