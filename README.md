# NERVE
Named Entity Recognition Vetting Environment

This is a javascript web service that allows you to upload an XML document, run Stanford NER to recognize entities, and to look up and add URIs to new or pre-existing entities. The current version supports three schemas: TEI (Text Encoding Initiative); Orlando (the Orlando Project's biography and writing schemas) and CWRC (Canadian Writing Research Collaboratory).

Lookups are currenty limited to geonames, VIAF, and the CWRC (Canadian Writing Research Collaboratory) entity collection.

License and documentation forthcoming soon!

## Development

### Checkout and Setup
* `git clone git@github.com:cwrc/NERVE.git ./nerve`
* `cd nerve/NERVE`
* `npm install`

### Manually Build
* `npm run build-js` Browserify javascript files.
* `npm run copy-html` Copy html to build directory.
* `npm run assets` 
