"use strict";
$(window).on('load', async function () {
    window.main = new Main();
    await main.run();
});

function postJSON(url, json) {
    let callback = function (resolve, reject) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    resolve(JSON.parse(xhttp.responseText));
                } else {
                    reject(JSON.parse(xhttp.responseText));
                }
            }
        };

        xhttp.open("POST", url, true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");        
        xhttp.send(json);
    };

    return new Promise(callback);
};


class Main {

    constructor(){
        if (localStorage.document !== undefined){
            this.document(localStorage.document);
        }
        
        if (localStorage.state === undefined){
            this.setState("plain-xml");
        } else {
            this.setState(localStorage.state);
        }
    }

    setState(state){
        this.state = state;
        localStorage.state = state;
        
        switch(state){
            case "plain-xml":
            case "processed-xml":
                $("#bReset").attr("disabled", false);
                $("#bNer").attr("disabled", false);
                $("#bDict").attr("disabled", false);
                $("#bLink").attr("disabled", false);
                $("#bHTML").attr("disabled", false);
                $("#bClear").attr("disabled", false);
                $("#bDecode").attr("disabled", true);                   
                break;     
            case "html":
                $("#bReset").attr("disabled", false);
                $("#bNer").attr("disabled", true);
                $("#bDict").attr("disabled", true);
                $("#bLink").attr("disabled", true);
                $("#bHTML").attr("disabled", true);
                $("#bClear").attr("disabled", false);
                $("#bDecode").attr("disabled", false);
            break;
        }
    }

    document(text) {
        if (text === undefined) {
            return $("#filetext").text();
        } else {
            $("#filetext").text(text);
        }
    }

    async ner(document) {
        return await postJSON("/NerveService/ner", JSON.stringify({"document": document}));
    }

    async lemmaDict(document) {
        return await postJSON("/NerveService/dict-all", JSON.stringify({"document": document}));
    }

    async linkDict(document) {
        return await postJSON("/NerveService/dict-link", JSON.stringify({"document": document}));
    }

    async toHTML(document) {
        return await postJSON("/NerveService/to-html", JSON.stringify({"document": document}));
    }

    async toXML(document, context) {
        return await postJSON("/NerveService/to-xml", JSON.stringify({"document": document, "context": context}));
    }

    async run() {
        let reader = new FileReader();

        $("#throbber").hide();

        /* page functionality */
        reader.main = this;
        reader.onload = async function (event) {
            $("#throbber").show();

            this.document(event.target.result);
            $("#fileOpenDialog").val("");
            localStorage.document = event.target.result;


            $("#throbber").hide();
        }.bind(this);

        $("#fileOpenDialog").change(async (event) => {
            document.title = event.currentTarget.files[0].name;
            await reader.readAsText(event.currentTarget.files[0]);
            this.setState("plain-xml");
        });

        $("#bReset").click(async (event) => {
            $("#throbber").show();
            this.document(localStorage.document);
            this.setState("plain-xml");
            $("#throbber").hide();
        });

        $("#bClear").click(async (event) => {
            $("#throbber").show();
            this.document("");
            localStorage.document = "";
            this.context = null;
            this.setState("plain-xml");
            $("#throbber").hide();
        });

        $("#bNer").click(async (event) => {
            $("#throbber").show();
            try {
                let result = await this.ner(this.document());
                console.log(result);
                this.context = JSON.parse(result.context);
                $("#filetext").text(result.document);
                this.setState("processed-xml");
            } catch (error) {
                window.alert(error.status + "\n" + error.message);
            } finally {
                $("#throbber").hide();
            }
        });

        $("#bDict").click(async (event) => {
            $("#throbber").show();
            try {
                let result = await this.lemmaDict(this.document());
                this.context = JSON.parse(result.context);
                this.document(result.document);
                this.setState("processed-xml");
            } catch (error) {
                window.alert(error.status + "\n" + error.message);
            } finally {
                $("#throbber").hide();
            }
        });

        $("#bLink").click(async (event) => {
            $("#throbber").show();
            try {
                let result = await this.linkDict(this.document());
                this.context = JSON.parse(result.context);
                this.document(result.document);
                this.setState("processed-xml");
            } catch (error) {
                window.alert(error.status + "\n" + error.message);
            } finally {
                $("#throbber").hide();
            }
        });

        $("#bHTML").click(async (event) => {
            $("#throbber").show();
            try {
                let result = await this.toHTML(this.document());
                this.context = JSON.parse(result.context);
                this.document(result.document);
                this.setState("html");
            } catch (error) {
                window.alert(error.status + "\n" + error.message);
            } finally {
                $("#throbber").hide();
            }
        });

        $("#bGoDict").click(async (event) => {
              window.open("/NerveService/dictionary.html");
        });

        $("#bDecode").click(async (event) => {
            $("#throbber").show();
            try {
                let result = await this.toXML(this.document(), JSON.stringify(main.context));
                this.document(result.document);
                this.setState("processed-xml");
            } catch (error) {
                window.alert(error.status + "\n" + error.message);
            } finally {
                $("#throbber").hide();
            }
        });

        $(document).keydown(function (objEvent) {
            if (objEvent.keyCode === 9 && document.activeElement.id === "filetext") {  //tab pressed
                objEvent.preventDefault(); // stops its action

                // now insert four non-breaking spaces for the tab key
                var editor = document.getElementById("filetext");
                var doc = editor.ownerDocument.defaultView;
                var sel = doc.getSelection();
                var range = sel.getRangeAt(0);

                var tabNode = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
                range.insertNode(tabNode);

                range.setStartAfter(tabNode);
                range.setEndAfter(tabNode);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        });

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