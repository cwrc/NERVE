const $ = window.$ ? window.$ : require("jquery");
const Throbber = require("./throbber/Throbber.js");


$(window).on('load', async function () {
    window.throbber = new Throbber();
    $("body").append(window.throbber.$);
    console.log(window.throbber);    
});
