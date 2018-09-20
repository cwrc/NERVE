const jQuery = require("jquery");
const $ = jQuery;
const Widget = require("nidget").Widget;
const MenuItem = require("./MenuItem");

class MenuCategory extends Widget{
    constructor(text, delegate, jsonObject){
        super(`<div class='menu_category'></div>`, delegate);
        this.title = $(`<div class='menu_title'>${text}</div>`);
        this.container = $(`<div class='menu_container'></div>`);
        
        this.$.append(this.title);
        this.$.append(this.container);
        
        if (jsonObject !== undefined){
            for (let item in jsonObject){
                this.addItem(item, jsonObject[item]);
            }
        }
    }
    
    addItem(text, jsonObject){
        let menuItem = new MenuItem(text, this, jsonObject);
        this.container.append(menuItem.$);
        return menuItem;
    }
}

module.exports = MenuCategory;