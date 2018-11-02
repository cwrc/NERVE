const $ = window.$ ? window.$ : require("jquery");
const Widget = require("@thaerious/nidget").Widget;
const FileOperations = require("@thaerious/utility").FileOperations;

class ShowHTMLWidget extends Widget{
    
    constructor(delegate){
        super(null, delegate);
    }
    
    async load(){
        let domElement = await FileOperations.loadDOMElement(`assets/entitypanel/showHTMLWidget.frag.html`);   
        $("body").append(domElement);
        this.setElement(domElement);
    }
    
    show(taggedEntityWidget){
        this.$.find('[data-widget-id="title"]').text(taggedEntityWidget.lemma());
        this.$.find('[data-widget-id="contents"]').text(taggedEntityWidget.$[0].outerHTML);
        this.$.modal();
    }
}

module.exports = ShowHTMLWidget;