const NidgetContext = require("@thaerious/nidgetcontext");
const ShowHTMLWidget = require("./ShowHTMLWidget");
const EntityValues = require("nerveserver").EntityValues;

class EntityPanelContextMenu extends NidgetContext{
    constructor(entityPanelWidget){
        super(entityPanelWidget);
        this.ready = false;

        this.menuItemLoc = this.addMenuItem("Tag Location", (event)=>{
            this.notifyListeners("onMenuTag", "LOCATION");
        });
        
        this.menuItemOrg = this.addMenuItem("Tag Organization", (event)=>{
            this.notifyListeners("onMenuTag", "ORGANIZATION");
        });        
        
        this.menuItemPer = this.addMenuItem("Tag Person", (event)=>{
            this.notifyListeners("onMenuTag", "PERSON");
        });        

        this.menuItemTit = this.addMenuItem("Tag Title", (event)=>{
            this.notifyListeners("onMenuTag", "TITLE");
        });        

        $(document).click(e=>this.hide());
    }
    
    show(event){
        super.show(event);        
        this.menuItemLoc.enable();
        this.menuItemOrg.enable();
        this.menuItemPer.enable();
        this.menuItemTit.enable();        
    }
    
    showDisabled(event){
        super.show(event);
        this.menuItemLoc.disable();
        this.menuItemOrg.disable();
        this.menuItemPer.disable();
        this.menuItemTit.disable();
    }
}

module.exports = EntityPanelContextMenu;