# NERVE
Named Entity Recognition Vetting Environment

This is a web service that allows you to upload an XML document, run Stanford NER to recognize entities, and to look up and add URIs to new or pre-existing entities. The current version supports three schemas: TEI (Text Encoding Initiative); Orlando (the Orlando Project's biography and writing schemas) and CWRC (Canadian Writing Research Collaboratory).

License and documentation forthcoming soon!

## Building .jar from source.
These instructions will cover how to download and build the NERScriber .jar file
from source.  The .jar file is not the web service but rather contains the bulk
of the logic for the web service.

prerequisites: maven, java<br>
Note: paths are system dependent.

### 1. Checkout repository
> git clone git@github.com:cwrc/NERVE.git (with key)<br>
> git clone git://github.com/cwrc/NERVE.git (without key)<br>
> cd NERVE/NERScriber

### 2. Build the project.
There is a setup script found in /NERScriber which will compile the .jar file
and copy relevant files to a directory of your choice.

> ./NERScriber/setup.sh ./test

> mvn package

### 3. Run the program

> cd test

> java -jar NERScriber.jar

You should see the following:
```
usage: nerscriber [-c config_file] [-x context_file] [--ner] [--link] input_file

Options:
-c              specify the configuration file (default: ./config.properties)
-x              specify the context file, (default: auto-detect from 'context.path' in config)
--ner           perform NER tagging
--link          perform link fill in
```

To run the program on a file you will need to specify the file location, and provide
a configuration file.  Note you need to specify either NER or LINK or both (order
does not matter), otherwise no action will be taken.  The output will go to stdout.


## Building the Apache Tomcat Web App (outside Docker as of 2019-11-14)
* See `Dockerfile` for details
* Build jar file as above; `mvn install` will make jar available as a local maven dependency
* `cd Service; mvn package war:war` to create the war file for Apache Tomcat

## Building the Apache Tomcat Web App (within a Docker Compose environment)

The basic usage to build a test environment
* `docker-compose build`
* `docker-compose up -d`

* rebuild
  * or `docker-compose build --no-cache --parallel`
  * `docker-compose build --force-rm --no-cache --pull --parallel`
  * or `docker-compose up --build --force-recreate -d`

* peak inside container instance
  * `docker-compose exec webapp bash`

## Testing API via curl

Input: JSON with Content-Type: application/json 

```
curl -i -X POST -H "Content-Type: application/json" \
  -d @./test_documents/nerve_test_cwrc_tei_lite.json  http://localhost:6642/ner
```

Input: XML with Content-Type: text/xml

```
curl -i --verbose -X GET -H "Content-Type: text/xml" \
  -d @./test_documents/orlando_biography_template.xml http://localhost:6642/ner
```

Input: JSON from CWRC-Writer in 2019 [see issue #85](https://github.com/cwrc/NERVE/issues/85)
```
curl -i -X POST -H "Content-Type: application/x-www-form-urlencoded" \
  -d @./test_documents/nerve_test_cwrc_tei_lite.json  http://localhost:6642/ner
```

More details in the wiki API [section](https://github.com/cwrc/NERVE/wiki/Endpoint-Descriptions-(api))

