const jQuery = require("jquery");
const $ = jQuery;
const Menu = require("./menu/Menu");
const FileOperations = require("Utility").FileOperations;

$(window).on('load', async function () {
    window.menu = new Menu();
    menu.$.appendTo("#target");
    
//    try{        
        let menuJSON = await FileOperations.getURL("assets/menu.json");
        console.log(menuJSON);
        menu.loadJSON(JSON.parse(menuJSON));
//    } catch (err){
//        window.alert("Get File Error: " + err.url);
//    }    

    menu.addListener({
        onMenuOpen: function(){console.log("menu open");}
    });

});
