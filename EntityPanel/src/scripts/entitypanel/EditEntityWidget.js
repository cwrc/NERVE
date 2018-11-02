const $ = window.$ ? window.$ : require("jquery");
const Widget = require("@thaerious/nidget").Widget;
const FileOperations = require("@thaerious/utility").FileOperations;

class EditEntityWidget extends Widget {

    constructor(delegate) {
        super(null, delegate);
    }

    async load() {
        let domElement = await FileOperations.loadDOMElement(`assets/entitypanel/editEntityWidget.frag.html`);
        $("body").append(domElement);
        this.setElement(domElement);
                $(this.getElement()).find("#editEntityAccept").click(() => {
            this.onClose(true);
        });

        $(this.getElement()).find("#editEntityCancel").click(() => {
            this.onClose(false);
        });

        this.textTB = $("[data-widget-id='text'] > input[type='text']");
        this.lemmaTB = $("[data-widget-id='lemma'] > input[type='text']");
        this.linkTB = $("[data-widget-id='link'] > input[type='text']");
        this.radioButtons = $("[data-widget-id='radioButtons']");
        
        this.textCB = $("[data-widget-id='text'] input[type='checkbox']");
        this.lemmaCB = $("[data-widget-id='lemma'] input[type='checkbox']");
        this.linkCB = $("[data-widget-id='link'] input[type='checkbox']");
        this.tagCB = $("[data-widget-id='radioButtons'] input[type='checkbox']");        
    }

    onClose(accept) {
        this.dialogOptions = {
            text: this.textCB.is(":checked") ? this.textTB.val() : null,
            lemma: this.lemmaCB.is(":checked") ? this.lemmaTB.val() : null,
            link: this.linkCB.is(":checked") ? this.linkTB.val() : null,
            tag: this.tagCB.is(":checked") ? this.radioButtons.find("input:radio:checked").val() : null,
            accept: accept
        };

        this.resolve(this.dialogOptions);
    }

    async show(taggedEntityCollection) {
        let callback = function (resolve, reject) {
            this.resolve = resolve;
            this.reject = reject;
            if (taggedEntityCollection.isEmpty()) this.onClose(false);
        }.bind(this);
        
        if (!taggedEntityCollection.isEmpty()) {
            this.textTB.val(taggedEntityCollection.get(0).text());
            this.lemmaTB.val(taggedEntityCollection.get(0).lemma());
            this.linkTB.val(taggedEntityCollection.get(0).link());

            let tagname = taggedEntityCollection.get(0).tag();
            this.radioButtons.find(`[value='${tagname}']`).attr("checked", true);

            for (let i = 1; i < taggedEntityCollection.size(); i++) {
                let taggedEntity = taggedEntityCollection.get(i);
                console.log(taggedEntity);

                if (taggedEntity.text() !== taggedEntityCollection.get(0).text()) {
                    this.textTB.css("background-color", "#ffe8f3");
                } else {
                    this.textTB.css("background-color", "#ffffff");
                }
                if (taggedEntity.lemma() !== taggedEntityCollection.get(0).lemma()) {
                    this.lemmaTB.css("background-color", "#ffe8f3");
                } else {
                    this.lemmaTB.css("background-color", "#ffffff");
                }
                if (taggedEntity.link() !== taggedEntityCollection.get(0).link()) {
                    this.linkTB.css("background-color", "#ffe8f3");
                } else {
                    this.linkTB.css("background-color", "#ffffff");
                }
            }
            this.$.modal();
        } else {
//            this.resolve("null");
        }

        return new Promise(callback);
    }
}

module.exports = EditEntityWidget;