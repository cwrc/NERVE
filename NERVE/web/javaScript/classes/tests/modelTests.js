/* global Utility */

class ModelTests extends Tests {

    constructor() {
        super();
        this.name = "model";
    }

    newModel() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let model = new Model(view, factory, new Storage("test"));
        return model;
    }

    /* basic error check */
    testConstructor00() {
        let model = this.newModel();
        this.passTest();
    }

    /* ensure a non-null context when the model is initialized */
    testConstructor01() {
        let model = this.newModel();
        this.assertExists(model.getContext());
        this.passTest();
    }

    /* ensure a blank document when the model is initialized */
    testConstructor02() {
        let model = this.newModel();
        this.assertEquals(model.getDocument(), "");
        this.passTest();
    }

    testSetContext01() {
        let model = this.newModel();
        model.setContext(debugContextJSONString);
        this.assertEquals(model.getContext().getName(), "Debug");
        this.passTest();
    }

    testSetDocument00() {
        let model = this.newModel();
        model.setDocument("document text", "document name");
        this.assertEquals(model.getDocument(), "document text");
        this.passTest();
    }

    testSetDocument01() {
        let model = this.newModel();
        model.setDocument("document text", "document name");
        model.setDocument("different text altogether", "document name");
        this.assertEquals(model.getDocument(), "different text altogether");
        this.passTest();
    }

    testSetDocument02() {
        let model = this.newModel();
        model.setDocument("document text", "document name");
        model.setDocument("", "");
        this.assertEquals(model.getDocument(), "");
        this.passTest();
    }

    /* the state is reset when a document is set */
    testSetDocument03() {
        let model = this.newModel();
        model.setDocument("document text", "document name");
        model.setDocument("", "");
        model.revertState();
        this.assertEquals(model.getDocument(), "");
        this.passTest();
    }

    testSetDocument04() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let settings = new Storage("test");
        let model = new Model(view, factory, settings);

        model.setDocument("document text", "document name");
        this.assertEquals(settings.getValue("model", "document"), "document text");

        this.passTest();
    }

    testSetDocument05() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let settings = new Storage("test");
        let model = new Model(view, factory, settings);

        model.setDocument("document text", "document name");
        this.assertEquals(settings.getValue("model", "filename"), "document name");

        this.passTest();
    }

    testSetDocument06() {
        let view1 = new TestView();
        let factory1 = new TaggedEntityFactory();
        let settings1 = new Storage("test");
        let model1 = new Model(view1, factory1, settings1);

        model1.setDocument("document text", "document name");

        let view2 = new TestView();
        let factory2 = new TaggedEntityFactory();
        let settings2 = new Storage("test");
        let model2 = new Model(view2, factory2, settings2);

        model2.setDocument("document text", "document name");
        this.assertEquals(settings2.getValue("model", "filename"), "document name");

        this.passTest();
    }


    /* the state is saved when a document is set */
    testStates00() {
        let model = this.newModel();
        model.setDocument("document text", "document name");
        model.setDocument("", "");
        model.revertState();
        model.advanceState();
        this.assertEquals(model.getDocument(), "");
        this.passTest();
    }

    testSetContext00() {
        let model = this.newModel();
        model.setContext(debugContextJSONString);
        this.passTest();
    }

    /* the state is saved when a document is set */
    /* note the div tag is not maintained from the origional html as it  */
    /* represents a selcted object that */
    testConstructEntity() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let model = new Model(view, factory, new Storage("test"));
        model.setContext(debugContextJSONString);
        factory.setContextSource(model);

        model.setDocument(bareDocument, "document name");

        let ele = view.dom.getElementById("item1");
        this.assertExists(ele);
        var taggedEntity = model.constructEntityFromElement(ele, "PER");

        this.assertEquals(taggedEntity.getTagname(), "PER");
        this.assertEquals(taggedEntity.getLemma(), "");
        this.assertEquals(taggedEntity.getLink(), "");
        this.assertEquals(taggedEntity.getEntity(), "shakespeare");

        this.assertEquals(model.getDocument(), bareDocumentPostEntity);
        this.passTest();
    }

    testConstructRevert() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let model = new Model(view, factory, new Storage("test"));
        model.setContext(debugContextJSONString);
        factory.setContextSource(model);

        model.setDocument(bareDocument, "document name");
        model.saveState();

        let ele = view.dom.getElementById("item1");
        this.assertExists(ele);
        model.constructEntityFromElement(ele, "PER");

        model.revertState();

        this.assertEquals(model.getDocument(), bareDocument);
        this.passTest();
    }

    testConstructAdvance() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let model = new Model(view, factory, new Storage("test"));
        model.setContext(debugContextJSONString);
        factory.setContextSource(model);

        model.setDocument(bareDocument, "document name");
        model.saveState();

        let ele = view.dom.getElementById("item1");
        this.assertExists(ele);
        model.constructEntityFromElement(ele, "PER");

        model.revertState();
        model.advanceState();

        this.assertEquals(model.getDocument(), bareDocumentPostEntity);
        this.passTest();
    }

    testMaxStateIndex00() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let model = new Model(view, factory, new Storage("test"));
        model.setContext(debugContextJSONString);
        factory.setContextSource(model);
        model.maxStateIndex = 4;

        model.saveState();
        model.saveState();
        model.saveState();
        model.saveState();
        model.saveState();
        model.saveState();


        this.passTest();
    }

    testMaxStateIndex01() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let model = new Model(view, factory, new Storage("test"));
        model.setContext(debugContextJSONString);
        factory.setContextSource(model);
        model.maxStateIndex = 4;

        model.setDocument(bareDocument, "document name");

        let ele = view.dom.getElementById("item1");
        this.assertExists(ele);
        let taggedEntity = model.constructEntityFromElement(ele, "PER");

        this.assertEquals(model.getDocument(), bareDocumentBefore + "shakespeare" + bareDocumentAfter);

        model.saveState();
        taggedEntity.setEntity("alpha");
        model.saveState();
        taggedEntity.setEntity("bravo");
        model.saveState();
        taggedEntity.setEntity("charlie");
        model.saveState();
        taggedEntity.setEntity("delta");
        model.saveState();
        taggedEntity.setEntity("echo");
        model.saveState();
        taggedEntity.setEntity("foxtrot");

        model.revertState();
        this.assertEquals(model.getDocument(), bareDocumentBefore + "echo" + bareDocumentAfter);

        model.revertState();
        this.assertEquals(model.getDocument(), bareDocumentBefore + "delta" + bareDocumentAfter);

        model.revertState();
        this.assertEquals(model.getDocument(), bareDocumentBefore + "charlie" + bareDocumentAfter);

        model.revertState();
        this.assertEquals(model.getDocument(), bareDocumentBefore + "bravo" + bareDocumentAfter);

        /* this revert shouldn't occur, maximum 4 saved states */
        model.revertState();
        this.assertEquals(model.getDocument(), bareDocumentBefore + "bravo" + bareDocumentAfter);

        this.passTest();
    }

    testMaxStateIndex02() {
        let view = new TestView();
        let factory = new TaggedEntityFactory();
        let model = new Model(view, factory, new Storage("test"));
        model.setContext(debugContextJSONString);
        factory.setContextSource(model);

        model.maxStateIndex = 4;

        model.saveState();
        model.saveState();
        model.saveState();
        model.saveState();
        model.saveState();
        model.saveState();

        this.assertTrue(model.revertState());
        this.assertTrue(model.revertState());
        this.assertTrue(model.revertState());
        this.assertTrue(model.revertState());

        /* this revert shouldn't occur, maximum 4 saved states */
        this.assertFalse(model.revertState());

        this.passTest();
    }

    testParameterExceptionConstructor00() {
        try {
            let view = new TestView();
            let factory = new TaggedEntityFactory();
            let model = new Model(null, factory, new Storage("test"));
        } catch (e) {
            if (e instanceof EnforcedTypeError) {
                this.passTest();
                return;
            } else {
                throw e;
            }
        }

        throw "Parameter exception not thrown";
    }

    testParameterExceptionConstructor01() {
        try {
            let view = new TestView();
            let factory = new TaggedEntityFactory();
            let model = new Model(view, null, new Storage("test"));
        } catch (e) {
            if (e instanceof EnforcedTypeError) {
                this.passTest();
                return;
            } else {
                throw e;
            }
        }

        throw "Parameter exception not thrown";
    }

    testParameterExceptionConstructor02() {
        try {
            let view = new TestView();
            let factory = new TaggedEntityFactory();
            let model = new Model(factory, view, new Storage("test"));
        } catch (e) {
            if (e instanceof EnforcedTypeError) {
                this.passTest();
                return;
            } else {
                throw e;
            }
        }

        throw "Parameter exception not thrown";
    }

    /* TODO Test that events still fire when state changes */
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
