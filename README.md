# NERVE
Named Entity Recognition Vetting Environment

This is a javascript web service that allows you to upload an XML document, run Stanford NER to recognize entities, and to look up and add URIs to new or pre-existing entities. The current version supports three schemas: TEI (Text Encoding Initiative); Orlando (the Orlando Project's biography and writing schemas) and CWRC (Canadian Writing Research Collaboratory).

Lookups are currenty limited to geonames, VIAF, and the CWRC (Canadian Writing Research Collaboratory) entity collection.

License and documentation forthcoming soon!

## Building from source.
prerequisites: glassfish, ant, git, npm, node<br>
Note: paths are system dependent.

### 1. Checkout repository
> git clone git@github.com:cwrc/NERVE.git (with key)<br>
> git clone git://github.com/cwrc/NERVE.git (without key)<br>

### 2. Build server
First, install the node dependencies. From the NERVE/Server directory, run
> npm i

Second, build the war file. The default task in the NERVE/Server/build.xml ant file will output the built server application to NERVE/Server/dist/Server.war.<br>
The task relies upon the `j2ee.server.home` property being set to your glassfish server installation.<br>
The task requires the `lib` path to be set to the JJJRMI.packed jar file in the NERVE/lib directory.<br>
For example, from the NERVE/Server directory, run
> ant -lib ../lib/JJJRMI.packed-0.4.20.jar -Dj2ee.server.home=/home/glassfish5/glassfish/

### 3. Deploy to GlassFish Server
> asadmin deploy ./dist/Server.war<br>

If already deployed, redeploy to GlassFish Server<br>
> asadmin redeploy --name=Server ./dist/Server.war<br>

### 4. Build client
Requires browserify, and sass.<br>
> npm i -g browserify<br>
> npm i -g sass<br>
<br>
> cd ../NERScriber<br>
> npm i <br>
> cd ../client<br>
> npm i<br>
> npm run build-js<br>
> npm run build-css<br>
> cp -r public_html/ /home/glassfish5/glassfish/domains/domain1/docroot/nerve

### 5. Link Client to Server
In the client side of the app there a file 'assets/serverlocation'. This file
contains the location of the web socket, the default value is 
'ws://localhost:8080/NERVESERVER/NerveSocket', the 'localhost:8080' needs to be
changed to the ip/name of your server.

## Notes
### Other commands of note
> asadmin start-domain [domain_name]<br>
> asadmin stop-domain [domain_name]<br>
> asadmin list-applications<br>
