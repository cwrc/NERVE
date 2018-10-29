const AbstractModel = require("@thaerious/nidget").AbstractModel;
const EntityValues = require("nerscriber").EntityValues;

/**
 * Events: notifyCWRCSelection, notifyCWRCCancelled
 **/
class CWRCDialogModel extends AbstractModel {
    constructor() {
        super();

        this.dialogs = require('cwrc-public-entity-dialogs');
        let viaf = require('viaf-entity-lookup');
        let wikidata = require('wikidata-entity-lookup');
        let getty = require('getty-entity-lookup');
        let dbpedia = require('dbpedia-entity-lookup');
        let geonames = require('geonames-entity-lookup');

        console.log(`this.dialogs.registerEntitySources`);
        this.dialogs.registerEntitySources({
            people: (new Map()).set('viaf', viaf).set('wikidata', wikidata).set('getty', getty).set('dbpedia', dbpedia),
            places: (new Map()).set('viaf', viaf).set('geonames', geonames).set('dbpedia', viaf).set('wikidata', wikidata).set('geocode', viaf).set('dbpedia', dbpedia),
            organizations: (new Map()).set('viaf', viaf).set('dbpedia', viaf).set('wikidata', wikidata).set('dbpedia', dbpedia),
            titles: (new Map()).set('viaf', viaf).set('dbpedia', viaf).set('wikidata', wikidata).set('dbpedia', dbpedia)
        });

        console.log(this.dialogs.entitySources);

        this.queryOptions = {
            query: 'jones',
            success: (result) => console.log(result),
            cancelled: () => console.log('cancelled')
        };
    }

    notifyLoookupEntity(values) {
        this.query(values);
    }

    notifyLoookupLemma(values) {
        this.query(values);
    }

    query(entityValues) {
        let dialogMethod = "popSearchPerson";
        
        if (entityValues){
            switch (entityValues.tag()) {
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
        }

        let searchTerm = entityValues ? entityValues.text() : "john doe";
        let tag = entityValues ? entityValues.tag() : "PERSON";
        console.log(dialogMethod, searchTerm);
        

        this.dialogs[dialogMethod]({
            query: searchTerm,
            success: (result) => {
                console.log(result);
                let values = new EntityValues(searchTerm, result.name, result.uri, tag, "");
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