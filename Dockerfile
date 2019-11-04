# NERVE
# build environment

# First draft; rough prototype


######## Stage #1: build
FROM maven:3-jdk-13 AS build_stage

WORKDIR /
COPY NERScriber /

# cache dependancies
RUN mvn dependency:go-offline

# Run Maven to build Tomcat WAR file
RUN mvn clean package war:war


######## stage #2 Tomcat
FROM tomcat:9

# Copy NERVE web application
RUN rm -rf  ${CATALINA_HOME}/webapps/*
COPY --from=build_stage ./target/NERScriber-1.0-SNAPSHOT.war ${CATALINA_HOME}/webapps/ROOT.war
