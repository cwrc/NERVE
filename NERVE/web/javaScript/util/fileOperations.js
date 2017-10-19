/* global Utility */
class FileOperations {
    static getServerName() {
        let server = "";

        if (location.host === "cwrc-dev-06.srv.ualberta.ca") {
            server = location.host + "/tools/nerve";
        } else if (location.host === "http://beta.cwrc.ca/") {
            server = location.host + "/tools/nerve";
        } else {
            server = location.host + "/nerve";
        }
        return server;
    }

    /*
     * Send contents of 'filename' from server to client.
     * @param {String} filename
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @returns {undefined}
     */
    static loadFromRemote(url) {
        let callback = function (resolve, reject) {
            var xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function () {
                if (xhttp.readyState === 4) {
                    if (xhttp.status === 200) {
                        resolve(xhttp.responseText);
                    } else {
                        reject(xhttp.status, xhttp.responseText);
                    }
                }
            };

            xhttp.open("POST", url, true);
            xhttp.send(null);
        };

        return new Promise(callback);
    }

    /*
     * Send contents of 'filename' from server to client.
     * @param {String} filename
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @returns {undefined}
     */
    static loadFromServer(filename) {
        let callback = function (resolve, reject) {
            var xhttp = new XMLHttpRequest();
            var data = {};
            var url = "http://" + FileOperations.getServerName() + "/" + filename;

            xhttp.onreadystatechange = function () {
                if (xhttp.readyState === 4) {
                    if (xhttp.status === 200) {
                        resolve(xhttp.responseText);
                    } else {
                        reject(xhttp.status, xhttp.responseText);
                    }
                }
            };

            xhttp.open("POST", url, true);
            xhttp.send(JSON.stringify(data));
        };

        return new Promise(callback);
    }
    /**
     * User selects a file, it's contents and filename are sent to 'callback'.
     * @returns {undefined}
     */
//    static loadFromFile() {
//        var filename = "";
//        var reader = new FileReader();
//        var fileSelector = document.createElement("input");
//        fileSelector.type = "file";
//        fileSelector.click();
//
//        fileSelector.onchange = function (event) {
//            event.preventDefault();
//            filename = fileSelector.files[0].name;
//            reader.readAsText(fileSelector.files[0]);
//        };
//
//        let callback = function (resolve, reject) {
//            reader.onload = function (event) {
//                resolve({
//                    text : event.target.result,
//                    filename : filename
//                });
//            };
//        };
//
//        return new Promise(callback);
//    }

    /**
     * Cause 'text' to be saved as 'filename' client side.
     * @param {type} filename The default filename to save the text as.
     * @param {type} text The text to save to filename.
     * @returns {undefined}
     */
    static saveToFile(text, filename) {
        let anchor = document.createElement('a');
        let data = "text;charset=utf-8," + encodeURIComponent(text);
        anchor.setAttribute("href", "data:" + data);
        anchor.setAttribute("download", filename);
        anchor.click();
    }
}