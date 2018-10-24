window.$ = require("jquery");
window.jQuery = require("jquery");
window.bootstrap = require("bootstrap");
const CWRCDialogs = require("./cwrcdialogs/CWRCDialogs");

$(window).on('load', async function () {
    window.cwrcDialogs = new CWRCDialogs();
    await window.cwrcDialogs.load();
    
    await window.cwrcDialogs.registerEntitySource(require('./cwrcdialogs/viaf'));
    await window.cwrcDialogs.registerEntitySource(require('./cwrcdialogs/dbpedia'));
    await window.cwrcDialogs.registerEntitySource(require('./cwrcdialogs/wiki'));
    await window.cwrcDialogs.registerEntitySource(require('./cwrcdialogs/getty'));
    await window.cwrcDialogs.registerEntitySource(require('./cwrcdialogs/geonames'));
    
    window.cwrcDialogs.show();
    cwrcDialogs.search("Steve", "findTitle");
});