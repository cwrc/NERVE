'use strict';

let $ = require('jquery')
const test = require('tape')
const Cookies = require('js-cookie')
const sinon = require('sinon')
let dialogs = require('../src/index.js')
let server = sinon.fakeServer.create({respondImmediately:true});

setupServerMocks()

addBootstrapCSS();

// append the test coverage output to the TAPE console output, for later extraction by
// the node test/extract-coverage.js command, used in the test scripts in package.json
test.onFinish(()=>{
        console.log('# coverage:', JSON.stringify(window.__coverage__))
        window.close()
    })

let testDoc = `
    <?xml version="1.0" encoding="UTF-8"?>
<?xml-model href="http://cwrc.ca/schemas/cwrc_tei_lite.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
<?xml-stylesheet type="text/css" href="http://cwrc.ca/templates/css/tei.css"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:cw="http://cwrc.ca/ns/cw#" xmlns:w="http://cwrctc.artsrn.ualberta.ca/#">
    <teiHeader>
        <fileDesc>
            <titleStmt>
                <title>Sample Document Title</title>
            </titleStmt>
            <publicationStmt>
                <p></p>
            </publicationStmt>
            <sourceDesc sameAs="http://www.cwrc.ca">
                <p>Created from original research by members of CWRC/CSÉC unless otherwise noted.</p>
            </sourceDesc>
        </fileDesc>
    </teiHeader>
    <text>
        <body>
            <div>
                Replace with your text.
            </div>
        </body>
    </text>
</TEI>`;

function addBootstrapCSS() {
    let bootstrapCSSLink = document.createElement('link')
    let bootstrapThemeCSSLink = document.createElement('link')
    bootstrapCSSLink.rel='stylesheet'
    bootstrapThemeCSSLink.rel='stylesheet'
    bootstrapCSSLink.href= '../node_modules/bootstrap/dist/css/bootstrap.min.css'
    bootstrapThemeCSSLink.href='../node_modules/bootstrap/dist/css/bootstrap-theme.min.css'
    let headElement = document.getElementsByTagName('head')[0]
    headElement.appendChild(bootstrapCSSLink)
    headElement.appendChild(bootstrapThemeCSSLink)
}

 
let writerMock = {
    utilities: {
        createGuid: ()=>{'fakeGUIDForTesting'},
        getCamelCase: (name)=>{name},
        getDocumentationForTag: (tagName)=>{'someDocs'}
    },
    converter: {
        getDocumentContent: (boolean)=>testDoc
    },
    schemaManager: {
        schemaId: 'tei', 
        schemas: {
            tei: {
                url:'PuturlToTeiSchemaHere'
            }
        }
    },
    dialogManager:{
        show: (nameOfDialogToShow, detailsObject)=>{true}, //detailsObject: {title: '', message: '', type: ''}
        getDialogWrapper: ()=>{return document.body}
    },
    fileManager:{
        loadDocumentFromXml: (xmlDoc)=>{testDoc=xmlDoc}
    },
    event: (eventId)=>{return {publish: ()=>true}},
    baseUrl: 'http://localhost/cwrc',
    editor: {isNotDirty:1, getContent: ()=>'  oh'},
    //repoName: '',
    //repoOwner: '',
    parentCommitSHA: '',
    baseTreeSHA: '',
    loadDocument: (xml)=>{console.log(xml);console.log('loadDocument called')}
};

//ADD SOME TESTS HERE THAT TRIGGER THE BUTTON CLICKS, AFTER THE LOAD() IS CALLED.  

//ADD TESTS THAT TRIGGER THE SAVE() METHOD AND VERIFY THINGS OPENED CORRECTLY IN THAT DIALOG, E.G., THE MESSAGE THAT THE
//    DOC IS ALREADY ASSOCIATED WITH A REPO, OR THAT IT'S NOT, 

function setTestCookie(){
    if (!Cookies.get('cwrc-token')) {
        Cookies.set('cwrc-token', 'test')
    }
}

function removeTestCookie(){
    if (Cookies.get('cwrc-token') === 'test') {
        Cookies.remove('cwrc-token')
    }
}

function setupServerMocks() {
    const usersReply = JSON.stringify(require('./httpResponseMocks/users.json'))
    const templatesReply = JSON.stringify(require('./httpResponseMocks/templates.json'))
    const searchReply = JSON.stringify(require('./httpResponseMocks/search.json'))
    server.respondWith("GET", "/github/users",
                [200, { "Content-Type": "application/json" },
                 usersReply]);
    server.respondWith("GET", "/github/templates",
                [200, { "Content-Type": "application/json" },
                 templatesReply]);
    server.respondWith("GET", "/github/search?q=CWRC-GitWriter-web-app+user:jchartrand",
                [200, { "Content-Type": "application/json" },
                 searchReply]);
}

function resetDOM() {
    document.write('<html><body><b>hello</b></body></html>')
}


function setup() {
    setTestCookie()
}

function tearDown() {
    resetDOM()
    removeTestCookie()
    delete writerMock.repoName 
}



// sinon.assert.calledWith(callback, [{ id: 12, comment: "Hey there" }]);
//server.restore();  // use this to remove any mocks and allow the http requests to go out
//assert.pass('This test will pass.');
/*
test('an existing document', (assert) => {
    assert.plan(2)  // two assertions should be run
    setup()
    writerMock.repoName = 'some name'
    dialogs.load()
    assert.ok(($("#existing-doc-dialog").data('bs.modal') || {}).isShown, 'should trigger a prompt on load')
    $("#cancel-load-existing-btn").click()
    assert.ok(!($("#existing-doc-dialog").data('bs.modal') || {}).isShown, 'and should close load dialog when cancelled')
    delete writerMock.repoName
})

test('an existing document with ok', (assert) => {
    assert.plan(2)  // two assertions should be run
    setup()
    writerMock.repoName = 'some name'
    dialogs.load()
    assert.ok(($("#existing-doc-dialog").data('bs.modal') || {}).isShown, 'should trigger a prompt on load')
    $("#ok-load-existing-btn").click()
    assert.ok(!($("#existing-doc-dialog").data('bs.modal') || {}).isShown, 'and should call load dialog for ok')
    delete writerMock.repoName
})

test('an unsaved document with ok', (assert)=>{
    assert.plan(2)
    setup()
    writerMock.editor.isNotDirty = 0
    sinon.spy(dialogs, "save")
    dialogs.load()
    assert.ok(($("#unsaved-dialog").data('bs.modal') || {}).isShown, 'should prompt on load')
    $("#save-unsaved-btn").click()
    assert.ok(dialogs.save.calledOnce, 'and should call save for ok')
    writerMock.editor.isNotDirty = 1
})

*/

test('load with existing document', (assert)=>{
    setup()
    assert.plan(1)
    writerMock.repoName = 'some name'
    dialogs.load(writerMock)
    assert.ok(($("#existing-doc-modal").data('bs.modal') || {}).isShown, 'should open confirm dialog')
    tearDown()
})

function isDialogOpen(dialogId) {
    return ($(dialogId).data('bs.modal') || {}).isShown
}

test('clicking continue in dialog to confirm load with existing document', (assert)=>{
    setup()
    writerMock.repoName = 'some name'
    assert.plan(4)
    sinon.spy(dialogs, 'save')
    dialogs.load(writerMock)
    sinon.spy(dialogs, 'load')
    $("#existing-doc-continue-btn").click()
    assert.ok(dialogs.save.notCalled, 'should not call save')
    assert.notOk(isDialogOpen("#unsaved-dialog"), 'should close dialog')
    assert.ok(!writerMock.hasOwnProperty('repoName'), 'should remove repoName from writer')
    assert.ok(dialogs.load.calledOnce, 'should call load')
    // remove the spies
    dialogs.save.restore()
    dialogs.load.restore()
    tearDown()
})

test('clicking cancel in dialog to confirm load with existing document', (assert)=>{
    // arrange
    setup()
    assert.plan(2)
    writerMock.repoName = 'some name'
    dialogs.load(writerMock)
    sinon.spy(dialogs, 'load')
     // act
    $("#existing-doc-cancel-btn").click()
    // assert
    assert.notOk(isDialogOpen("#unsaved-dialog"), 'should close dialog')
    assert.ok(dialogs.load.notCalled, 'should not call save')
    dialogs.load.restore()
    tearDown()
})

test('authentication', (t)=>{
    t.test('authenticate method', (assert)=>{
            setup()
            assert.plan(1)
            sinon.spy(dialogs, 'authenticate')
            dialogs.load(writerMock)
            assert.ok(dialogs.authenticate.calledOnce, 'should be called on load')
            dialogs.authenticate.restore()
            tearDown()
    })
    t.test('authentication modal', (assert)=>{
            setup()
            removeTestCookie()
            assert.plan(1)
            dialogs.load(writerMock)
            assert.ok(($("#githubAuthenticateModal").data('bs.modal') || {}).isShown, ' should open')
            tearDown()
    })
    t.end()  
})

test('load', (assert) => {
    assert.plan(3)
    // arrange
    setup()
    // act
    let serverRequestsBeforeLoad = server.requests.length
    dialogs.load(writerMock)
    // assert
    assert.ok(server.requests.length > serverRequestsBeforeLoad, "should make server requests")
    assert.ok(($("#githubLoadModal").data('bs.modal') || {}).isShown, 'should open load modal')
    assert.equal(document.querySelector('h4').textContent, 'Load From a CWRC-enabled Github Repository',  'with correct title')
    // cleanup
    tearDown()
    
});

test('missing description shows (no description)', (assert) => {
    assert.plan(1)
    setup()
    dialogs.load(writerMock)
    setTimeout(function(){
        assert.equal(document.getElementById('gh_88569839').querySelector('p').textContent, '(no description)');
        tearDown()}, 1000);

})
