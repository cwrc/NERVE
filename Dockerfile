# NERVE
# build environment

# First draft; rough prototype


######## Stage #1: build
FROM maven:3-jdk-13 AS build_stage

ARG NERVE_NERSCRIBER_SRC

WORKDIR $NERVE_NERSCRIBER_SRC
COPY NERScriber $NERVE_NERSCRIBER_SRC

# cache dependancies
RUN mvn dependency:go-offline

# Run Maven to build Tomcat WAR file
RUN mvn clean package war:war


######## stage #2 Tomcat
FROM tomcat:9

ARG NERVE_NERSCRIBER_TARGET
ARG NERVE_NERSCRIBER_SRC

WORKDIR ${CATALINA_HOME}

# Copy NERVE web application
RUN rm -rf  ${CATALINA_HOME}/webapps/*
COPY --from=build_stage ${NERVE_NERSCRIBER_TARGET}/NERScriber-1.0-SNAPSHOT.war ${CATALINA_HOME}/webapps/ROOT.war  
