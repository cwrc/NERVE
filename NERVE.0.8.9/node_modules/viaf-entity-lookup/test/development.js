'use strict';

// file on which to run browserify when manually testing (in a browser)
// or working on the module (to see the effect of changes in the browser).

let viaf = require('../src/index.js');
const sinon = require('sinon')
//const server = sinon.fakeServer.create({respondImmediately:true});
/*
let xhr = sinon.useFakeXMLHttpRequest();
var requests  = [];

xhr.onCreate = function (xhrRequest) {
    console.log('a request was made and trapped:')
    console.log(xhrRequest)
    requests.push(xhrRequest);
};


let queryStringForError = 'miles';
let url = viaf.getOrganizationLookupURI(queryStringForError);
console.log('the viaf organization url: ')
console.log(url)
*/

/*server.respondWith("GET", /miles/,
    [200, {"Content-Type": "application/json"},
        "{'test':'testt'}"]);*/

/*
server.respondWith("GET", 'http://viaf.org/viaf/search?query=local.corporateNames+all+%22miles%22&httpAccept=application/json&maximumRecords=5',
    [200, {"Content-Type": "application/json"},"{'test':'test'}"]);
*/

/*function aTest(){

    viaf.findOrganization(queryStringForError).then(function(result){
            console.log('the reply from the findOrganization call:')
            console.log(result)
            console.log('done de')
    },
    function(error){
        console.log("in the catch"); console.log(error)
    })

    requests[0].respond(500, { "Content-Type": "application/json" },
        '[{ "id": 12, "comment": "Hey there" }]');


}*/

//aTest()

// DON'T FORGET TO RUN THE BROWSERIFY COMMAND (FROM PACKAGE.JSON) BEFORE LOADING IN A BROWSER
console.log('the person lookup uri: ')
console.log(viaf.getPersonLookupURI('jones'))

console.log('the place lookup uri: ')
console.log(viaf.getPlaceLookupURI('jones'))

console.log('the organization lookup uri: ')
console.log(viaf.getOrganizationLookupURI('jones'))

console.log('the title lookup uri: ')
console.log(viaf.getTitleLookupURI('jones'))




viaf.findPerson('Canadien').then((result)=>{
    console.log('a lookup of Canadien in people: ')
    console.log(result)
})

viaf.findPlace('jones').then((result)=>{
    console.log('a lookup of jones in place: ')
    console.log(result)
})
/*
viaf.findOrganization('jones').then((result)=>{
    console.log('a lookup of jones in organization: ')
    console.log(result)
})

viaf.findTitle('jones').then((result)=>{
    console.log('a lookup of jones in title: ')
    console.log(result)
})*/

