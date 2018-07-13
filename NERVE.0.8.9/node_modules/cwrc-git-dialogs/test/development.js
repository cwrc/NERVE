// file on which to run browserify when manually testing (in a browser) 
// or working on the module (to see the effect of changes in the browser).
'use strict';
if (!window.$) {
    window.jQuery = window.$ = require('jquery');
}
let gitDialogs = require('../src/index.js');
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
let writerMock = {
	utilities: {
		createGuid: ()=>{'fakeGUIDForTesting'},
		getCamelCase: (name)=>{name},
		getDocumentationForTag: (tagName)=>{'someDocs'}
	},
	converter: {
		getDocumentContent: (boolean)=>testDoc
	},
	githubUser: {login: 'jchartrand'},
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
	repoName: '',
    repoOwner: '',
    parentCommitSHA: '',
    baseTreeSHA: '',
    loadDocument: (xml)=>{console.log(xml);console.log('loadDocument called')}
};

 
$('#load-pop').on('click', function() {	
	gitDialogs.load(writerMock)
	
})

$('#save-pop').on('click', function() {	
	console.log("trigger the test save.  about to call delegator.save")
	gitDialogs.save(writerMock)
	//cD.popSearchPerson({query:'twain', success: result=>console.log(result)});
})


