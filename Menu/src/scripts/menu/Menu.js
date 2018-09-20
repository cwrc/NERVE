const jQuery = require("jquery");
const $ = jQuery;
const Widget = require("nidget").Widget;
const MenuCategory = require("./MenuCategory");
const FileOpertions = require("Utility").FileOperations;

class Menu extends Widget{
    constructor(delegate){
        super("<div class='menu_root'></div>", delegate);
    }
    
    loadJSON(jsonObject){
        for (let category in jsonObject){
            this.addCategory(category, jsonObject[category]);
        }
        return this;
    }
    
    addCategory(text, jsonObject){
        let menuCategory = new MenuCategory(text, this, jsonObject);
        this.append(menuCategory);
        return menuCategory;
    }
    
    appendTo(target){
        $(target).append(this.$);
    }
}

module.exports = Menu;