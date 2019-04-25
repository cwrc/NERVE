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
        this.lastFrom = 0;
        
        /* JJJ Initialization */
//        jjjrmi.JJJRMISocket.flags.ONREGISTER = true;
//        jjjrmi.JJJRMISocket.flags.CONNECT = true;
//        jjjrmi.JJJRMISocket.flags.RECEIVED = true;
//        jjjrmi.JJJRMISocket.flags.SENT = true;

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
        $("#remove.button").on("click", ()=>this.removeSelected());
        
        $("#prev").on("click", ()=>{
            let from = this.lastFrom - 30;
            if (from < 0) from = 0;
            this.updateTable(from, 30);
        });
        
        $("#next").on("click", ()=>{
            let from = this.lastFrom + 30;
            this.updateTable(from, 30);
        });        
        
        await this.updateTable();
        
        /* setup filereader */
        let reader = new FileReader();
        reader.main = this;
        
        reader.onload = async function (event) {
            let csv = event.target.result;
            await this.uploadDictionary(csv);
            this.updateTable();
        }.bind(this);
        
        $("#fileOpenDialog").change(async (event) => {
            await reader.readAsText(event.currentTarget.files[0]);
        });        
    }
    
    selectAll(){
        let allSelected = true;
        
        $("input[type='checkbox']").each((i, e)=>{
            if ($(e).prop("checked") === false){                
                allSelected = false;
            }
        });
        
        if (!allSelected) $("input[type='checkbox']").prop("checked", true);
        else $("input[type='checkbox']").prop("checked", false);
    }
    
    copyRow(event){
        let row = $(event.target).parent().parent();
        console.log(row);
        $("#inText").val($(row).find("td:eq(0)").text());
        $("#inLemma").val($(row).find("td:eq(1)").text());
        $("#inLink").val($(row).find("td:eq(2)").text());
        $("#inTag").val($(row).find("td:eq(3)").text());
        $("#inCollection").val($(row).find("td:eq(4)").text()); 
    }
    
    async updateTable(from = 0, count = 30){
        let ev = new EntityValues();

        if ($("#likeText").val().length > 0) ev.text($("#likeText").val());
        if ($("#likeLemma").val().length > 0) ev.lemma($("#likeLemma").val());
        if ($("#likeLink").val().length > 0) ev.link($("#likeLink").val());
        if ($("#likeTag").val().length > 0) ev.tag($("#likeTag").val());
        if ($("#likeCollection").val().length > 0) ev.source($("#likeCollection").val());
        
        let results = await this.dictionary.fullLookup(ev, from, count);
        
        this.clearTable();
        
        let last = $("#records").find("tr:first");
        let i = 0;
        for (let rec of results){
            let html = `
            <tr data-row='${i}'>
                <td class="textcell">${rec.entries[0].value}</td>
                <td class="textcell">${rec.entries[1].value}</td>
                <td class="textcell">${rec.entries[2].value}</td>
                <td class="textcell">${rec.entries[3].value}</td>
                <td class="textcell">${rec.entries[4].value}</td>
                <td>
                    <input data-row='${i}' type='checkbox'/>
                    <div data-row='${i}' id="copy" class="tiny button">&#x2193;</div>
                </td>
            </tr>`;
            $(last).after(html);
            last = $(`tr[data-row='${i}']`);
            last.find("#copy").click((event)=>this.copyRow(event));
            last.find("input[type='checkbox']").dblclick(()=>this.selectAll());
            i++;
        }
        
        $("#current").text(`${from} - ${from + count}`);
        this.lastFrom = from;
    }
    
    async removeSelected(){
        $("input[type='checkbox']").each((i, e)=>{
            if ($(e).is(":checked")) this.removeEntry(i);            
        });
        this.updateTable();
    }
    
    async removeEntry(index){
        let row = $(`tr[data-row='${index}']`);
        let ev = new EntityValues();
        ev.text($(row).find("td:eq(0)").text());
        ev.lemma($(row).find("td:eq(1)").text());
        ev.link($(row).find("td:eq(2)").text());
        ev.tag($(row).find("td:eq(3)").text());
        ev.source($(row).find("td:eq(4)").text());
        await this.dictionary.deleteEntity(ev);        
    }
    
    async clearTable(){
        $("#records").find("tr:gt(0)").not(":last").not(":last").remove();
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
    
    async uploadDictionary(document, onUpdate = p => {}) {
        let contents = document.split(/[\r\n]+/g);
        const SET_SIZE = 4000;
        let sent = 0;
        let valueArray = [];

        for (let row of contents) {            
            let entry = row.split(/,/g);
            let values = new EntityValues();
            values.text(entry[0]);
            values.lemma(entry[1]);
            values.link(entry[2]);
            values.tag(entry[3]);
            values.source(entry[4]);
            valueArray.push(values);
            
            console.log(entry);

            if (valueArray.length >= SET_SIZE) {
                sent = sent + valueArray.length;
                await this.dictionary.addEntities(valueArray);
                let p = sent / contents.length * 100;
                onUpdate(Math.floor(p));
                valueArray = [];
            }
        }

        await this.dictionary.addEntities(valueArray);
        onUpdate(100);
    }    
}