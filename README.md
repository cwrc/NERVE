# NERVE
Named Entity Recognition Vetting Environment

This is a javascript web service that allows you to upload an XML document, run Stanford NER to recognize entities, and to look up and add URIs to new or pre-existing entities. The current version supports three schemas: TEI (Text Encoding Initiative); Orlando (the Orlando Project's biography and writing schemas) and CWRC (Canadian Writing Research Collaboratory).

Lookups are currenty limited to geonames, VIAF, and the CWRC (Canadian Writing Research Collaboratory) entity collection.

License and documentation forthcoming soon!

## Building from source.
prerequisites: glassfish, ant, git, npm, node<br>

### 1. Chekcout repository
> git@github.com:cwrc/NERVE.git (with key)<br>
> git clone git://github.com/cwrc/NERVE.git (without key)<br>

### 2. Build server dependencies
> ant -f ./DocumentNavigator/build.xml jar<br>
> ant -f ./DocumentNavigator/build.xml deploy (optional, to copy versionified jar to shared lib directory)<br>
> ant -f ./NERScriber/build.xml jar<br>
> ant -f ./NERScriber/build.xml deploy (optional, to copy versionified jar to shared lib directory)<br>

### 3. Build server
Change 'j2ee.server.home' to point to the glassfish server installation.<br>
> cd Server<br>
> npm i<br>
> ant -Dj2ee.server.home=/home/glassfish/glassfish5/glassfish/ dist<br>

### 4. Deploy to GlassFish Server
> asadmin deploy ./dist/Server.war<br>

If already deployed, redeploy to GlassFish Server<br>
> asadmin redeploy ./dist/Server.war<br>

## Notes
### Other commands of note
> asadmin start-domain [domain_name]<br>
> asadmin stop-domain [domain_name]<br>
> asadmin list-applications<br>

### List of projects
DocumentNavigator - XML / HTML parser in Java<br>
NERScriber - Program for for encoding & decoding xml files.<br>
Server - Web service for NERScriber.  Contains test page @ host/NERVESERVER.<br>