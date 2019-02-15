# NERVE
Named Entity Recognition Vetting Environment

This is a javascript web service that allows you to upload an XML document, run Stanford NER to recognize entities, and to look up and add URIs to new or pre-existing entities. The current version supports three schemas: TEI (Text Encoding Initiative); Orlando (the Orlando Project's biography and writing schemas) and CWRC (Canadian Writing Research Collaboratory).

Lookups are currenty limited to geonames, VIAF, and the CWRC (Canadian Writing Research Collaboratory) entity collection.

License and documentation forthcoming soon!

## Building from source.
prerequisites: glassfish, ant, git, npm, node

### chekcout repository
> git@github.com:cwrc/NERVE.git (with key)
> git clone git://github.com/cwrc/NERVE.git (without key)

### build server dependencies
> ant -f ./DocumentNavigator/build.xml jar
> ant -f ./DocumentNavigator/build.xml deploy (optional, to copy versionified jar to shared lib directory)
> ant -f ./NERScriber/build.xml jar
> ant -f ./NERScriber/build.xml deploy (optional, to copy versionified jar to shared lib directory)

### build server
> cd Server
> npm i
> ant dist

Deploy to GlassFish Server
> asadmin deploy ./dist/Server.war

If already deployed, redeploy to GlassFish Server
> asadmin redeploy ./dist/Server.war

Other commands of note:
> asadmin start-domain [domain_name]
> asadmin stop-domain [domain_name]
> asadmin list-applications

### List of projects
DocumentNavigator - XML / HTML parser in Java
NERScriber - Program for for encoding & decoding xml files.
Server - Web service for NERScriber.  Contains test page @ host/NERVESERVER.