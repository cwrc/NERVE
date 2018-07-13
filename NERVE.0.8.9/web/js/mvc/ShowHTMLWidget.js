
class ShowHTMLWidget{
    
    constructor(taggedEntityWidget){
        console.log("ShowHTMLWidget");
        this.modal = $("#showHTMLWidget");
        let taggedEntityElement = taggedEntityWidget.getElement();
        let html = taggedEntityElement.outerHTML;        
        while(html.indexOf("&quot;") !== -1){ 
            html = html.replace("&quot;", "\"");
        }
        $(this.modal).find("[data-widget-id='html-contents']").text(html);
    }    
    
    show(){
        $(this.modal).modal("show");
    }
}

module.exports = ShowHTMLWidget;