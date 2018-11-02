const $ = window.$ ? window.$ : require("jquery");
const Widget = require("@thaerious/nidget").Widget;
const MenuCategory = require("./MenuCategory");
const FileOpertions = require("@thaerious/utility").FileOperations;

class Menu extends Widget{
    constructor(delegate){
        super("<div class='menu_root'></div>", delegate);
        this.categoryMap = new Map();
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
        this.categoryMap.set(text, menuCategory);
        return menuCategory;
    }
    
    appendTo(target){
        $(target).append(this.getElement());
    }
    
    getCategory(categoryText){
        return this.categoryMap.get(categoryText);
    }
    
    getMenuItem(categoryText, itemText){
        let menuCategory = this.getCategory(categoryText);
        return menuCategory.getMenuItem(itemText);
    }
}

module.exports = Menu;