window.$ = require("jquery");
const AbstractModel = require("@thaerious/nidget").AbstractModel;
const DragWidget = require("@thaerious/nidget").DragWidget;
const DropWidget = require("@thaerious/nidget").DropWidget;
const LemmaDialogWidget = require("./lemmadialog/LemmaDialogWidget");
const LemmaDialogController = require("./lemmadialog/LemmaDialogController");
const TaggedEntityCollection = require("@thaerious/entitypanel").TaggedEntityCollection;

class EntityController{
    constructor(entityContainer, dropContainer){
        this.entityContainer = entityContainer;
        this.dropContainer = dropContainer;
    }
    
    notifyClickLemmaWidget(lemmaWidget, category, lemma){
    }

    notifyDblClickLemmaWidget(lemmaWidget, category, lemma){
        let objects = lemmaWidget.getObjects(category, lemma);
        for (let object of objects){
            console.log(object);
            object.$.detach();
            this.dropContainer.drop(null, object);
        }
    }    
}

class Entity extends DragWidget{
    constructor(element, delegate){
        super(element, delegate);
        this.tagValue = this.$.find(".tag").text();
        this.lemmaValue = this.$.find("[title]").attr("title");
        this.notifyListeners("notifyNewTaggedEntities", [this]);        
        this.$.click(()=>this.notifyListeners("notifyTaggedEntityClick", this));
    }
    
    text(value = null){
        if (value !== null){
            this.$.find("[title]").text(value);
        }
        return this.$.find("[title]").text();
    }
    
    tag(value = null){
        if (value !== null){
            this.tagValue = value;
            this.$.find(".tag").text(value);
        }
        return this.tagValue;
    }
    
    lemma(value = null){
        if (value !== null){
            this.lemmaValue = value;
            this.$.find("[title]").attr("title", value);
        }
        return this.lemmaValue;
    }
    
    highlight() {
        this.$.addClass("highlight");
    }

    clear() {
        this.$.removeClass("highlight");
    }    
}

/* middle */
class EntityContainer extends DropWidget{
    constructor(collection){
        super("#content_container");
        this.collection = collection;
    }
    
    drop(event, data){
        if (data instanceof Entity === false) return;
        this.$.append(data.$);
        this.collection.remove(data);
    }
}

/* rhs */
class DropContainer extends DropWidget{
    constructor(){
        super("#collection_container");
        this.collection = new TaggedEntityCollection(this);
        
        $("#update").click(()=>{
            let array = [];
            let newTag = $("#tagInput").val();
            let newLemma = $("#lemmaInput").val();
            let newText = $("#textInput").val();
            
            for (let entity of this.collection){
                if (newTag !== "")   entity.tag(newTag);
                if (newLemma !== "") entity.lemma(newLemma);
                if (newText !== "")  entity.text(newText);
                array.push(entity);
            }
            
            this.notifyListeners("notifyEntityUpdate", array, null);
        });
        
        $("#delete").click(()=>{
            let array = [];

            for (let entity of this.collection){
                entity.$.detach();
                array.push(entity);
            }
            
            this.notifyListeners("notifyUntaggedEntities", array, null);
        });
    }
    
    drop(event, data){
        if (data instanceof Entity === false) return;
        this.$.append(data.$);
        this.collection.add(data);
        $("#tagInput").val(data.tag());
        $("#lemmaInput").val(data.lemma());
        $("#textInput").val(data.text());
    }
}

class Main extends AbstractModel{
    constructor() {      
        super();
        this.dropContainer = new DropContainer();
        this.entityContainer = new EntityContainer(this.dropContainer.collection);
        this.entityController = new EntityController(this.entityContainer, this.dropContainer);
                
        this.lemmaDialogWidget = new LemmaDialogWidget("#lemma_container_target");
        this.lemmaDialogWidget.addCategory(["PERSON", "PLACE", "ORGANIZATION", "TITLE"]);
        this.lemmaDialogController = new LemmaDialogController(this.lemmaDialogWidget);        
        
        this.lemmaDialogWidget.addListener(this.entityController);
        
        this.addListener(this.lemmaDialogController);
        this.dropContainer.addListener(this.lemmaDialogController);
        
        $("#create").click(()=>{
            let tag = $("#tagInput").val();
            let lemma = $("#lemmaInput").val();            
            let text = $("#textInput").val(); 
            let entity = new Entity($(`<div class="entity"><div class="tag">${tag}</div><div title="${lemma}">${text}</div></div>`), this);
            this.entityContainer.$.append(entity.$);
        });        
        
        this.setupContent();
    }
    
    setupContent(){
        $("#content_container").children().each((i, e)=>{
            let entity = new Entity(e, this);            
        });
    }
}

$(window).on('load', async function () {
    console.log("LOAD MAIN");
    window.main = new Main();
});