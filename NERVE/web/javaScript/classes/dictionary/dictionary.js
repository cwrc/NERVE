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

    /* for testing, not part of test suite */
    clearDebugDictionary(callback) {
        Utility.log(Dictionary, "clearDebugDictionary");
        Utility.enforceTypes(arguments, Function);

        var xhttp = new XMLHttpRequest();
        var url = this.clearDebugURL;

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    callback();
                } else {
                }
            }
        }.bind(this);

        xhttp.open("POST", url, true);
        xhttp.send(JSON.stringify(this.context));
    }
    __getServerName() {
        Utility.log(Dictionary, "__getServerName");
        Utility.enforceTypes(arguments);

        return this.server;
    }
    deleteEntity(entity, dictionary, successCB = function() {}, failureCB = function(){}) {
        Utility.log(Dictionary, "deleteEntity");
        Utility.enforceTypes(arguments, String, String, ["optional", Function], ["optional", Function]);

        var xhttp = new XMLHttpRequest();
        var url = this.deleteEntityURL + "?entity=" + entity + "&dictionary=" + dictionary;

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
    matchEntity(entity, successCB = function() {}, failureCB = function(){}) {
        Utility.log(Dictionary, "matchEntity");
        Utility.enforceTypes(arguments, TaggedEntity, Object);

        this.matches(entity.getEntity(), entity.getLemma(), entity.getLink(), entity.getTagName(), entity.getDictionary(), successCB, failureCB);
    }
    matches(entity, lemma, link, tagName, dictionary, successCB = function() {}, failureCB = function(){}) {
        Utility.log(Dictionary, "matches");
        Utility.enforceTypes(arguments, String, String, String, String, String, ["optional", Function], ["optional", Function]);

        this.getEntities( entity, dictionary, (jsonText) => {
            Utility.assertType(jsonText, String);
            let json = JSON.parse(jsonText);

            /* check for sql error */
            /* TODO catch the exception properly */
            if (json.__servletLog.result === "exception" || json.__servletLog.result === "failure"){
                console.log(jsonText);
                failureCB();
                return;
            }

            if (json.rows.length === 0) {
                successCB(Dictionary.matchResult.EMPTY);
                return;
            }
            let row = json.rows[0];

            if (row.link !== link) {
                Utility.trace(Dictionary, 3, "NON MATCH LINK");
                successCB(Dictionary.matchResult.EXISTS);
            } else if (row.lemma !== lemma) {
                Utility.trace(Dictionary, 3, "NON MATCH LEMMA");
                successCB(Dictionary.matchResult.EXISTS);
            } else if (this.context.getTagInfo(row.tag).name !== tagName) {
                Utility.trace(Dictionary, 3, "NON MATCH TAGNAME");
                successCB(Dictionary.matchResult.EXISTS);
            } else {
                Utility.trace(Dictionary, 3, "ALL MATCHED");
                successCB(Dictionary.matchResult.MATCH);
            }
        }, failureCB());
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
        Utility.enforceTypes(arguments, TaggedEntity, ["optional", Function], ["optional", Function]);

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

Dictionary.matchResult = {
    EXISTS: "EXISTS",
    EMPTY: "EMPTY",
    MATCH: "MATCH"
};