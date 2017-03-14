/* a singleton wrapper class for cD.js */
/* global cD, Utility, trace */

class Dialogs {
    constructor(controller, events) {
        Dialogs.traceLevel = 0;
        Utility.log(Dialogs, "constructor");
        Utility.enforceTypes(arguments, Controller, [Events, "optional"]);

        cD.setCwrcApi("http://" + Dialogs.getHost() + "/islandora/cwrc_entities/v1/");
        cD.setRepositoryBaseObjectURL('http://cwrc-dev-01.srv.ualberta.ca/islandora/object/');

        cD.setPersonSchema("http://cwrc.ca/schemas/entities.rng");
        cD.setOrganizationSchema("http://cwrc.ca/schemas/entities.rng");
        cD.setPlaceSchema("http://cwrc.ca/schemas/entities.rng");

        cD.setGeonameUrl("http://" + Dialogs.getHost() + "/cwrc-mtp/geonames/");
        cD.setViafUrl("http://" + Dialogs.getHost() + "/services/viaf/");
        cD.setGoogleGeocodeUrl("http://maps.googleapis.com/maps/api/geocode/xml");

        this.opts = {
            success: function (result, event) {
                this.setLemma(result.name);
                this.setLink(result.uri);
                this.view.setLemma(result.name);
                this.view.setLink(result.uri);
                this.pollDictionaryUpdate(0);
            }.bind(controller),
            error: function (errorThrown) {
                console.log("error");
                console.log(errorThrown);
            }.bind(this),
            query: this.currentEntity
        };
    }

    setQueryTerm(queryTerm) {
        Utility.log(Dialogs, "setQueryTerm");
        Utility.enforceTypes(arguments, String);

        this.opts.query = queryTerm;
    }

    showDialog(dialog) {
        Utility.log(Dialogs, "showDialog");
        Utility.enforceTypes(arguments, String);

        switch (dialog) {
            case "PERSON":
                this.opts.buttons = [
                    {
                        label: "Create",
                        isEdit: false,
                        action: cD.popCreatePerson
                    }
                ];
                cD.popSearchPerson(this.opts);
                break;
            case "ORGANIZATION":
                this.opts.buttons = [
                    {
                        label: "Create",
                        isEdit: false,
                        action: cD.popCreateOrganization
                    }
                ];
                cD.popSearchOrganization(this.opts);
                break;
            case "TITLE":
                this.opts.buttons = [
                    {
                        label: "Create",
                        isEdit: false,
                        action: cD.popCreateTitle
                    }
                ];
                cD.popSearchTitle(this.opts);
                break;
            case "PLACE":
                this.opts.buttons = [
                    {
                        label: "Create",
                        isEdit: false,
                        action: cD.popCreatePlace
                    }
                ];
                cD.popSearchPlace(this.opts);
                break;
        }
    }
}

Dialogs.getHost = function(){
    return location.host;
};