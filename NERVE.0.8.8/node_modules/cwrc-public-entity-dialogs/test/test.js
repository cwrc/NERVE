'use strict';

const test = require('tape');
const sinon = require('sinon');


// print istanbul's coverage info to the console so we can get it later in our npm script where we save it to a file.
test.onFinish(()=>{
    console.log('# coverage:', JSON.stringify(window.__coverage__))
    window.close()
});

if (!window.$) {
    window.jQuery = window.$ = require('jquery')
}

// couple other tests might want:
// - that entity sources aren't shown if the config doesn't list them.
// - no results for an entity source should show a message.


function getQueryOptionsWithCallbackSpy() {
    return {
        query: 'jones',
        success: sinon.spy()
    }
}

const fixtures = require('./fixtures/sourceData');

function getGeonamesStubs() {
    return {

        findPlace: sinon.stub().resolves(fixtures.geonames.places)
    }
}

function getViafStubs() {
    return {
        findPerson: sinon.stub().resolves(fixtures.viaf.people),
        findPlace: sinon.stub().resolves(fixtures.viaf.places),
        findOrganization: sinon.stub().resolves(fixtures.viaf.organizations),
        findTitle: sinon.stub().resolves(fixtures.viaf.titles)
    }
}

function getWikidataStubs() {
    return {
        findPerson: sinon.stub().resolves(fixtures.wikidata.people),
        findPlace: sinon.stub().resolves(fixtures.wikidata.places),
        findOrganization:sinon.stub().resolves(fixtures.wikidata.organizations),
        findTitle: sinon.stub().resolves(fixtures.wikidata.titles)
    }
}

function getGettyStubs() {
    return {
        findPerson: sinon.stub().resolves(fixtures.getty.people),
        findPlace: sinon.stub().resolves(fixtures.getty.places)
    }
}


function getDbpediaStubs() {
    return {
        findPerson: sinon.stub().resolves(fixtures.dbpedia.people),
        findPlace: sinon.stub().resolves(fixtures.dbpedia.places),
        findOrganization:sinon.stub().resolves(fixtures.dbpedia.organizations),
        findTitle: sinon.stub().resolves(fixtures.dbpedia.titles)
    }
}


function getEntitySourceStubs() {
    return {
        people: (new Map()).set('viaf', getViafStubs()).set('wikidata', getWikidataStubs()).set('getty',getGettyStubs()).set('dbpedia',getDbpediaStubs()),
        places: (new Map()).set('geonames', getGeonamesStubs()).set('viaf', getViafStubs()).set('wikidata', getWikidataStubs()).set('getty',getGettyStubs()).set('dbpedia',getDbpediaStubs()),
        organizations: (new Map()).set('viaf', getViafStubs()).set('wikidata', getWikidataStubs()).set('dbpedia',getDbpediaStubs()),
        titles: (new Map()).set('viaf', getViafStubs()).set('wikidata', getWikidataStubs()).set('dbpedia',getDbpediaStubs()),
    }
}


// test('popSearchPerson', (assert=>{testEntityType('people', popSearchPerson)}
async function testEntityType(assert, methodToTest, entityType, entitySourceMethod) {
// 'ASSEMBLE'
    let dialogsCopy = require('../src/index.js')
    let entitySources = getEntitySourceStubs();
    let queryOptions = getQueryOptionsWithCallbackSpy();
    dialogsCopy.registerEntitySources(entitySources)
    // 'ACT'
    await dialogsCopy[methodToTest](queryOptions);
    // seem to need this timeout to force rendering of modal.
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 'ASSERT
    entitySources[entityType].forEach((entitySource, entitySourceName) => {
        assert.ok(entitySource[entitySourceMethod].calledWith(queryOptions.query), 'called with query')
        assert.ok(entitySource[entitySourceMethod].calledOnce, 'called only once')

        assert.ok(isElementForIdVisible(`cwrc-${entitySourceName}-panel`), 'source panel is shown when it has a configured source')
        confirmShownTextMatchesFixtureTest(entitySourceName, entityType, assert);
    })

    assert.ok(isElementForIdVisible('cwrc-entity-lookup'), 'the modal was shown')

    const fixtureForSelectedResult = fixtures.viaf[entityType][1]
    const elementForSelectedResult = document.getElementById('cwrc-viaf-list').querySelectorAll('li')[1];

    testIFrame(assert, fixtureForSelectedResult, elementForSelectedResult)
    testSelection(assert, fixtureForSelectedResult, elementForSelectedResult, queryOptions)
    assert.end()
}

function confirmShownTextMatchesFixtureTest(entitySourceName, entityType, assert) {
    document.getElementById(`cwrc-${entitySourceName}-list`).querySelectorAll('li').forEach((result, index) => {
        let fixtureResult = fixtures[entitySourceName][entityType][index];
        let textThatWasShown = result.getElementsByTagName('div')[0].textContent
        let textThatShouldHaveBeenShown = fixtureResult.description ?
            `${fixtureResult.name} - ${fixtureResult.description}` :
            `${fixtureResult.name}`
        assert.equals(textThatWasShown, textThatShouldHaveBeenShown, 'result text matches corresponding entity source result')
    })
}

function testIFrame(assert, fixtureForSelectedResult, elementForSelectedResult ) {

    // ACT: click on second result of viaf results
    elementForSelectedResult.click()

    // ASSERT
    let iframe = document.getElementById("entity-iframe");
    assert.ok(isElementVisible(iframe), 'the iframe was shown');
    assert.ok(iframe.src.startsWith(fixtureForSelectedResult.uriForDisplay), 'the iframe src was set to the correct url')
    // xhr.restore();
}

function testSelection(assert, fixtureForSelectedResult, elementForSelectedResult, queryOptions ) {

    // ACT : dbl click to select a result
    $(elementForSelectedResult).dblclick()
    //await new Promise(resolve => setTimeout(resolve, 1000));
    assert.ok(isElementForIdHidden('cwrc-entity-lookup'), 'the modal was hidden')

    // ASSERT
    assert.ok(queryOptions.success.calledOnce)
    assert.ok(queryOptions.success.calledWith(fixtureForSelectedResult), 'the correct result was returned')

}

function isElementForIdVisible(elementId){
    return isElementVisible(document.getElementById(elementId))
}
function isElementForIdHidden(elementId){
    return isElementHidden(document.getElementById(elementId))
}
function isElementHidden(element) {
    // return element.offsetLeft < 0
    return ! isElementVisible(element)
}
function isElementVisible(element) {
    //return ! isElementHidden(element)
    return $(element).is(':visible')
}
test('popSearchPerson',   function(assert){
    testEntityType(assert, 'popSearchPerson', 'people', 'findPerson')
})
test('popSearchPlace',  function(assert){
    testEntityType(assert, 'popSearchPlace','places', 'findPlace')
})
test('popSearchOrganization',   function(assert){
    testEntityType(assert, 'popSearchOrganization','organizations', 'findOrganization');
})
test('popSearchTitle',   function(assert){
    testEntityType(assert, 'popSearchTitle','titles', 'findTitle');

})
