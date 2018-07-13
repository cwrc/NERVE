![Picture](http://cwrc.ca/logos/CWRC_logos_2016_versions/CWRCLogo-Horz-FullColour.png)

[![Travis](https://img.shields.io/travis/cwrc/CWRC-PublicEntityDialogs.svg)](https://travis-ci.org/cwrc/CWRC-PublicEntityDialogs)
[![Codecov](https://img.shields.io/codecov/c/github/cwrc/CWRC-PublicEntityDialogs.svg)](https://codecov.io/gh/cwrc/CWRC-PublicEntityDialogs)
[![version](https://img.shields.io/npm/v/cwrc-public-entity-dialogs.svg)](http://npm.im/cwrc-public-entity-dialogs)
[![downloads](https://img.shields.io/npm/dm/cwrc-public-entity-dialogs.svg)](http://npm-stat.com/charts.html?package=cwrc-public-entity-dialogs&from=2015-08-01)
[![GPL-2.0](https://img.shields.io/npm/l/cwrc-public-entity-dialogs.svg)](http://opensource.org/licenses/GPL-2.0)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# CWRC-PublicEntityDialogs

1. [Overview](#overview)
1. [Installation](#installation)
1. [Configuration](#configuration)
1. [API](#api)
1. [Development](#development)

### Overview

The CWRC-PublicEntityDialogs are used with the [CWRC-WriterBase](https://github.com/cwrc/CWRC-WriterBase) to lookup entities (people, places, organizations, and places) in various public name authority files (e.g., VIAF) or databases (e.g., Wikidata).  The dialogs only provide public lookup.  Creation/editing/deletion of entities should be made outside of the CWRC-Writer in the name authority itself.

An example of their use with the CWRC-WriterBase is the [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter)

The dialogs could also be used outside of the CWRC-WriterBase, as described below.

### Installation

The dialogs are to be used in a web browser.  You may therefore incorporate them into your own javascript application in two ways:

1.  **Script tag**  

Download the dist/cwrcdialogs.js file and make it available on your server, then include it in a script tag in your html file:

```
<body>
<script type="text/javascript" src ="./pathToTheFileOnYourServer/cwrcdialogs.js"></script>
</body>
```

You can then access the dialogs in javascript through the global variable 'cwrcdialogs':

```window.cwrcdialogs```


2. **NPM**

This assumes that your whole javascript project will be built around NPM, and that'll you bundle your javascript using something like [Browserify](http://browserify.org) or [webpack](https://webpack.js.org).  The bundlers themselves are well documented, and you can also look at the [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter) which uses browserify, and uses the CWRC-PublicEntityDialogs.

Install the cwrc-public-entity-dialogs NPM package into your project and save in dependencies (in your package.json):

```npm i cwrc-public-entity-dialogs -S```

Include the dialogs in your javascript:

```let entityDialogs = require('cwrc-public-entity-dialogs');```

(**NOTE:**  the package.json in this repository, and it's use of browserify, is for development work on this package, and is not meant to be a template from which you can start your own project that uses these dialogs.  Again, the best example of how to use these dialogs through NPM is the [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter).)
### Configuration

The dialogs must be configured with public entity sources, using the registerEntitySources method (see API below)

### API

###### registerEntitySources(sources)

where ```sources``` is an object like:

```
{
    people: (new Map()).set('viaf', viaf).set('dbpedia': dbpedia).set('wikidata': wikidata).set('getty':getty).set('dbpedia',dbpedia),
    places: (new Map()).set('geonames', geonames).set('viaf', viaf).set('dbpedia': dbpedia).set('wikidata': wikidata).set('getty':getty).set('dbpedia',dbpedia),
    organizations: (new Map()).set('viaf', viaf).set('dbpedia': dbpedia).set('wikidata': wikidata).set('getty':getty).set('dbpedia',dbpedia),
    titles: (new Map()).set('viaf', viaf).set('dbpedia': dbpedia).set('wikidata': wikidata).set('getty':getty).set('dbpedia',dbpedia),
}
```

and each of the values passed on the set methods is an imported module, e.g.,

```
let viaf = require('viaf-entity-lookup')
let wikidata = require('wikidata-entity-lookup')
let getty = require('getty-entity-lookup')
let dbpedia = require('dbpedia-entity-lookup')
let geonames = require('geonames-entity-lookup')
```

Each of the npm modules listed above can currently be used.  

Entity sources must be registered.  See the [CWRC-GitWriter](https://github.com/cwrc/CWRC-GitWriter/blob/master/src/js/app.js) for an example of usage, or the test/test.js file in this repository, which uses mockes for the entity sources.

The following methods open bootstrap dialogs:


###### popSearchPerson(options)

###### popSearchOrganization(options)

###### popSearchPlace(options)

###### popSearchTitle(options)
  
where 'options' is an object with three properties:

```
{
    query:  The query string supplied by the end user.   
    success: A callback that takes one argument, an object holding the result of the lookup, defined below.
    cancelled: A callback with no arguments, to notify the CWRC-Writer that the entity lookup was cancelled.
}
```

The object returned in the `success` callback is:

```
{   
    name: a string - the name of the entity to display,
    uri: uri to be used as the Linked Data URI for the entity,
    id: same as uri,
    repository: the name of the authority in which the result was found, e.g., 'viaf'
}
```
-----

### Development

development.html is provided along with browserify and watch scripts in the package.json to allow working with the dialogs in a local browser.

[CWRC-Writer-Dev-Docs](https://github.com/jchartrand/CWRC-Writer-Dev-Docs) explains how to work with CWRC-Writer GitHub repositories, including this one.


