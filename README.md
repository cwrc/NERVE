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
This will test and build the .jar files, placing them in /target.
If you see "[INFO] BUILD SUCCESS" then the build was successful.

> mvn package

### 3. Run the program
> cd target
> java -jar NERScriber-1.0-SNAPSHOT.jar

You should see the following:
usage: nerscriber [-c config_file] [-x context_file] input_file

Options:
-c              specify the configuration file (default: ./config.properties)
-x              specify the context file, (default: auto-detect from 'context.path' in config)

To run the program on a file you will need to specify the file location, and provide
a configuration file.