const jQuery = require("jquery");
const $ = jQuery;
const jjjrmi = require("jjjrmi");

window.jQuery = jQuery;
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

    async run() {
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
        
        $("#add.button").on("click", ()=>this.addEntry());
        $("#refresh.button").on("click", ()=>this.updateTable());
        
        await this.updateTable();
    }
    
    async updateTable(){
        let ev = new EntityValues();

        if ($("#likeText").val().length > 0) ev.text($("#likeText").val());
        if ($("#likeLemma").val().length > 0) ev.lemma($("#likeLemma").val());
        if ($("#likeLink").val().length > 0) ev.link($("#likeLink").val());
        if ($("#likeTag").val().length > 0) ev.tag($("#likeTag").val());
        if ($("#likeCollection").val().length > 0) ev.source($("#likeCollection").val());
        console.log(ev);
        
        let results = await this.dictionary.fullLookup(ev, 0, 30);
        
        this.clearTable();
        
        let i = 0;
        for (let rec of results){
            let html = `
            <tr data-row='${i}'>
                <td>${rec.entries[0].value}</td>
                <td>${rec.entries[1].value}</td>
                <td>${rec.entries[2].value}</td>
                <td>${rec.entries[3].value}</td>
                <td>${rec.entries[4].value}</td>
                <td data-row='${i}'><input type='checkbox'/></td>
            </tr>`;
            $("#records").append(html);
            i++;
        }
    }
    
    async clearTable(){
        $("#records").find("tr:gt(0)").remove();
    }
    
    async addEntry(){
        let ev = new EntityValues();
        ev.text($("#inText").val());
        ev.lemma($("#inLemma").val());
        ev.link($("#inLink").val());
        ev.tag($("#inTag").val());
        ev.source($("#inCollection").val());
        await this.dictionary.addEntities([ev]);
        await this.updateTable();
    }
}