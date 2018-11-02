const jQuery = require("jquery");
const $ = jQuery;
const Widget = require("@thaerious/nidget").Widget;
const MenuItem = require("./MenuItem");

class MenuCategory extends Widget{
    constructor(text, delegate, jsonObject){
        super(`<div class='menu_category'></div>`, delegate);
        this.title = $(`<div class='menu_title'>${text}</div>`);
        this.container = $(`<div class='menu_container'></div>`);
        this.menuItemMap = new Map();
        
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
        this.menuItemMap.set(text, menuItem);
        return menuItem;
    }
    
    getMenuItem(text){
        return this.menuItemMap.get(text);
    }
}

module.exports = MenuCategory;