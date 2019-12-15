# NERVE
# build environment

# First draft; rough prototype


######## Stage #1: build

FROM maven:3-jdk-13 AS build_stage

ARG NERVE_SRC=/app
ARG NERVE_NERSCRIBER_SRC=${NERVE_SRC}/NERScriber
ARG NERVE_SERVICE_SRC=${NERVE_SRC}/Service

# copy pom.xml and cache dependancies
COPY NERScriber/pom.xml ${NERVE_NERSCRIBER_SRC}/pom.xml
WORKDIR ${NERVE_NERSCRIBER_SRC}
RUN mvn dependency:go-offline

# copy git repo into the image build
COPY NERScriber ${NERVE_NERSCRIBER_SRC} 

# Run Maven to build the NERScriber jar
RUN mvn clean install

# copy pom.xml and cache dependancies
COPY Service/pom.xml ${NERVE_SERVICE_SRC}/pom.xml
WORKDIR ${NERVE_SERVICE_SRC}
RUN mvn dependency:go-offline

# copy git repo into the image build
COPY Service ${NERVE_SERVICE_SRC} 

# Run Maven to build Tomcat WAR file
RUN mvn package war:war

######## stage #2 Tomcat

FROM tomcat:9 AS tomcat_stage

ARG NERVE_SRC=/app
ARG NERVE_SERVICE_SRC=${NERVE_SRC}/Service

# Copy NERVE web application
RUN rm -rf  ${CATALINA_HOME}/webapps/*
COPY --from=build_stage "${NERVE_SERVICE_SRC}/target/Service*.war" "${CATALINA_HOME}/webapps/ROOT.war"
