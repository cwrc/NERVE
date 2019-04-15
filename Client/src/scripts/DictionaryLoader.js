'use strict';
const $ = window.$ ? window.$ : require("jquery");
let CustomReader = require("./CustomReader");
const Widget = require("@thaerious/nidget").Widget;
const FileOperations = require("./utility/FileOperations");
const EntityValues = require("nerveserver").EntityValues;

class DictionaryLoader {

    constructor(dictionary, throbber) {
        this.customReader = new CustomReader("#dictLoadDialog");
        this.widget = new DictionaryDialogWidget();
        this.dictionary = dictionary;
        this.throbber = throbber;
    }

    async load() {
        await this.widget.load();
    }

    async onMenuUploadDictionary() {
        let result = await this.customReader.show();
        let name = result.filename.split(".")[0].replace(/[ ]+/g, "_");
        this.widget.setName(name);
        let accept = await this.widget.show();
        if (!accept) return;

//        let wasTableAdded = await this.dictionary.addTable(this.widget.getName());

//        console.log("Table was " + (wasTableAdded ? "" : "not ") + "added");

        let contents = result.contents.split(/\n/g);
        this.throbber.setMessage("Loading Dictionary Entries");
        this.throbber.show();
        this.throbber.setPercent(0);

        let setSize = 500;
        let sent = 0;
        let valueArray = [];

        for (let row of contents) {
            let entry = row.split(/,/g);
            let values = new EntityValues();
            values.text(entry[0]);
            values.lemma(entry[1]);
            values.link(entry[2]);
            values.tag(entry[3]);
            valueArray.push(values);

            if (valueArray.length >= setSize) {
                sent = sent + valueArray.length;
                await this.dictionary.addEntities(name, valueArray);
                let p = sent / contents.length * 100;
                this.throbber.setPercent(Math.trunc(p));
                console.log(p + ", " + sent + " / " + contents.length);
//                if (sent >= 20) break;
                valueArray = [];
            }
        }

        this.throbber.hide();
    }
}

class DictionaryDialogWidget extends Widget {
    constructor(delegate) {
        super(null, delegate);
        this.accept = false;
    }

    async load() {
        let domElement = await FileOperations.loadDOMElement(`assets/namedict.frag.html`);
        $("body").append(domElement);
        this.setElement(domElement);

        $(this.getElement()).find("[data-action='accept']").click(() => {
            this.$.modal('hide');
            this.resolve(true);
        });

        $(this.getElement()).find("[data-action='cancel']").click(() => {
            this.$.modal('hide');
            this.resolve(false);
        });
    }

    getName() {
        let nameElement = $(this.getElement()).find("[data-component='name']");
        return $(nameElement).val();
    }

    setName(name) {
        let nameElement = $(this.getElement()).find("[data-component='name']");
        return $(nameElement).val(name);
    }

    async show() {
        let callback = function (resolve, reject) {
            this.resolve = resolve;
            this.reject = reject;
        }.bind(this);

        this.$.modal();
        return new Promise(callback);
    }
}

module.exports = DictionaryLoader;