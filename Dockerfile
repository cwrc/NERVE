# NERVE
# build environment

# First draft; rough prototype


######## Stage #1: build

FROM maven:3-jdk-13 AS build_stage

ARG NERVE_SRC=/app
ARG NERVE_NERSCRIBER_SRC=${NERVE_SRC}/NERScriber
ARG NERVE_SERVICE_SRC=${NERVE_SRC}/Service


# copy git repo into the image build
COPY . ${NERVE_SRC} 

# Run Maven to build the NERScriber jar
# cache dependancies
WORKDIR ${NERVE_NERSCRIBER_SRC}
RUN mvn dependency:go-offline
RUN mvn clean install

# Run Maven to build Tomcat WAR file
WORKDIR ${NERVE_SERVICE_SRC}
RUN mvn dependency:go-offline
RUN mvn package war:war


######## stage #2 Tomcat

FROM tomcat:9 AS tomcat_stage

ARG NERVE_SRC=/app
ARG NERVE_SERVICE_SRC=${NERVE_SRC}/Service

# Copy NERVE web application
RUN rm -rf  ${CATALINA_HOME}/webapps/*
COPY --from=build_stage "${NERVE_SERVICE_SRC}/target/Service*.war" "${CATALINA_HOME}/webapps/ROOT.war"
