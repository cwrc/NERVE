'use strict';

// file on which to run browserify when manually testing (in a browser)
// or working on the module (to see the effect of changes in the browser).

let getty = require('../src/index.js');


// DON'T FORGET TO RUN THE BROWSERIFY COMMAND (FROM PACKAGE.JSON) BEFORE LOADING IN A BROWSER
console.log('the person lookup uri: ')
console.log(getty.getPersonLookupURI('jones'))

console.log('the place lookup uri: ')
console.log(getty.getPlaceLookupURI('jones'))


getty.findPerson('jones').then((result)=>{
    console.log('a lookup of smith in people: ')
    console.log(result)
})

getty.findPlace('jones').then((result)=>{
    console.log('a lookup of paris in place: ')
    console.log(result)
})


