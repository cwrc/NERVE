/* -------------------------------------------------------------------------- */
/* This class serves as a link between the client side api and the backend    */
/* servlets that wraps the sql dictionary                                     */
/* __getServerName is found under fileoperations.js                             */
/* -------------------------------------------------------------------------- */
/* global Utility, trace                                                      */

class Dictionary {
    constructor() {
        Dictionary.traceLevel = 0;
        Utility.log(Dictionary, "constructor");
        Utility.enforceTypes(arguments);

        this.server = "";
        if (location.host === "131.104.49.115:8888") {
            this.server = "";
        } else if (location.host === "cwrc-dev-06.srv.ualberta.ca") {
            this.server = "/tools/nerve";
        } else if (location.host === "localhost:8080") {
            this.server = "http://localhost:8080/nerve";
        } else {
            this.server = "/nerve";
        }

        this.getEntitiesURL = this.server + "/GetEntities.do";
        this.addEntityURL = this.server + "/AddEntity.do";
        this.deleteEntityURL = this.server + "/DeleteEntity.do";
        this.clearDebugURL = this.server + "/ClearDebug.do";
    }

    setContext(context){
        Utility.log(Dictionary, "setContext");
        Utility.enforceTypes(arguments, Context);
        this.context = context;
    }

    removeEntity(entity, successCB = function() {}, failureCB = function(){}) {
        Utility.log(Dictionary, "removeEntity");
        Utility.enforceTypes(arguments, HTMLDivElement, ["optional", Function], ["optional", Function]);

        var xhttp = new XMLHttpRequest();
        var url = this.deleteEntityURL + "?entity=" + $(entity).text() + "&dictionary=custom";

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    successCB(xhttp.responseText);
                } else {
                    failureCB(xhttp.status, xhttp.responseText);
                }
            }
        }.bind(this);

        xhttp.open("POST", url, true);
        xhttp.send(JSON.stringify(this.context));
    }

    getEntities(entity, successCB = function() {}, failureCB = function(){}) {
        Utility.log(Dictionary, "getEntities");
        Utility.enforceTypes(arguments, HTMLDivElement, ["optional", Function], ["optional", Function]);

        var xhttp = new XMLHttpRequest();
        var url = this.getEntitiesURL + "?entity=" + $(entity).text();

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    let jsonObj = JSON.parse(xhttp.responseText);
                    successCB(jsonObj.rows);
                } else {
                    failureCB(xhttp.status, xhttp.responseText);
                }
            }
        }.bind(this);

        xhttp.open("POST", url, true);
        xhttp.send(JSON.stringify(this.context));
    }

    /* add new entity to the 'custom' dictionary */
    addEntity(entity, successCB = function() {}, failureCB = function(){}) {
        Utility.log(Dictionary, "addEntity");
        Utility.enforceTypes(arguments, HTMLDivElement, ["optional", Function], ["optional", Function]);

        var xhttp = new XMLHttpRequest();
        var url = this.addEntityURL + "?";
        url += "entity=" + encodeURIComponent($(entity).text());
        url += "&lemma=" + encodeURIComponent($(entity).lemma());
        url += "&link=" + encodeURIComponent($(entity).link());
        url += "&tag=" + encodeURIComponent($(entity).entityTag());
        url += "&collection=" + encodeURIComponent("custom");

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    successCB(xhttp.responseText);
                } else {
                    failureCB(xhttp.status, xhttp.responseText);
                }
            }
        }.bind(this);

        xhttp.open("POST", url, true);
        xhttp.send(JSON.stringify(this.context));
    }
}