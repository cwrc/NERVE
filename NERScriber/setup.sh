#1/bin/bash
mvn package
mkdir $1
cp target/NERScriber-1.0-SNAPSHOT.jar $1/NERScriber.jar
cp src/test/resources/english.all.3class.distsim.crf.ser.gz $1/
cp src/test/resources/config.shell.properties $1/config.properties
mkdir $1/context
cp -r src/test/resources/context $1
