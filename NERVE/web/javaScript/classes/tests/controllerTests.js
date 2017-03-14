/* global Utility */

class ControllerTests extends Tests {

    constructor() {
        super();
        this.name = "controller";
    }

    construct() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let model = new Model(view, factory, new Storage("test"));
        model.setContext(debugContextJSONString)
        let settings = new Storage();
        let fileOps = new FileOperations(settings);
        let controller = new Controller(view, model, factory, fileOps);
        model.setContext(debugContextJSONString); /* TODO many methods don't function if the context is empty */
        return controller;
    }

    /* basic error checks */
    testConstructor00() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let model = new Model(view, factory, new Storage("test"));
        let settings = new Storage();
        let fileOps = new FileOperations(settings);
        new Controller(view, model, factory, fileOps);
        this.passTest();
    }

    testLoadContext00() {
        let controller = this.construct();
        controller.loadContext("debug", () => this.passTest());
    }

    /* TODO without a real context, encode doesn't know what to do */
    testLoadContext00() {
        let controller = this.construct();

        controller.loadContext("debug",
            () => {
                this.passTest();

            },
            (status, text) => {
                console.log("document encode failed");
                console.log(status);
                console.log(text);
            });
    }

    testLoadContext01() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let model = new Model(view, factory, new Storage("test"));
        let settings = new Storage();
        let fileOps = new FileOperations(settings);
        let controller = new Controller(view, model, factory, fileOps);

        controller.loadContext("debug",
            () => {
                this.assertEquals(model.getContext(), controller.__getContext());
                this.passTest();
            },
            (status, text) => {
                console.log("document encode failed");
                console.log(status);
                console.log(text);
            });
    }

    testLoadContext02() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let model = new Model(view, factory, new Storage("test"));
        let settings = new Storage();
        let fileOps = new FileOperations(settings);
        let controller = new Controller(view, model, factory, fileOps);

        controller.loadContext("debug",
            () => {
                this.assertEquals(controller.__getContext().getName(), "Debug");
                this.passTest();
            },
            (status, text) => {
                console.log("document encode failed");
                console.log(status);
                console.log(text);
            });
    }

    /* TODO without a real context, encode doesn't know what to do */
    testEncode00() {
        let controller = this.construct();

        let loadContextSuccess = function(){
            controller.encode(genericDocument, "genericTitle", encodeSuccess, encodeFailure);
        }.bind(this);

        let encodeSuccess = function(){
            this.passTest();
        }.bind(this);

        let encodeFailure = function(status, text){
            console.log("document encode failed");
            console.log(status);
            console.log(text);
            throw "document encode failed";
        }.bind(this);

        controller.loadContext("debug", loadContextSuccess);
    }

    /* TODO test dictionary without a setting in context */
    testSetDictionary00() {
        let controller = this.construct();
        controller.setDictionary("debug");
        this.passTest();
    }

    testSetLink00() {
        this.construct().setLink("string");
        this.passTest();
    }

    testSetLemma00() {
        this.construct().setLemma("string");
        this.passTest();
    }

    testSetEntity00() {
        this.construct().setEntity("string");
        this.passTest();
    }

    testSetTagName00() {
        this.construct().setTagName("string");
        this.passTest();
    }

    testClearDialogs00() {
        this.construct().clearDialogs();
        this.passTest();
    }

    testSetDialogs00() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let model = new Model(view, factory, new Storage("test"));
        let settings = new Storage();
        let fileOps = new FileOperations(settings);
        let controller = new Controller(view, model, factory, fileOps);
        factory.setContextSource(model);
        model.setContext(debugContextJSONString);

        /* these four lines are tested in model tests */
        model.setDocument(bareDocument, "document name");
        model.saveState();
        let ele = view.dom.getElementById("item1");
        let entity = model.constructEntityFromElement(ele, "PER");

        controller.setDialogs(entity);

        this.passTest();
    }
}

/* --------------- Below here be fake documents --------------- */
var debugContextJSONString = '{\
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

var bareDocument = 'first bit <div id="item1">shakespeare</div> third bit';
var bareDocumentPostEntity = 'first bit <tagged class="notSelected"><entity>shakespeare</entity><tagName>PER</tagName><lemma></lemma></tagged> third bit';
var bareDocumentBefore = 'first bit <tagged class="notSelected"><entity>';
var bareDocumentAfter = '</entity><tagName>PER</tagName><lemma></lemma></tagged> third bit';

var genericDocument = "<xml>\
<head>\
HEADER\
A short blurb about Toronto and London Ontario.\
</head>\
\
<body>\
BODY\
Toronto Ontario Canada is east of London Ontario.\
It is otherwise known as Ol'Smokey.  But in short just Toronto.\
\
This is a sentence with Toronto in the middle.\
\
Naheed Nenshi is the mayor of Calgary.\
John Tory is the mayor of Toronto.\
\
</body>\
\
<tail>\
TAIL\
There is nothing here about Toronto or London.\
</tail>\
\
</xml>";

var processedDocument = '<nervepxml nervep="xml">\
<nervephead nervep="head">\
HEADER\
A short blurb about Toronto and London Ontario.\
</nervephead>\
\
<nervepbody nervep="body">\
BODY\
<tagged class="notSelected"><entity id="NV18301" nerveaid="ID">Toronto Ontario Canada</entity><tagName>LOC</tagName><lemma>Toronto Ontario Canada</lemma></tagged> is east of <tagged class="notSelected"><entity id="NV41248" nerveaid="ID">London Ontario</entity><tagName>LOC</tagName><lemma>London Ontario</lemma></tagged>.\
It is otherwise known as Ol\'Smokey.  But in short just <tagged class="notSelected"><entity id="NV78466" nerveaid="ID">Toronto</entity><tagName>LOC</tagName><lemma>Toronto</lemma></tagged>.\
\
This is a sentence with <tagged class="notSelected"><entity id="NV15598" nerveaid="ID">Toronto</entity><tagName>LOC</tagName><lemma>Toronto</lemma></tagged> in the middle.\
\
<tagged class="notSelected"><entity id="NV13557" nerveaid="ID">Naheed Nenshi</entity><tagName>PER</tagName><lemma>Naheed Nenshi</lemma></tagged> is the mayor of <tagged class="notSelected"><entity id="NV45554" nerveaid="ID">Calgary</entity><tagName>LOC</tagName><lemma>Calgary</lemma></tagged>.\
<tagged class="notSelected"><entity id="NV70411" nerveaid="ID">John Tory</entity><tagName>PER</tagName><lemma>John Tory</lemma></tagged> is the mayor of <tagged class="notSelected"><entity id="NV46347" nerveaid="ID">Toronto</entity><tagName>LOC</tagName><lemma>Toronto</lemma></tagged>.\
\
</nervepbody>\
\
<nerveptail nervep="tail">\
TAIL\
There is nothing here about Toronto or London.\
</nerveptail>\
\
</nervepxml>';