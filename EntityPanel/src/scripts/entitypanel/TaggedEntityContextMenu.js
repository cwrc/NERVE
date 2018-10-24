const NidgetContext = require("NidgetContext");
const ShowHTMLWidget = require("./ShowHTMLWidget");
const EntityValues = require("nerveserver").EntityValues;

class TaggedEntityContextMenu extends NidgetContext{
    constructor(entityPanelWidget){
        super(entityPanelWidget);
        this.ready = false;

        this.addMenuItem("- Location", (event)=>{
            this.selected.values(new EntityValues().tag("LOCATION"));            
        });
        
        this.addMenuItem("- Organization", (event)=>{
            this.selected.values(new EntityValues().tag("ORGANIZATION"));            
        });        
        
        this.addMenuItem("- Person", (event)=>{
            this.selected.values(new EntityValues().tag("PERSON"));            
        });        

        this.addMenuItem("- Title", (event)=>{
            this.selected.values(new EntityValues().tag("TITLE"));            
        });        

        this.addMenuItem("Untag", (event)=>{
            this.notifyListeners("onMenuRemoveTag", this.selected);
        });

        this.addMenuItem("Edit", (event)=>{
            this.notifyListeners("notifyEditEntities", this.selected);
        });
        
        this.addMenuItem("Examine HTML", (event)=>{
            let lastSelected = this.selected.getLast();
            this.showHTMLWidget.show(lastSelected);
        });        

        this.addMenuItem("Lookup Entity", (event)=>{
            this.notifyListeners("notifyLookupEntities", this.selected);
        });   

        $(document).click(e=>this.hide());
    }
     
    async makeReady(){
        this.showHTMLWidget = new ShowHTMLWidget();
        await this.showHTMLWidget.load();
        window.showHTMLWidget = this.showHTMLWidget;        
        this.ready = true;
    }
   
    show(event, taggedEntityCollection){
        if (!this.ready) throw new Error("TaggedEntiyFactory not ready");
        super.show(event);
        this.selected = taggedEntityCollection;        
    }
    
    setDictionary(dictionary){
        this.dictionary = dictionary;
    }
}

module.exports = TaggedEntityContextMenu;