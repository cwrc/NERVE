/* global Utility, Dictionary */

class ContextWrapper extends HasContext {
    constructor(jsonObject) {
        super();
        this.context = new Context(jsonObject);
    }
}

class DictionaryTests extends Tests {

    constructor() {
        super();
        this.name = "dictionary";
        let jsonObject = JSON.parse(DictionaryTests.debugContextJSONString);
        this.context = new ContextWrapper(jsonObject);
    }

    testConstructor00() {
        new Dictionary(this.context);
        this.passTest();
    }

    testAddEntity00(asTest = true, callback = function() {}) {
        var taggedEntity = new UnboundTaggedEntity()
                .setDictionary("debug")
                .setEntity("shakespeare")
                .setTagname("PER");

        let dictionary = new Dictionary(this.context);

        dictionary.clearDebugDictionary(() => {
            dictionary.addEntity(
            taggedEntity,
            (text) => {
                if (asTest) this.passTest();
                else callback(dictionary, taggedEntity);
            },
            () => {
                this.failTest();
            });
        });
    }

    testDeleteEntity00() {
        this.testAddEntity00(false, (dictionary) => {
            dictionary.deleteEntity("shakespeare", "debug", () => this.passTest());
        });
    }

    testMatches00() {
        this.testAddEntity00(false, (dictionary) => {
            dictionary.matches("shakespeare", "", "", "PER", "debug", (result)=>{
                this.assertEquals(result, Dictionary.matchResult.MATCH);
                this.passTest();
            });
        });
    }

    testMatches01() {
        this.testAddEntity00(false, (dictionary) => {
            dictionary.matches("shakespeare", "", "", "X", "debug", (result) => {
                this.assertEquals(result, Dictionary.matchResult.EXISTS);
                this.passTest();
            });
        });
    }

    testMatches02() {
        this.testAddEntity00(false, (dictionary) => {
            dictionary.matches("x", "", "", "PER", "debug", (result) => {
                this.assertEquals(result, Dictionary.matchResult.EMPTY);
                this.passTest();
            });
        });
    }

    testMatchEntity00() {
        this.testAddEntity00(false, (dictionary, entity) => {
            dictionary.matchEntity(entity, (result) => {
                this.assertEquals(result, Dictionary.matchResult.MATCH);
                this.passTest();
            });
        });
    }
}

/* --------------- Below here be fake documents --------------- */
DictionaryTests.bareDocument = 'first bit <div id="item1">shakespeare</div> third bit';

DictionaryTests.debugContextJSONString = '{\
    "name": "Debug",\
    "linkAttribute": "LINK",\
    "idAttribute": "ID",\
    "lemmaAttribute": "LEMMA",\
    "writeToDictionary": "debug",\
    "dictionaryAttribute": "data-dictionary",\
    "readFromDictionary": [\
        "debug"\
    ],\
    "tags": [\
        {\
            "name": "ORG",\
            "dictionary": "ORGANIZATION",\
            "nerMap": "ORGANIZATION",\
            "dialog": "ORGANIZATION"\
        },\
        {\
            "name": "LOC",\
            "dictionary": "PLACE",\
            "nerMap": "LOCATION",\
            "dialog": "PLACE"\
        },\
        {\
            "name": "PER",\
            "dictionary": "PERSON",\
            "nerMap": "PERSON",\
            "dialog": "PERSON"\
        },\
        {\
            "name": "TTL",\
            "dictionary": "TITLE",\
            "lemmaAttribute": "REG",\
            "dialog": "TITLE"\
        }\
    ],\
    "htmlLabels": {\
        "tagged": "tagged",\
        "tagName": "tagName",\
        "lemma": "lemma",\
        "entity": "entity",\
        "taglink": "taglink"\
    },\
    "tagNameRules": {\
        "prefix": "nervep",\
        "attribute": "nervea"\
    },\
    "styles": [\
        "generic.css"\
    ],\
    "schema": ""\
}';