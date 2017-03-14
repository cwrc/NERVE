/* -------------------------------------------------------------------------- */
/* This class serves as a link between the client side api and the backend    */
/* servlets that wraps the sql dictionary                                     */
/* __getServerName is found under fileoperations.js                             */
/* -------------------------------------------------------------------------- */
/* global Utility, trace                                                      */

class Dictionary {
    constructor(hasContext) {
        Dictionary.traceLevel = 0;
        Utility.log(Dictionary, "constructor");
        Utility.enforceTypes(arguments, HasContext);

        this.context = hasContext.getContext();

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

        this.__getEntitiesURL = this.__getServerName() + "/GetEntities.do";
        this.addEntityURL = this.__getServerName() + "/AddEntity.do";
        this.deleteEntityURL = this.__getServerName() + "/DeleteEntity.do";
        this.clearDebugURL = this.__getServerName() + "/ClearDebug.do";
    }
    __getContext() {
        Utility.log(Dictionary, "__getContext");
        Utility.enforceTypes(arguments);
        return Utility.assertType(this.context, Context);
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
        xhttp.send(JSON.stringify(this.__getContext()));
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
        xhttp.send(JSON.stringify(this.__getContext()));
    }
    matchEntity(entity, successCB = function() {}, failureCB = function(){}) {
        Utility.log(Dictionary, "matchEntity");
        Utility.enforceTypes(arguments, TaggedEntity, Object);

        this.matches(entity.getEntity(), entity.getLemma(), entity.getLink(), entity.getTagName(), entity.getDictionary(), successCB, failureCB);
    }
    matches(entity, lemma, link, tagName, dictionary, successCB = function() {}, failureCB = function(){}) {
        Utility.log(Dictionary, "matches");
        Utility.enforceTypes(arguments, String, String, String, String, String, ["optional", Function], ["optional", Function]);

        this.__getEntities(
                entity,
                dictionary,
                (jsonText) => {

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
            } else if (this.__getContext().getTagInfo(row.tag).name !== tagName) {
                Utility.trace(Dictionary, 3, "NON MATCH TAGNAME");
                successCB(Dictionary.matchResult.EXISTS);
            } else {
                Utility.trace(Dictionary, 3, "ALL MATCHED");
                successCB(Dictionary.matchResult.MATCH);
            }
        }, failureCB());
    }
    __getEntities(entity, dictionary, successCB = function() {}, failureCB = function(){}) {
        Utility.log(Dictionary, "__getEntities");
        Utility.enforceTypes(arguments, String, String, ["optional", Function], ["optional", Function]);

        var xhttp = new XMLHttpRequest();
        var url = this.__getEntitiesURL + "?entity=" + entity + "&dictionary=" + dictionary;

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
        xhttp.send(JSON.stringify(this.__getContext()));
    }

    populateTaggedEntity(taggedEntity, successCB = function() {}, failureCB = function(){}){
        Utility.log(Dictionary, "populateTaggedEntity");
        Utility.enforceTypes(arguments, TaggedEntity, ["optional", Function], ["optional", Function]);

        this.__getEntities(
                taggedEntity.getEntity(),
                taggedEntity.getDictionary(),
                (jsonText) => {
            Utility.assertType(jsonText, String);

            let json = JSON.parse(jsonText);
            if (json.rows.length === 0) {
                successCB(taggedEntity);
                return;
            }
            let row = json.rows[0];

            taggedEntity.setLink(row.link);
            taggedEntity.setLemma(row.lemma);
            taggedEntity.setTagName(this.__getContext().getTagInfo(row.tag).name);
            successCB(taggedEntity);
        }, failureCB());
    }

    addEntity(entity, successCB = function() {}, failureCB = function(){}) {
        Utility.log(Dictionary, "addEntity");
        Utility.enforceTypes(arguments, TaggedEntity, ["optional", Function], ["optional", Function]);

        var xhttp = new XMLHttpRequest();
        var url = this.addEntityURL + "?";
        url += "entity=" + encodeURIComponent(entity.getEntity());
        url += "&lemma=" + encodeURIComponent(entity.getLemma());
        url += "&link=" + encodeURIComponent(entity.getLink());
        url += "&tag=" + encodeURIComponent(entity.getTagName());
        url += "&collection=" + encodeURIComponent(entity.getDictionary());

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
        xhttp.send(JSON.stringify(this.__getContext()));
    }
}

Dictionary.matchResult = {
    EXISTS: "EXISTS",
    EMPTY: "EMPTY",
    MATCH: "MATCH"
};