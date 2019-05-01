"use strict";

$(window).on('load', async function () {
    window.main = new Main();
    await main.run();
});

class EntityValues{
    set text(value){
        this.entity = value;
    }
    
    get text(){
        return this.entity;
    }
}

class Dictionary{
    async fullLookup(ev, from, count){
        let result = await postJSON("/NerveService/lookup-entities", JSON.stringify({"values": ev, "from": from, "count": count}));
        return result.entities;
    }
    
    async deleteEntity(ev){
        await postJSON("/NerveService/delete-entities", JSON.stringify({"values": ev}));
    }
    
    async addEntities(evArray){
        await postJSON("/NerveService/add-entities", JSON.stringify({"entities": evArray}));
    }
}

class Main {
    async run() {
        this.lastFrom = 0;
        this.dictionary = new Dictionary();
        
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
        console.log("Update Table");
        let ev = new EntityValues();

        if ($("#likeText").val().length > 0) ev.text = $("#likeText").val();
        if ($("#likeLemma").val().length > 0) ev.lemma = $("#likeLemma").val();
        if ($("#likeLink").val().length > 0) ev.link = $("#likeLink").val();
        if ($("#likeTag").val().length > 0) ev.tag = $("#likeTag").val();
        if ($("#likeCollection").val().length > 0) ev.source = $("#likeCollection").val();
        
        let results = await this.dictionary.fullLookup(ev, from, count);
        
        this.clearTable();
        
        let last = $("#records").find("tr:first");
        let i = 0;
        for (let rec of results){
            let html = `
            <tr data-row='${i}'>
                <td class="textcell">${rec.entity}</td>
                <td class="textcell">${rec.lemma}</td>
                <td class="textcell">${rec.link}</td>
                <td class="textcell">${rec.tag}</td>
                <td class="textcell">${rec.source}</td>
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
        ev.text = $(row).find("td:eq(0)").text();
        ev.lemma = $(row).find("td:eq(1)").text();
        ev.link = $(row).find("td:eq(2)").text();
        ev.tag = $(row).find("td:eq(3)").text();
        ev.source = $(row).find("td:eq(4)").text();
        await this.dictionary.deleteEntity(ev);        
    }
    
    async clearTable(){
        $("#records").find("tr:gt(0)").not(":last").not(":last").remove();
    }
    
    async addEntry(){
        let ev = new EntityValues();
        ev.text = $("#inText").val();
        ev.lemma = $("#inLemma").val();
        ev.link = $("#inLink").val();
        ev.tag = $("#inTag").val();
        ev.source = $("#inCollection").val();
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