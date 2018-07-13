![Picture](http://cwrc.ca/logos/CWRC_logos_2016_versions/CWRCLogo-Horz-FullColour.png)

[![Travis](https://img.shields.io/travis/cwrc/getty-entity-lookup.svg)](https://travis-ci.org/cwrc/getty-entity-lookup)
[![Codecov](https://img.shields.io/codecov/c/github/cwrc/getty-entity-lookup.svg)](https://codecov.io/gh/cwrc/getty-entity-lookup)
[![version](https://img.shields.io/npm/v/getty-entity-lookup.svg)](http://npm.im/getty-entity-lookup)
[![downloads](https://img.shields.io/npm/dm/getty-entity-lookup.svg)](http://npm-stat.com/charts.html?package=getty-entity-lookup&from=2015-08-01)
[![GPL-3.0](https://img.shields.io/npm/l/getty-entity-lookup.svg)](http://opensource.org/licenses/GPL-3.0)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# getty-entity-lookup

1. [Overview](#overview)
1. [Installation](#installation)
1. [Use](#use)
1. [API](#api)
1. [Development](#development)

### Overview

Finds entities (people, places) in getty.  Meant to be used with [cwrc-public-entity-dialogs](https://github.com/cwrc-public-entity-dialogs) where it runs in the browser.

Although it will not work in node.js as-is, it does use the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for http requests, and so could likely therefore use a browser/node.js compatible fetch implementation like: [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch).

### SPARQL

getty supports sparql, but SPARQL has limited support for full text search.  The expectation with SPARQL mostly seems to be that you know exactly what you are matching on
So, a query that exactly details the label works fine:

SELECT DISTINCT ?s WHERE {
  ?s ?label "The Rolling Stones"@en .
  ?s ?p ?o
}

We'd like, however, to match with full text search, so we can match on partial strings, variant spellings, etc.  
Just in the simple case above, for example, someone searching for The Rolling Stones would have to fully specify 'The Rolling Stones' and not just 'Rolling Stones'.  If they left out 'The' then their query won't return the result.

There is a SPARQL CONTAINS operator that can be used within a FILTER, and that matches substrings, which is better, and
CONTAINS seems to work with getty, e.g.


```
http://vocab.getty.edu/sparql.json?query=SELECT DISTINCT ?s ?label WHERE {
            ?s rdfs:label ?label . 
            FILTER (CONTAINS (?label,"Rolling Stones")) 
```

but again, CONTAINS only matches substrings.

There is at least one alternative to CONTAINS - REGEX - but as described 
here: https://www.cray.com/blog/dont-use-hammer-screw-nail-alternatives-regex-sparql/ REGEX has even worse performance than CONTAINS.  

A further alternative, which we've adopted, is the 
custom full text SPARQL search function through which Getty exposes it's underlying lucene index, as described here:

http://vocab.getty.edu/doc/queries/#Full_Text_Search_Query

and here:

http://serials.infomotions.com/code4lib/archive/2014/201402/0596.html

The endpoint does not, however, support HTTPS.  And so, we proxy our calls to the lookup through own server: 
 
```https://lookup.services.cwrc.ca/getty```
 
to thereby allow the CWRC-Writer to make HTTPS calls to the lookup.  
We can’t make plain HTTP calls from the CWRC-Writer because the CWRC-Writer may only be 
loaded over HTTPS, and any page loaded with HTTPS is not allowed (by many browsers) to make HTTP AJAX calls.

We also proxy calls to retrieve the full page description of an entity, again to allow calls out from a page that was itself
loaded with https.  The proxy:

```https://getty.lookup.services.cwrc.ca```

which in turn calls

```http://vocab.getty.edu```


### Installation

npm i getty-entity-lookup -S

### Use

const gettyLookup = require('getty-entity-lookup');

### API

###### findPerson(query)

###### findPlace(query)


<br><br>
where the 'query' argument is an object:  
<br>  

```
{
    entity:  The name of the thing the user wants to find.
    options: TBD 
}
```

<br>
and all find* methods return promises that resolve to an object like the following:
<br><br>  

```
{
    id: "http://vocab.getty.edu/ulan/500311165"
    
    name: "University of Pennsylvania, Lloyd P. Jones Gallery"
    
    nameType: "Corporate"
    
    originalQueryString: "jones"
    
    repository: "getty"
    
    uri: "http://vocab.getty.edu/ulan/500311165"
    
    uriForDisplay: "https://getty.lookup.services.cwrc.ca/ulan/500311165"
    
}
```
<br><br>
There are a further four methods that are mainly made available to facilitate testing (to make it easier to mock calls to the getty service):

###### getPersonLookupURI(query)

###### getPlaceLookupURI(query)


<br><br>
where the 'query' argument is the entity name to find and the methods return the getty URL that in turn returns results for the query.

### Development

[CWRC-Writer-Dev-Docs](https://github.com/jchartrand/CWRC-Writer-Dev-Docs) describes general development practices for CWRC-Writer GitHub repositories, including this one.

#### Testing

The code in this repository is intended to run in the browser, and so we use [browser-run](https://github.com/juliangruber/browser-run) to run [browserified](http://browserify.org) [tape](https://github.com/substack/tape) tests directly in the browser. 

We [decorate](https://en.wikipedia.org/wiki/Decorator_pattern) [tape](https://github.com/substack/tape) with [tape-promise](https://github.com/jprichardson/tape-promise) to allow testing with promises and async methods.  

#### Mocking

We use [fetch-mock](https://github.com/wheresrhys/fetch-mock) to mock http calls (which we make using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) rather than XMLHttpRequest). 

We use [sinon](http://sinonjs.org) [fake timers](http://sinonjs.org/releases/v4.0.1/fake-timers/) to test our timeouts, without having to wait for the timeouts.

#### Code Coverage  

We generate code coverage by instrumenting our code with [istanbul](https://github.com/gotwarlost/istanbul) before [browser-run](https://github.com/juliangruber/browser-run) runs the tests, 
then extract the coverage (which [istanbul](https://github.com/gotwarlost/istanbul) writes to the global object, i.e., the window in the browser), format it with [istanbul](https://github.com/gotwarlost/istanbul), and finally report (Travis actually does this for us) to [codecov.io](codecov.io)

#### Transpilation

We use [babelify](https://github.com/babel/babelify) and [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul) to compile our code, tests, and code coverage with [babel](https://github.com/babel/babel)  

#### Continuous Integration

We use [Travis](https://travis-ci.org).

Note that to allow our tests to run in Electron on Travis, the following has been added to .travis.yml:

```
addons:
  apt:
    packages:
      - xvfb
install:
  - export DISPLAY=':99.0'
  - Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
  - npm install
```

#### Release

We follow [SemVer](http://semver.org), which [Semantic Release](https://github.com/semantic-release/semantic-release) makes easy.  
Semantic Release also writes our commit messages, sets the version number, publishes to NPM, and finally generates a changelog and a release (including a git tag) on GitHub.

