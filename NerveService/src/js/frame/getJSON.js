"use strict";
/**
 * Retrieve a JSON file and return it as a JS object.
 * @param {type} url
 * @param {type} json
 * @returns {Promise}
 */

const rootPath = require("./constants").rootPath;

module.exports = function getXML(filename) {
    let callback = function (resolve, reject) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    resolve(JSON.parse(xhttp.responseText));
                } else {
                    reject(null);
                }
            }
        };

        xhttp.open("POST", rootPath + filename, true);
        xhttp.setRequestHeader("Content-Type", "application/xml;charset=UTF-8");        
        xhttp.send();
    };

    return new Promise(callback);
};