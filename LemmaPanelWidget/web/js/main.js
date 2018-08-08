window.$ = require("jquery");
const DragWidget = require("Nidget/src/DragWidget");
const LemmaContainer = require("./LemmaContainer");


class Content extends DragWidget {

    constructor(source) {
        super(source);
        this.clear();        
    }

    highlight() {
        this.$.addClass("highlight");
    }

    clear() {
        this.$.removeClass("highlight");
    }

    static all() {
        return Content.instances;
    }
}
window.Content = Content;

class Main {

    constructor() {        
        this.content = [];        
        $("#content_container > div").each((n, o) => {
            this.content.push(new Content(o));
        });
    }

    lemmaDropObject(lemmaContainer, category, lemma, object) {
        lemmaContainer.setObject(category, lemma, object);
    }

    notifyClickLemmaWidget(lemmaContainer, category, lemma) {        
        this.content.forEach(o=>o.clear());
        lemmaContainer.getObjects(category, lemma).forEach(o => o.highlight());
    }
    
    notifyEyeState(lemmaContainer, category, state){
        let objects = lemmaContainer.getObjects(category);
        
        for (let object of objects){
            if (state) object.$.show();
            else object.$.hide();
        }
    }
}



window.lemmaContainer = new LemmaContainer("#lemma_container_target");
lemmaContainer.addListener(new Main());

lemmaContainer.addCategory("alpha");
lemmaContainer.addCategory("bravo");
lemmaContainer.addCategory("charlie");

lemmaContainer.addLemma("alpha", "one");
lemmaContainer.addLemma("alpha", "two");
lemmaContainer.addLemma("alpha", "three");

lemmaContainer.addLemma("bravo", "four");
lemmaContainer.addLemma("bravo", "five");
lemmaContainer.addLemma("bravo", "six");

lemmaContainer.addLemma("charlie", "seven");
lemmaContainer.addLemma("charlie", "eight");
lemmaContainer.addLemma("charlie", "nine");

