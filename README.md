# NERVE
Named Entity Recognition Vetting Environment

This is a javascript web service that allows you to upload an XML document, run Stanford NER to recognize entities, and to look up and add URIs to new or pre-existing entities. The current version supports three schemas: TEI (Text Encoding Initiative); Orlando (the Orlando Project's biography and writing schemas) and CWRC (Canadian Writing Research Collaboratory).

Lookups are currenty limited to geonames, VIAF, and the CWRC (Canadian Writing Research Collaboratory) entity collection.

License and documentation forthcoming soon!



## Building from source.
prerequisites: glassfish, ant, git, npm, node<br>
Note: paths are system dependent.

### Requirements
- Tested with Ant.10.x (Ant 1.9 fails)
- Tested with OpenJDK 1.8.x (OpenJDK 11 fails with Glassfish 5.1)
- Tested with NPM 6.4.1 and Node 10.15.3

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
> ant -lib ../lib/JJJRMI.packed-0.4.20.jar -D"j2ee.server.home"=/home/glassfish5/glassfish/

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


### Extended install instructions for CentOS 7

These install instructions are meant to inform the creation of an Ansible Playbook


#### Install NPM

https://linuxize.com/post/how-to-install-node-js-on-centos-7/

```
curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -;
sudo yum install nodejs;
## You may also need development tools to build native addons:
sudo yum install gcc-c++ make;
## To install the Yarn package manager, run:
curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo;
sudo yum install yarn;
npm --version;
node --version;
```

#### Supporting tools
sudo yum install vim wget unzip;
sudo yum install git;

#### Install Java
sudo yum install java-1.8.0-openjdk java-1.8.0-openjdk-headless java-1.8.0-openjdk-devel;

#### Install Ant - Use ant 1.10 instead of CentOS 7 `yum ant` v1.9.x

wget http://muug.ca/mirror/apache-dist//ant/binaries/apache-ant-1.10.5-bin.tar.gz
https://ant.apache.org/manual/install.html




#### Install Glassfish - Quick Start 2019-04-02

Written by a non-Glassfish expert.

Download: <https://www.eclipse.org/downloads/download.php?file=/glassfish/glassfish-5.1.0.zip>

Example: <https://github.com/shinyay/docker-glassfish5/blob/master/latest/Dockerfile>

```
sudo adduser \
  --comment 'Glassfish User' \
  --home-dir /home/glassfish \
  glassfish;


sudo su glassfish -l;

GLASSFISH_VERSION=5.1.0; wget http://eclipse.mirror.rafal.ca/glassfish/glassfish-$GLASSFISH_VERSION.zip && unzip glassfish-$GLASSFISH_VERSION;


sudo su root -l
sudo cat > /etc/systemd/system/glassfish.service << "EOF"
[Unit]
Description = GlassFish Server v5.1
After = syslog.target network.target
[Service]
User=glassfish
ExecStart = /usr/bin/java -jar /home/glassfish/glassfish5/glassfish/lib/client/appserver-cli.jar start-domain
ExecStop = /usr/bin/java -jar /home/glassfish/glassfish5/glassfish/lib/client/appserver-cli.jar stop-domain
ExecReload = /usr/bin/java -jar /home/glassfish/glassfish5/glassfish/lib/client/appserver-cli.jar restart-domain
Type = forking
[Install]
WantedBy = multi-user.target
EOF

sudo systemctl enable glassfish.service;
sudo systemctl start glassfish.service

./glassfish5/bin/asadmin change-admin-password
./glassfish5/bin/asadmin change-admin-password --user admin --interactive=false --passwordfile ./README

AS_ADMIN_PASSWORD=xxxxxxxxxxxxxxxxxx
AS_ADMIN_NEWPASSWORD=xxxxxxxxxxxxxxxxxx

```

#### NERVE

See steps #1-#5 in the Building from Source (i.e., installation) section


#### Add Secure HTTP / WS via LetsEncrypt

References: 
<https://www.amihaiemil.com/2017/10/03/letsencrypt-glassfish-ec2.html>
<https://helpdesk.ssls.com/hc/en-us/articles/115001604071-How-to-install-an-SSL-certificate-on-GlassFish>
<https://docs.oracle.com/cd/E19798-01/821-1751/ghgrp/index.html>

```
EXPORT GLASSFISH_MASTER_PASSWORD=xxxxxxxxxxxxxxxxxx
./glassfish/bin/asadmin change-master-password
from changeit ==> $GLASSFISH_MASTER_PASSWORD
```

The master password should be the same for all keystores.

```
export DOMAIN=nerve.services.cwrc.ca
export LETSENCRYPT=/etc/letsencrypt/live/$DOMAIN
export CERT_ALIAS=letsencryptcrt
export LETSENCRYPT_EMAIL=

sudo yum install epel-release -y
sudo yum install certbot -y

sudo certbot certonly --standalone --agree-tos -m $LETSENCRYPTEMAIL -d $DOMAIN 


sudo openssl pkcs12 -export -in $LETSENCRYPT/fullchain.pem -inkey $LETSENCRYPT/privkey.pem -out pkcs.p12 -name $CERT_ALIAS

export DEST_STORE_PASS=$GLASSFISH_MASTER_PASSWORD;
export DEST_KEY_PASS=$GLASSFISH_MASTER_PASSWORD;
export SRC_STORE_PASS=$GLASSFISH_MASTER_PASSWORD;

keytool -importkeystore \
-deststorepass $DEST_STORE_PASS \
-destkeypass $DEST_KEY_PASS \
-destkeystore letsencrypt.jks \
-srckeystore pkcs.p12 \
-srcstoretype PKCS12 \
-srcstorepass $SRC_STORE_PASS \
-alias $CERT_ALIAS \
;


sudo keytool -importkeystore -srckeystore letsencrypt.jks -destkeystore ~glassfish/glassfish5/glassfish/domains/domain1/config/keystore.jks

```


Edit `glassfish/domains/domain1/config/domain.xml` - section: `http-listener-2`
- alias `http-listerner-2` to $CERT_ALIAS 
- set port

Update [assets/serverlocation](https://github.com/cwrc/NERVE/blob/master/Client/src/assets/serverlocation)
- update asset to wws

Enhancements:
- setup port forward

Note: debugging - `glassfish/domains/domain1/logs/server.log`
Note: Don't do the following: `keytool -storepasswd -keystore ./keystore.jks` as it leaves the keystore in an inconsitant state

