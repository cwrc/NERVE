window.$ = require("jquery");
const AbstractModel = require("nidget").AbstractModel;
const DragWidget = require("nidget").DragWidget;
const DropWidget = require("nidget").DropWidget;
const LemmaDialogWidget = require("./lemmaDialog").LemmaDialogWidget;
const LemmaDialogController = require("./lemmaDialog").LemmaDialogController;
const Collection = require("Collection");

class Entity extends DragWidget{
    constructor(element, delegate){
        super(element, delegate);
        this.tagValue = this.$.find(".tag").text();
        this.lemmaValue = this.$.find("[title]").attr("title");
        this.notifyListeners("notifyNewTaggedEntities", [this]);        
        this.$.click(()=>this.notifyListeners("notifyTaggedEntityClick", this));
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

class EntityContainer extends DropWidget{
    constructor(collection){
        super("#content_container");
        this.collection = collection;
    }
    
    drop(event, data){
        if (data instanceof Entity == false) return;
        this.$.append(data.$);
        this.collection.remove(data);
    }
}

class DropContainer extends DropWidget{
    constructor(){
        super("#collection_container");
        this.collection = new Collection(this);
        
        $("#update").click(()=>{
            let array = [];
            let newTag = $("#tagInput").val();
            let newLemma = $("#lemmaInput").val();
            
            console.log(`${newTag} ${newLemma}`);
            
            for (let entity of this.collection){
                entity.tag(newTag);
                entity.lemma(newLemma);
                array.push(entity);
            }
            
            this.notifyListeners("notifyEntityUpdate", array, null);
        });
    }
    
    drop(event, data){
        if (data instanceof Entity == false) return;
        this.$.append(data.$);
        this.collection.add(data);
        $("#tagInput").val(data.tag());
        $("#lemmaInput").val(data.lemma());
    }
}

class Main extends AbstractModel{
    constructor() {      
        super();
        this.dropContainer = new DropContainer();
        this.entityContainer = new EntityContainer(this.dropContainer.collection);
        
        this.lemmaDialogWidget = new LemmaDialogWidget("#lemma_container_target");
        this.lemmaDialogWidget.addCategory(["PERSON", "PLACE", "ORGANIZATION", "TITLE"]);
        this.lemmaDialogController = new LemmaDialogController(this.lemmaDialogWidget);        
        
        this.addListener(this.lemmaDialogController);
        this.dropContainer.addListener(this.lemmaDialogController);
        
        this.setupContent();
    }
    
    setupContent(){
        $("#content_container").children().each((i, e)=>{
            let entity = new Entity(e, this);
            
        });
    }
}

window.main = new Main();