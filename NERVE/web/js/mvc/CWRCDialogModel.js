const AbstractModel = require("Nidget/src/AbstractModel");
const EntityValues = require("../gen/EntityValues");

/**
 * Events: notifyCWRCSelection, notifyCWRCCancelled
 **/

const nerscriber = require("nerscriber");

class CWRCDialogModel extends AbstractModel {
    constructor() {
        super();

        this.dialogs = require('cwrc-public-entity-dialogs');
        let viaf = require('viaf-entity-lookup');
        let wikidata = require('wikidata-entity-lookup');
        let getty = require('getty-entity-lookup');
        let dbpedia = require('dbpedia-entity-lookup');
        let geonames = require('geonames-entity-lookup');

        this.dialogs.registerEntitySources({
            people: (new Map()).set('viaf', viaf).set('wikidata', wikidata).set('getty', getty).set('dbpedia', dbpedia),
            places: (new Map()).set('viaf', viaf).set('geonames', geonames).set('dbpedia', viaf).set('wikidata', wikidata).set('geocode', viaf).set('dbpedia', dbpedia),
            organizations: (new Map()).set('viaf', viaf).set('dbpedia', viaf).set('wikidata', wikidata).set('dbpedia', dbpedia),
            titles: (new Map()).set('viaf', viaf).set('dbpedia', viaf).set('wikidata', wikidata).set('dbpedia', dbpedia)
        });

        this.queryOptions = {
            query: 'jones',
            success: (result) => console.log(result),
            cancelled: () => console.log('cancelled')
        };
    }

    notifyLoookupEntity(values) {
        this.query(values.text(), values);
    }

    notifyLoookupLemma(values) {
        this.query(values.lemma(), values);
    }

    notifyContextChange(context) {
        this.context = context;
    }

    query(searchTerm, entityValue) {
        let tagInfo = this.context.getTagInfo(entityValue.tag());
        if (tagInfo.getDialogMethod() === "") return;

        let dialogMethod = "";
        switch (tagInfo.getStandard()) {
            case "LOCATION":
                dialogMethod = "popSearchPlace";
                break;
            case "PERSON":
                dialogMethod = "popSearchPerson";
                break;
            case "ORGANIZATION":
                dialogMethod = "popSearchOrganization";
                break;
            case "TITLE":
                dialogMethod = "popSearchTitle";
                break;
        }


        this.dialogs[dialogMethod]({
            query: searchTerm,
            success: (result) => {
                console.log(result);
                let values = new EntityValues(entityValue.text(), result.name, result.uri, entityValue.tag(), "");
                super.notifyListeners("notifyCWRCSelection", values);
            },
            cancelled: () => {
                super.notifyListeners("notifyCWRCCancelled");
            }
        });
    }

    queryPerson(term) {
        this.dialogs.popSearchPerson({
            query: term,
            success: (result) => {
                super.notifyListeners("notifyCWRCSelection", result);
            },
            cancelled: () => {
                super.notifyListeners("notifyCWRCCancelled");
            }
        });
    }
}

module.exports = CWRCDialogModel;