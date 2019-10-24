#1/bin/bash

if [ "$#" -ne 1 ]; then
	echo "Missing destination directory"
	exit 1
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
mvn -f "$DIR/pom.xml" package
mkdir $1
cp $DIR/target/NERScriber-1.0-SNAPSHOT.jar $1/NERScriber.jar
cp $DIR/src/test/resources/english.all.3class.distsim.crf.ser.gz $1/
cp $DIR/src/test/resources/config.shell.properties $1/config.properties
mkdir $1/context
cp -r $DIR/src/test/resources/context $1
