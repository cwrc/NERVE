/**
 * Request a web service using post with json input.  Returns a json object
 * with the service results.
 * @param {type} url
 * @param {type} json
 * @returns {Promise}
 */

"use strict";
module.exports = function postJSON(url, json) {
    let callback = function (resolve, reject) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    resolve(JSON.parse(xhttp.responseText));
                } else {
                    reject(JSON.parse(xhttp.responseText));
                }
            }
        };

        xhttp.open("POST", url, true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");        
        xhttp.send(json);
    };

    return new Promise(callback);
};