const jQuery = require("jquery");
const $ = jQuery;
const jjjrmi = require("jjjrmi");
window.package = require("./nerveserver/package");

$(window).on('load', async function () {
    window.main = new Main();
    await main.run();
});

class Main {
    async run() {
        let reader = new FileReader();
        this.document = null;
        this.encoded = null;

        /* JJJ Initialization */
        jjjrmi.JJJRMISocket.flags.CONNECT = true;
        jjjrmi.JJJRMISocket.flags.RECEIVED = true;
        jjjrmi.JJJRMISocket.flags.SENT = true;

        jjjrmi.JJJRMISocket.registerPackage(require("./nerveserver/package"));
        jjjrmi.JJJRMISocket.registerPackage(require("jjjsql"));
        jjjrmi.JJJRMISocket.registerPackage(require("nerscriber"));

        this.rootSocket = new jjjrmi.JJJRMISocket("NerveSocket");
        this.rootObject = await this.rootSocket.connect();
        this.scriber = this.rootObject.getScriber();

        /* page functionality */
        reader.main = this;
        reader.onload = async function (event) {
            $("#filetext").text(event.target.result);
            this.main.document = event.target.result;                        
        };

        $("#fileOpenDialog").change(async (event) => {
            document.title = event.currentTarget.files[0].name;
            await reader.readAsText(event.currentTarget.files[0]);
        });

        $("#bEdit").click(async (event) => {
            if (this.document === null){
                window.alert("no document loaded");
            } else {                
                let result = await this.scriber.edit(this.document);
                this.encoded = result.text;
                this.context = JSON.parse(result.context);
                $("#filetext").text(result.text);
                console.log("---- Encoded ----");
                console.log(result);                
                console.log("-----------------");
            }
        });

        $("#bNer").click(async (event) => {
            if (this.document === null){
                window.alert("no document loaded");
            } else {                
                let result = await this.scriber.tag(this.document);                
                this.encoded = result.text;
                this.context = JSON.parse(result.context);
                $("#filetext").text(result.text);
                console.log("---- Encoded ----");
                console.log(result);                
                console.log("-----------------");
            }
        });
        
        $("#bDict").click(async (event) => {
            if (this.document === null){
                window.alert("no document loaded");
            } else {                
                let result = await this.scriber.link(this.document); 
                this.encoded = result.text;
                this.context = JSON.parse(result.context);
                $("#filetext").text(result.text);
                console.log("---- Encoded ----");
                console.log(result);                
                console.log("-----------------");
            }
        });        

        $("#bFull").click(async (event) => {
            if (this.document === null){
                window.alert("no document loaded");
            } else {                
                let result = await this.scriber.encode(this.document);
                this.encoded = result.text;
                this.context = JSON.parse(result.context);
                $("#filetext").text(result.text);
                console.log("---- Encoded ----");
                console.log(result);                
                console.log("-----------------");
            }
        });  
        
        $("#bDecode").click(async (event) => {
            if (this.encoded === null){
                window.alert("no document encoded");
            } else {                
                console.log(this.encoded);
                let result = await this.scriber.decode(this.encoded, this.context.name);                
                $("#filetext").text(result);
                console.log("---- Decoded ----");
                console.log(result);                
                console.log("-----------------");
            }
        });          
        
        return this;
    }
}
