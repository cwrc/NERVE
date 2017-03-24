/* global Utility */

class FileOperations {
    constructor() {
        Utility.log(FileOperations, "constructor");
        Utility.enforceTypes(arguments);

        this.server = "";

        if (location.host === "cwrc-dev-06.srv.ualberta.ca") {
            this.server = location.host + "/tools/nerve";
        } else if (location.host === "http://beta.cwrc.ca/") {
            this.server = location.host + "/tools/nerve";
        } else {
            this.server = location.host + "/nerve";
        }
    }
    getServerName() {
        Utility.log(FileOperations, "getServerName");
        Utility.enforceTypes(arguments);
        return this.server;
    }
    /*
     * Send conetents of 'filename' from server to client.
     * @param {String} filename
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @returns {undefined}
     */
    loadFromServer(filename, successCallback = function() {}, errorCallback = function(){}) {
        Utility.log(FileOperations, "loadFromServer");
        Utility.enforceTypes(arguments, String, ["optional", Function], ["optional", Function]);

        var xhttp = new XMLHttpRequest();
        var data = {};
        var url = "http://" + this.getServerName() + "/" + filename;

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    successCallback(xhttp.responseText);
                } else {
                    errorCallback(xhttp.status, xhttp.responseText);
                }
            }
        };

        xhttp.open("POST", url, true);
        xhttp.send(JSON.stringify(data));
    }
    /**
     * User selects a file, it's contents and filename are sent to 'callback'.
     * @param callback function(contents, filename) called when a file is selected.
     * @returns {undefined}
     */
    loadFromFile(callback) {
        Utility.log(FileOperations, "loadFromFile");
        Utility.enforceTypes(arguments, ["optional", Function]);

        var fileSelector = document.createElement("input");
        fileSelector.type = "file";
        fileSelector.click();

        fileSelector.onchange = function (event) {
            Utility.trace(FileOperations, 3, "loadFromFile():fileSelector.onchange()");
            event.preventDefault();
            var file = fileSelector.files[0];

            var reader = new FileReader();
            reader.onload = function (event) {
                Utility.trace(FileOperations, 3, "loadFromFile():reader.onload()");
                callback(event.target.result, file.name);
            }.bind(this);

            reader.readAsText(file);
        }.bind(this);
    }

    decode(input, context, successCallback = function() {}, errorCallback = function(){}) {
        Utility.log(FileOperations, "decode");
        Utility.enforceTypes(arguments, String, Context, ["optional", Function], ["optional", Function]);

        var xhttp = new XMLHttpRequest();
        var data = {};
        data.context = JSON.stringify(context.dataObject);
        data.input = input;

        var url = "http://" + this.getServerName() + "/Decode.do?";
//        url += this.getAttributes("settings-decoder") + "DECODE_PROCESS";

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200 || xhttp.status === 520) {
                    var json = JSON.parse(xhttp.responseText);
                    if (json.__servletLog.result === "success") {
                        if (json.result === "processed") {
                            successCallback(json.output); /* TODO succes and failures should wrap the result in an object so it can be type checked*/
                        }
                    } else {
                        if (Utility.exists(errorCallback))
                            errorCallback(xhttp.status, xhttp.responseText);
                    }
                }
            }
        };

        xhttp.open("POST", url, true);
        xhttp.send(JSON.stringify(data));
    }
    /**
     * Cause 'text' to be saved as 'filename' client side.
     * @param {type} filename The default filename to save the text as.
     * @param {type} text The text to save to filename.
     * @returns {undefined}
     */
    saveToFile(text, filename) {
        Utility.log(FileOperations, "saveToFile");
        Utility.enforceTypes(arguments, String, String);

        if (filename === undefined) {
            if (localStorage.filename === undefined) {
                filename = "nerve.txt";
            } else {
                filename = localStorage.filename;
            }
        }

        var anchor = document.createElement('a');
        var data = "text;charset=utf-8," + encodeURIComponent(text);
        anchor.setAttribute("href", "data:" + data);
        anchor.setAttribute("download", filename);
        anchor.click();
    }
    encode(input, context, successCallback = function() {}, errorCallback = function(){}) {
        Utility.log(FileOperations, "encode");
        Utility.enforceTypes(arguments, String, Context, ["optional", Function], ["optional", Function]);

        var xhttp = new XMLHttpRequest();
        var data = {};

        /* TODO change encode to accept a proper json stringified object instead of string in string */
        data.context = JSON.stringify(context.dataObject);
        data.input = input;

        var url = "http://" + this.getServerName() + "/Encode.do?";
//        url += this.getAttributes("settings-encoder") + "ENCODE_PROCESS";

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200 || xhttp.status === 520) {
                    var json = JSON.parse(xhttp.responseText);
                    if (json.__servletLog.result === "success") {
                        if (json.result === "processed") {
                            successCallback(json.output);
                        }
                    } else {
                        if (Utility.exists(errorCallback)) errorCallback(xhttp.status, xhttp.responseText);
                    }
                }
            }
        };

        xhttp.open("POST", url, true);
        xhttp.send(JSON.stringify(data));
    }
//    getAttributes(category) {
//        Utility.log(FileOperations, "getAttributes");
//        Utility.enforceTypes(arguments, String);
//
//        var rvalue = "";
//
//        for (var setting in this.settings.getCategory(category)) {
//            var value = this.settings.getValue(category, setting);
//            if (value === true) {
//                rvalue = rvalue + setting + "&";
//            }
//        }
//
//        return rvalue;
//    }
}