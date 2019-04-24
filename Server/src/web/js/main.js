const jQuery = require("jquery");
const $ = jQuery;
const jjjrmi = require("jjjrmi");
const EntityValues = require("nerscriber").EntityValues;
window.package = require("./nerveserver/package");
window.jQuery = jQuery;

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

        /* page functionality */
        reader.main = this;
        reader.onload = async function (event) {
            console.log(this);
            this.document(event.target.result);
            $("#fileOpenDialog").val("");
            localStorage.document = event.target.result;
            
            $("#bNer").attr("disabled", false);
            $("#bDict").attr("disabled", false);
            $("#bLink").attr("disabled", false);
            $("#bHTML").attr("disabled", false);
            $("#bClear").attr("disabled", false);   
            $("#bDecode").attr("disabled", true);
        }.bind(this);

        $("#fileOpenDialog").change(async (event) => {
            document.title = event.currentTarget.files[0].name;
            await reader.readAsText(event.currentTarget.files[0]);
        });

        $("#bClear").click(async (event) => {
            this.document("");
            localStorage.document = "";
            this.context = null;
            $("#bNer").attr("disabled", true);
            $("#bDict").attr("disabled", true);
            $("#bLink").attr("disabled", true);
            $("#bHTML").attr("disabled", true);
            $("#bClear").attr("disabled", true);            
            $("#bDecode").attr("disabled", true);            
        });

        $("#bNer").click(async (event) => {
            try {
                let result = await this.scriber.ner(this.document());
                this.context = JSON.parse(result.context);
                $("#filetext").text(result.text);
            } catch (error) {
                window.alert(error);
            }
        });

        $("#bDict").click(async (event) => {
            try {
                let result = await this.scriber.dictionary(this.document());
                this.context = JSON.parse(result.context);
                this.document(result.text);
            } catch (error) {
                window.alert(error);
            }
        });

        $("#bLink").click(async (event) => {
            try {
                let result = await this.scriber.link(this.document());
                this.context = JSON.parse(result.context);
                this.document(result.text);
            } catch (error) {
                window.alert(error);
            }
        });

        $("#bHTML").click(async (event) => {
            try {
                let result = await this.scriber.html(this.document());
                this.context = JSON.parse(result.context);
                this.document(result.text);
                $("#bNer").attr("disabled", true);
                $("#bDict").attr("disabled", true);
                $("#bLink").attr("disabled", true);
                $("#bHTML").attr("disabled", true);
                $("#bDecode").attr("disabled", false);
            } catch (error) {
                window.alert(error);
            }
        });

        $("#bDecode").click(async (event) => {
            try {
                let result = await this.scriber.decode(this.document(), JSON.stringify(main.context));
                this.document(result.text);
                $("#bNer").attr("disabled", false);
                $("#bDict").attr("disabled", false);
                $("#bLink").attr("disabled", false);
                $("#bHTML").attr("disabled", false);
                $("#bDecode").attr("disabled", true);                
            } catch (error) {
                window.alert(error);
            }
        });

        $("#bUpload").click(async (event) => {
            window.open("dictionary.html");
        });
        
        if (localStorage.document){
            this.document(localStorage.document);
            $("#bNer").attr("disabled", false);
            $("#bDict").attr("disabled", false);
            $("#bLink").attr("disabled", false);
            $("#bHTML").attr("disabled", false);
            $("#bClear").attr("disabled", false);
        }        
        
        return this;
    }

    async uploadDictionary(document, onUpdate = p => {}) {
        let contents = document.split(/\n/g);
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